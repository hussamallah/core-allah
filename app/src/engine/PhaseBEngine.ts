/**
 * Phase B Engine - A-lines only
 * 
 * Contract: Exactly 2 picks per A-line, CO1→CO2/CF flow
 * FacePurity computation with fixed formula
 */

import { QuestionSelector, DuelQuestion, LineId } from './QuestionSelector';
import { computeFacePurity } from './VerdictEngine';

export interface PhaseBState {
  currentLineIndex: number;
  selectedALines: string[];
  completedLines: Set<string>;
  linePicks: Map<string, { pick1: 'C' | 'O' | 'F'; pick2: 'C' | 'O' | 'F' }>;
  facePurity: Map<string, number>;
}

export interface PhaseBResult {
  isComplete: boolean;
  currentLine: string | null;
  currentRound: 1 | 2;
  currentType: 'CO' | 'CF';
  currentOrder: 1 | 2;
  question: DuelQuestion | null;
  error: string | null;
}

export class PhaseBEngine {
  private selector: QuestionSelector;
  private state: PhaseBState;

  constructor(selector: QuestionSelector, selectedALines: string[]) {
    this.selector = selector;
    this.state = {
      currentLineIndex: 0,
      selectedALines,
      completedLines: new Set(),
      linePicks: new Map(),
      facePurity: new Map()
    };
  }

  /**
   * Get current state for rendering
   * Contract: Deterministic, no side effects
   */
  getCurrentState(): PhaseBResult {
    if (this.state.completedLines.size === this.state.selectedALines.length) {
      return {
        isComplete: true,
        currentLine: null,
        currentRound: 2,
        currentType: 'CO',
        currentOrder: 2,
        question: null,
        error: null
      };
    }

    const currentLine = this.state.selectedALines[this.state.currentLineIndex];
    const picks = this.state.linePicks.get(currentLine);
    
    if (!picks) {
      // Round 1: CO
      const question = this.selector.selectDuelQuestion(currentLine, 'CO', 1);
      if (!question) {
        return {
          isComplete: false,
          currentLine,
          currentRound: 1,
          currentType: 'CO',
          currentOrder: 1,
          question: null,
          error: `Missing question for ${currentLine} Round 1; fix bank or restart.`
        };
      }

      return {
        isComplete: false,
        currentLine,
        currentRound: 1,
        currentType: 'CO',
        currentOrder: 1,
        question,
        error: null
      };
    }

    // Round 2: CO or CF based on Round 1
    const type: 'CO' | 'CF' = picks.pick1 === 'O' ? 'CF' : 'CO';
    const question = this.selector.selectDuelQuestion(currentLine, type, 2);
    
    if (!question) {
      return {
        isComplete: false,
        currentLine,
        currentRound: 2,
        currentType: type,
        currentOrder: 2,
        question: null,
        error: `Missing question for ${currentLine} Round 2; fix bank or restart.`
      };
    }

    return {
      isComplete: false,
      currentLine,
      currentRound: 2,
      currentType: type,
      currentOrder: 2,
      question,
      error: null
    };
  }

  /**
   * Record pick and advance state
   * Contract: Immutable state updates, exact flow control
   */
  recordPick(pick: 'C' | 'O' | 'F', questionId: string): void {
    const currentLine = this.state.selectedALines[this.state.currentLineIndex];
    const picks = this.state.linePicks.get(currentLine);
    
    if (!picks) {
      // Round 1: Record first pick
      this.state.linePicks.set(currentLine, { pick1: pick, pick2: 'C' }); // Dummy for now
      this.selector.recordPick('B', currentLine, 'CO1', pick, questionId);
    } else {
      // Round 2: Record second pick and compute purity
      this.state.linePicks.set(currentLine, { pick1: picks.pick1, pick2: pick });
      
      const type: 'CO' | 'CF' = picks.pick1 === 'O' ? 'CF' : 'CO';
      const decisionType = type === 'CF' ? 'CF' : 'CO2';
      
      this.selector.recordPick('B', currentLine, decisionType, pick, questionId);
      
      // Compute face purity
      const purity = computeFacePurity(picks.pick1, pick);
      this.state.facePurity.set(currentLine, purity);
      
      // Mark line as complete
      this.state.completedLines.add(currentLine);
      
      // Move to next line
      this.state.currentLineIndex++;
    }
  }

  /**
   * Get face purity for a line
   * Contract: Only available after both picks are recorded
   */
  getFacePurity(lineId: string): number | null {
    return this.state.facePurity.get(lineId) || null;
  }

  /**
   * Get all face purities
   */
  getAllFacePurities(): Map<string, number> {
    return new Map(this.state.facePurity);
  }

  /**
   * Check if phase is complete
   */
  isComplete(): boolean {
    return this.state.completedLines.size === this.state.selectedALines.length;
  }

  /**
   * Get progress info
   */
  getProgress(): { completed: number; total: number } {
    return {
      completed: this.state.completedLines.size,
      total: this.state.selectedALines.length
    };
  }

  /**
   * Get debug info for QA
   */
  getDebugInfo(): {
    currentLine: string | null;
    completedLines: string[];
    linePicks: Array<{ lineId: string; pick1: string; pick2: string; purity: number | null }>;
  } {
    const linePicks = Array.from(this.state.linePicks.entries()).map(([lineId, picks]) => ({
      lineId,
      pick1: picks.pick1,
      pick2: picks.pick2,
      purity: this.state.facePurity.get(lineId) || null
    }));

    return {
      currentLine: this.state.selectedALines[this.state.currentLineIndex] || null,
      completedLines: Array.from(this.state.completedLines),
      linePicks
    };
  }
}
