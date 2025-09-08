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
  computeVerdicts(lines: any[], sifEngine?: any): VerdictResult[] {
    if (this.state.computed) {
      console.log('🎯 Phase D - Already computed, returning existing verdicts');
      return this.state.verdicts;
    }

    console.log('🎯 Phase D - Computing verdicts for all lines');
    console.log('📊 Input lines:', lines.map(l => ({ 
      id: l.id, 
      selectedA: l.selectedA, 
      bPicks: l.B?.picks, 
      modDecisions: l.mod?.decisions 
    })));
    
    const verdicts: VerdictResult[] = [];

    lines.forEach(line => {
      if (line.selectedA) {
        // A-lines: use Phase B picks
        const picks = line.B.picks;
        console.log(`🔍 A-line ${line.id}: Phase B picks = [${picks.join(', ')}]`);
        
        if (picks.length >= 2) {
          const p1 = picks[0] === 'F' ? 'O' : picks[0]; // Convert F to O
          const p2 = picks[1] === 'F' ? 'O' : picks[1]; // Convert F to O
          
          console.log(`  → Converted picks: [${p1}, ${p2}] (F→O conversion applied)`);
          
          // A-line verdict: if both picks are C, verdict is C; otherwise O
          const verdict = (p1 === 'C' && p2 === 'C') ? 'C' : 'O';
          const facePurity = 0.6 + (p1 === 'C' ? 1.0 : 0.6) + (p2 === 'C' ? 1.0 : 0.6);
          
          console.log(`  → Verdict: ${verdict} (${p1 === 'C' && p2 === 'C' ? 'Both C = C' : 'Not both C = O'})`);
          console.log(`  → Face Purity: ${facePurity} (base: 0.6 + ${p1 === 'C' ? '1.0' : '0.6'} + ${p2 === 'C' ? '1.0' : '0.6'})`);
          
          verdicts.push({
            lineId: line.id,
            verdict,
            facePurity,
            needsSeverity: false
          });
        } else {
          console.warn(`⚠️ A-line ${line.id}: Insufficient Phase B picks (${picks.length})`);
        }
      } else {
        // Non-A lines: use Phase C decisions
        const decisions = line.mod.decisions;
        console.log(`🔍 Module line ${line.id}: Phase C decisions =`, decisions);
        
        if (decisions.length >= 3) {
          const by = Object.fromEntries(decisions.map((d: any) => [d.type, d.pick]));
          const key = `${by.CO1 || ''}${by.CO2 || ''}${by.CF || ''}`;
          const verdict = this.VERDICT_TABLE[key] || 'O';
          
          console.log(`  → Decision mapping: CO1=${by.CO1}, CO2=${by.CO2}, CF=${by.CF}`);
          console.log(`  → Verdict key: "${key}" → ${verdict} (from VERDICT_TABLE)`);
          
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
          
          console.log(`  → Module Purity: ${modulePurity} (CO1:${by.CO1}→${by.CO1 === 'C' ? '+1.0' : by.CO1 === 'O' ? '-1.0' : '0'}, CO2:${by.CO2}→${by.CO2 === 'C' ? '+1.0' : by.CO2 === 'O' ? '-1.0' : '0'}, CF:${by.CF}→${by.CF === 'C' ? '+1.6' : by.CF === 'F' ? '-1.6' : '0'})`);
          console.log(`  → Needs Severity: ${verdict === 'F'}`);
          
          // If verdict is F, check if we have severity probe results
          let finalVerdict = verdict;
          if (verdict === 'F' && sifEngine) {
            const severityValue = sifEngine.getCounters()?.sevF?.[line.id] || 0;
            console.log(`  → Severity Probe Result for ${line.id}: ${severityValue}`);
            
            if (severityValue > 0) {
              // Use severity probe result to determine final verdict
              if (severityValue === 1) {
                finalVerdict = 'F'; // F1 = Full F
                console.log(`  → Final Verdict: F (F1 severity)`);
              } else if (severityValue === 0.5) {
                finalVerdict = 'O'; // F0.5 = Downgrade to O
                console.log(`  → Final Verdict: O (F0.5 severity - downgraded)`);
              } else {
                finalVerdict = 'O'; // F0 = Downgrade to O
                console.log(`  → Final Verdict: O (F0 severity - downgraded)`);
              }
            } else {
              console.log(`  → No severity probe result found, keeping F verdict`);
            }
          }
          
          verdicts.push({
            lineId: line.id,
            verdict: finalVerdict,
            modulePurity,
            needsSeverity: verdict === 'F' && finalVerdict === 'F'
          });
        } else {
          console.warn(`⚠️ Module line ${line.id}: Insufficient Phase C decisions (${decisions.length})`);
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
   * Get verdict for a specific line
   */
  getVerdictForLine(lineId: string): VerdictResult | null {
    return this.state.verdicts.find(v => v.lineId === lineId) || null;
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
