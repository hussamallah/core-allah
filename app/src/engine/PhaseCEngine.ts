/**
 * Phase C Engine - Non-A lines only
 * 
 * Contract: Exactly 3 picks per line, CO1→CO2→CF flow
 * Verdict computation with fixed table
 * Severity gating for F verdicts
 */

import { QuestionSelector, ModuleQuestion, SeverityProbeQuestion, LineId } from './QuestionSelector';
import { computeVerdict, Verdict } from './VerdictEngine';

export interface PhaseCState {
  currentLineIndex: number;
  nonALines: string[];
  completedLines: Set<string>;
  lineDecisions: Map<string, { co1: 'C' | 'O' | 'F'; co2: 'C' | 'O' | 'F'; cf: 'C' | 'O' | 'F' }>;
  lineVerdicts: Map<string, Verdict>;
  lineSeverity: Map<string, { level: 'high' | 'mid' | 'low'; score: number }>;
  pendingSeverity: string | null;
}

export interface PhaseCResult {
  isComplete: boolean;
  currentLine: string | null;
  currentDecision: 'CO1' | 'CO2' | 'CF';
  currentType: 'CO' | 'CF';
  currentOrder: 1 | 2 | 3;
  question: ModuleQuestion | null;
  severityQuestion: SeverityProbeQuestion | null;
  error: string | null;
}

export class PhaseCEngine {
  private selector: QuestionSelector;
  private state: PhaseCState;

  constructor(selector: QuestionSelector, nonALines: string[]) {
    this.selector = selector;
    this.state = {
      currentLineIndex: 0,
      nonALines,
      completedLines: new Set(),
      lineDecisions: new Map(),
      lineVerdicts: new Map(),
      lineSeverity: new Map(),
      pendingSeverity: null
    };
  }

  /**
   * Get current state for rendering
   * Contract: Deterministic, no side effects
   */
  getCurrentState(): PhaseCResult {
    // Check for pending severity first
    if (this.state.pendingSeverity) {
      const severityQuestion = this.selector.getSeverityProbe(this.state.pendingSeverity);
      if (!severityQuestion) {
        return {
          isComplete: false,
          currentLine: null,
          currentDecision: 'CF',
          currentType: 'CF',
          currentOrder: 3,
          question: null,
          severityQuestion: null,
          error: `Missing severity probe for ${this.state.pendingSeverity}; fix bank.`
        };
      }

      return {
        isComplete: false,
        currentLine: this.state.pendingSeverity,
        currentDecision: 'CF',
        currentType: 'CF',
        currentOrder: 3,
        question: null,
        severityQuestion,
        error: null
      };
    }

    // Check if all lines are complete
    if (this.state.completedLines.size === this.state.nonALines.length) {
      return {
        isComplete: true,
        currentLine: null,
        currentDecision: 'CF',
        currentType: 'CF',
        currentOrder: 3,
        question: null,
        severityQuestion: null,
        error: null
      };
    }

    const currentLine = this.state.nonALines[this.state.currentLineIndex];
    const decisions = this.state.lineDecisions.get(currentLine);
    
    if (!decisions) {
      // CO1
      const question = this.selector.selectModuleQuestion(currentLine, 'CO', 1);
      if (!question) {
        return {
          isComplete: false,
          currentLine,
          currentDecision: 'CO1',
          currentType: 'CO',
          currentOrder: 1,
          question: null,
          severityQuestion: null,
          error: `Missing question for ${currentLine} CO1; fix bank or restart.`
        };
      }

      return {
        isComplete: false,
        currentLine,
        currentDecision: 'CO1',
        currentType: 'CO',
        currentOrder: 1,
        question,
        severityQuestion: null,
        error: null
      };
    }

    if (!decisions.co2) {
      // CO2
      const question = this.selector.selectModuleQuestion(currentLine, 'CO', 2);
      if (!question) {
        return {
          isComplete: false,
          currentLine,
          currentDecision: 'CO2',
          currentType: 'CO',
          currentOrder: 2,
          question: null,
          severityQuestion: null,
          error: `Missing question for ${currentLine} CO2; fix bank or restart.`
        };
      }

      return {
        isComplete: false,
        currentLine,
        currentDecision: 'CO2',
        currentType: 'CO',
        currentOrder: 2,
        question,
        severityQuestion: null,
        error: null
      };
    }

    if (!decisions.cf) {
      // CF
      const question = this.selector.selectModuleQuestion(currentLine, 'CF', 3);
      if (!question) {
        return {
          isComplete: false,
          currentLine,
          currentDecision: 'CF',
          currentType: 'CF',
          currentOrder: 3,
          question: null,
          severityQuestion: null,
          error: `Missing question for ${currentLine} CF; fix bank or restart.`
        };
      }

      return {
        isComplete: false,
        currentLine,
        currentDecision: 'CF',
        currentType: 'CF',
        currentOrder: 3,
        question,
        severityQuestion: null,
        error: null
      };
    }

    // This should not happen
    return {
      isComplete: false,
      currentLine: null,
      currentDecision: 'CF',
      currentType: 'CF',
      currentOrder: 3,
      question: null,
      severityQuestion: null,
      error: 'Invalid state: all decisions recorded but not complete'
    };
  }

