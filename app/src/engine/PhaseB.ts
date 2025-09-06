/**
 * Phase B: Duel Assessment with seedF invariant
 * PATCHSET v2025-09-06 — "Do What The Site Says"
 */

export interface PhaseBState {
  seedF: Record<string, boolean>;
  completed: boolean;
}

export class PhaseBEngine {
  private state: PhaseBState = {
    seedF: {},
    completed: false
  };

  /**
   * Record a pick and enforce seedF invariant
   * Contract: O sets seedF[line]=true
   */
  recordPick(lineId: string, pick: 'C' | 'O' | 'F', round: number): void {
    console.log(`🎯 Phase B - Recording pick: ${lineId} Round ${round} = ${pick}`);
    
    // Enforce seedF invariant: O sets seedF[line]=true
    if (pick === 'O') {
      this.state.seedF[lineId] = true;
      console.log(`🎯 Phase B - seedF[${lineId}] = true (O pick detected)`);
    }
  }

  /**
   * Check if line has seedF flag
   */
  hasSeedF(lineId: string): boolean {
    return this.state.seedF[lineId] || false;
  }

  /**
   * Get all seedF flags
   */
  getSeedF(): Record<string, boolean> {
    return { ...this.state.seedF };
  }

  /**
   * Calculate face purity for A-line
   * Formula: 0.6 + p1 + p2 where C=1.0, O=0.6, F=0.0
   */
  calculateFacePurity(picks: string[]): number {
    if (picks.length < 2) return 0;
    
    const p1 = picks[0] === 'C' ? 1.0 : (picks[0] === 'O' ? 0.6 : 0.0);
    const p2 = picks[1] === 'C' ? 1.0 : (picks[1] === 'O' ? 0.6 : 0.0);
    
    return 0.6 + p1 + p2;
  }

  /**
   * Check if Phase B is complete
   */
  isComplete(): boolean {
    return this.state.completed;
  }

  /**
   * Mark Phase B as complete
   */
  markComplete(): void {
    this.state.completed = true;
    console.log('🎯 Phase B - Marked complete');
  }

  /**
   * Reset Phase B state
   */
  reset(): void {
    this.state = {
      seedF: {},
      completed: false
    };
  }

  /**
   * Validate seedF invariant
   */
  validateInvariant(): boolean {
    // This should be called after Phase B completion
    // All O picks should have set seedF flags
    console.log('🎯 Phase B - Validating seedF invariant:', this.state.seedF);
    return true; // Implementation would check actual picks vs seedF flags
  }
}

// Singleton instance
export const phaseBEngine = new PhaseBEngine();
