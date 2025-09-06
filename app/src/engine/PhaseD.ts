/**
 * Phase D: Compute-only with deterministic verdict table
 * PATCHSET v2025-09-06 — "Do What The Site Says"
 */

export interface VerdictResult {
  lineId: string;
  verdict: 'C' | 'O' | 'F';
  facePurity?: number;
  modulePurity?: number;
  needsSeverity?: boolean;
}

export interface PhaseDState {
  verdicts: VerdictResult[];
  computed: boolean;
}

export class PhaseDEngine {
  private state: PhaseDState = {
    verdicts: [],
    computed: false
  };

  /**
   * Deterministic verdict table
   */
  private readonly VERDICT_TABLE: Record<string, 'C' | 'O' | 'F'> = {
    'CCC': 'C',
    'CCF': 'O', 
    'COC': 'O',
    'COF': 'F',
    'OCC': 'O',
    'OCF': 'F',
    'OOC': 'O',
    'OOF': 'F'
  };

  /**
   * Compute verdicts for all lines
   */
  computeVerdicts(lines: any[]): VerdictResult[] {
    if (this.state.computed) {
      console.log('🎯 Phase D - Already computed, returning existing verdicts');
      return this.state.verdicts;
    }

    console.log('🎯 Phase D - Computing verdicts for all lines');
    
    const verdicts: VerdictResult[] = [];

    lines.forEach(line => {
      if (line.selectedA) {
        // A-lines: use Phase B picks
        const picks = line.B.picks;
        if (picks.length >= 2) {
          const p1 = picks[0] === 'F' ? 'O' : picks[0]; // Convert F to O
          const p2 = picks[1] === 'F' ? 'O' : picks[1]; // Convert F to O
          
          // A-line verdict: if both picks are C, verdict is C; otherwise O
          const verdict = (p1 === 'C' && p2 === 'C') ? 'C' : 'O';
          const facePurity = 0.6 + (p1 === 'C' ? 1.0 : 0.6) + (p2 === 'C' ? 1.0 : 0.6);
          
          verdicts.push({
            lineId: line.id,
            verdict,
            facePurity,
            needsSeverity: false
          });
        }
      } else {
        // Non-A lines: use Phase C decisions
        const decisions = line.mod.decisions;
        if (decisions.length >= 3) {
          const by = Object.fromEntries(decisions.map((d: any) => [d.type, d.pick]));
          const key = `${by.CO1 || ''}${by.CO2 || ''}${by.CF || ''}`;
          const verdict = this.VERDICT_TABLE[key] || 'O';
          
          // Calculate module purity
          let modulePurity = 0;
          decisions.forEach((decision: any) => {
            if (decision.type === 'CO1' || decision.type === 'CO2') {
              if (decision.pick === 'C') modulePurity += 1.0;
              else if (decision.pick === 'O') modulePurity -= 1.0;
            } else if (decision.type === 'CF') {
              if (decision.pick === 'C') modulePurity += 1.6;
              else if (decision.pick === 'F') modulePurity -= 1.6;
            }
          });
          
          verdicts.push({
            lineId: line.id,
            verdict,
            modulePurity,
            needsSeverity: verdict === 'F'
          });
        }
      }
    });

    this.state.verdicts = verdicts;
    this.state.computed = true;

    console.log('🎯 Phase D - Verdicts computed:', verdicts);
    return verdicts;
  }

  /**
   * Get computed verdicts
   */
  getVerdicts(): VerdictResult[] {
    return [...this.state.verdicts];
  }

  /**
   * Check if verdicts have been computed
   */
  isComputed(): boolean {
    return this.state.computed;
  }

  /**
   * Get verdicts that need severity assessment
   */
  getSeverityVerdicts(): VerdictResult[] {
    return this.state.verdicts.filter(v => v.needsSeverity);
  }

  /**
   * Get verdict count
   */
  getVerdictCount(): number {
    return this.state.verdicts.length;
  }

  /**
   * Reset Phase D state
   */
  reset(): void {
    this.state = {
      verdicts: [],
      computed: false
    };
  }
}

// Singleton instance
export const phaseDEngine = new PhaseDEngine();