  /**
   * Record pick and advance state
   * Contract: Immutable state updates, exact flow control
   */
  recordPick(pick: 'C' | 'O' | 'F', questionId: string): void {
    const currentLine = this.state.nonALines[this.state.currentLineIndex];
    const decisions = this.state.lineDecisions.get(currentLine) || { co1: 'C', co2: 'C', cf: 'C' };
    
    if (!decisions.co1 || decisions.co1 === 'C') {
      // CO1
      this.state.lineDecisions.set(currentLine, { ...decisions, co1: pick });
      this.selector.recordPick('C', currentLine, 'CO1', pick, questionId);
    } else if (!decisions.co2 || decisions.co2 === 'C') {
      // CO2
      this.state.lineDecisions.set(currentLine, { ...decisions, co2: pick });
      this.selector.recordPick('C', currentLine, 'CO2', pick, questionId);
    } else if (!decisions.cf || decisions.cf === 'C') {
      // CF
      this.state.lineDecisions.set(currentLine, { ...decisions, cf: pick });
      this.selector.recordPick('C', currentLine, 'CF', pick, questionId);
      
      // Compute verdict
      const verdict = computeVerdict(decisions.co1, decisions.co2, pick);
      this.state.lineVerdicts.set(currentLine, verdict);
      
      // Record verdict
      const key = `${decisions.co1}${decisions.co2}${pick}`;
      this.selector.recordVerdict(currentLine, key, verdict);
      
      // Check if severity is needed
      if (verdict === 'F') {
        this.state.pendingSeverity = currentLine;
      } else {
        // Move to next line
        this.state.completedLines.add(currentLine);
        this.state.currentLineIndex++;
      }
    }
  }

  /**
   * Record severity selection
   * Contract: Only for F verdicts, blocks progression until completed
   */
  recordSeverity(level: 'high' | 'mid' | 'low', score: number): void {
    if (!this.state.pendingSeverity) {
      throw new Error('No pending severity selection');
    }

    const lineId = this.state.pendingSeverity;
    this.state.lineSeverity.set(lineId, { level, score });
    this.selector.recordSeveritySelect(lineId, level, score);
    
    // Clear pending severity and move to next line
    this.state.pendingSeverity = null;
    this.state.completedLines.add(lineId);
    this.state.currentLineIndex++;
  }

  /**
   * Get verdict for a line
   */
  getVerdict(lineId: string): Verdict | null {
    return this.state.lineVerdicts.get(lineId) || null;
  }

  /**
   * Get severity for a line
   */
  getSeverity(lineId: string): { level: 'high' | 'mid' | 'low'; score: number } | null {
    return this.state.lineSeverity.get(lineId) || null;
  }

  /**
   * Get all verdicts
   */
  getAllVerdicts(): Map<string, Verdict> {
    return new Map(this.state.lineVerdicts);
  }

  /**
   * Check if phase is complete
   */
  isComplete(): boolean {
    return this.state.completedLines.size === this.state.nonALines.length && !this.state.pendingSeverity;
  }

  /**
   * Get progress info
   */
  getProgress(): { completed: number; total: number } {
    return {
      completed: this.state.completedLines.size,
      total: this.state.nonALines.length
    };
  }

  /**
   * Get debug info for QA
   */
  getDebugInfo(): {
    currentLine: string | null;
    completedLines: string[];
    lineDecisions: Array<{
      lineId: string;
      co1: string;
      co2: string;
      cf: string;
      verdict: Verdict | null;
      severity: { level: string; score: number } | null;
    }>;
    pendingSeverity: string | null;
  } {
    const lineDecisions = Array.from(this.state.lineDecisions.entries()).map(([lineId, decisions]) => ({
      lineId,
      co1: decisions.co1,
      co2: decisions.co2,
      cf: decisions.cf,
      verdict: this.state.lineVerdicts.get(lineId) || null,
      severity: this.state.lineSeverity.get(lineId) || null
    }));

    return {
      currentLine: this.state.nonALines[this.state.currentLineIndex] || null,
      completedLines: Array.from(this.state.completedLines),
      lineDecisions,
      pendingSeverity: this.state.pendingSeverity
    };
  }
}
