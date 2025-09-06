/**
 * Phase E: Website canon implementation
 * PATCHSET v2025-09-06 — "Do What The Site Says"
 */

export interface LineResult {
  line: string;
  isALine: boolean;
  facePurity: number;
  modulePurity: number;
}

export interface PhaseEState {
  candidates: string[];
  questionBuilt: boolean;
  anchor: string | null;
  decidedAt: number | null;
  source: string | null;
}

export class PhaseEEngine {
  private state: PhaseEState = {
    candidates: [],
    questionBuilt: false,
    anchor: null,
    decidedAt: null,
    source: null
  };

  /**
   * Build candidates according to website canon
   */
  buildCandidates(lines: LineResult[]): string[] {
    // Priority 1: Any A-line with FacePurity = 2.6
    const a26 = lines.filter(l => l.isALine && l.facePurity === 2.6);
    if (a26.length > 0) {
      console.log('🎯 Phase E - Priority 1: A-lines with FacePurity 2.6', a26.map(l => l.line));
      return a26.map(l => l.line);
    }

    // Priority 2: Non-A lines tied at top ModulePurity
    const nonA = lines.filter(l => !l.isALine);
    if (nonA.length === 0) {
      console.warn('⚠️ Phase E - No non-A lines found');
      return [];
    }

    const topPurity = Math.max(...nonA.map(l => l.modulePurity));
    const topCandidates = nonA.filter(l => l.modulePurity === topPurity);
    
    console.log('🎯 Phase E - Priority 2: Non-A lines with top ModulePurity', {
      topPurity,
      candidates: topCandidates.map(l => l.line)
    });

    return topCandidates.map(l => l.line);
  }

  /**
   * Enter Phase E - build candidates and determine if tie-break needed
   */
  enterPhaseE(lines: LineResult[]): PhaseEState {
    if (this.state.questionBuilt) {
      console.log('🎯 Phase E - Already built, returning existing state');
      return this.state;
    }

    console.log('🎯 Phase E - Building candidates from lines:', lines);
    
    const candidates = this.buildCandidates(lines);
    this.state.candidates = candidates;

    if (candidates.length === 1) {
      // Auto-anchor
      this.state.anchor = candidates[0];
      this.state.decidedAt = Date.now();
      this.state.source = 'E:AutoAnchor';
      console.log('🎯 Phase E - Auto-anchor selected:', candidates[0]);
    } else if (candidates.length > 1) {
      // Need tie-break
      console.log('🎯 Phase E - Tie-break needed for candidates:', candidates);
    } else {
      console.warn('⚠️ Phase E - No candidates found');
    }

    this.state.questionBuilt = true;
    return this.state;
  }

  /**
   * Handle tie-break selection
   */
  selectAnchor(selectedLine: string): void {
    if (!this.state.candidates.includes(selectedLine)) {
      throw new Error(`Invalid selection: ${selectedLine} not in candidates`);
    }

    this.state.anchor = selectedLine;
    this.state.decidedAt = Date.now();
    this.state.source = 'E:TieBreak';
    
    console.log('🎯 Phase E - Tie-break selection:', {
      selectedLine,
      candidates: this.state.candidates,
      source: this.state.source
    });
  }

  /**
   * Get current state
   */
  getState(): PhaseEState {
    return { ...this.state };
  }

  /**
   * Check if tie-break is needed
   */
  needsTieBreak(): boolean {
    return this.state.candidates.length > 1 && !this.state.anchor;
  }

  /**
   * Check if anchor is selected
   */
  hasAnchor(): boolean {
    return this.state.anchor !== null;
  }

  /**
   * Get the selected anchor
   */
  getAnchor(): string | null {
    return this.state.anchor;
  }

  /**
   * Reset Phase E state
   */
  reset(): void {
    this.state = {
      candidates: [],
      questionBuilt: false,
      anchor: null,
      decidedAt: null,
      source: null
    };
  }
}

// Singleton instance
export const phaseEEngine = new PhaseEEngine();
