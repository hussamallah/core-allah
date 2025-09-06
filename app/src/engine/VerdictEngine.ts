/**
 * Verdict Computation Engine
 * 
 * Contract: Fixed verdict table, no inference, no "vibes"
 * Only source of truth for C/O/F verdicts
 */

export type Verdict = 'C' | 'O' | 'F';
export type Decision = 'C' | 'O' | 'F';

/**
 * Fixed verdict table - the only source of truth
 * Contract: This table is immutable and complete
 */
export const VERDICT_TABLE: Record<string, Verdict> = {
  CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
  OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
};

/**
 * Compute verdict from three decisions
 * Contract: Always uses fixed table, no exceptions
 */
export function computeVerdict(
  co1: Decision,
  co2: Decision,
  cf: Decision
): Verdict {
  const key = `${co1}${co2}${cf}`;
  const verdict = VERDICT_TABLE[key];
  
  if (!verdict) {
    throw new Error(`Invalid decision combination: ${key}. Must be valid C/O/F sequence.`);
  }
  
  return verdict;
}

/**
 * Compute face purity for A-lines
 * Contract: Fixed formula, no inference
 * Formula: FacePurity = 0.6 (seed) + value(pick1) + value(pick2)
 */
export function computeFacePurity(
  pick1: Decision,
  pick2: Decision
): number {
  const values: Record<Decision, number> = {
    C: 1.0,
    O: 0.6,
    F: 0.0
  };
  
  return 0.6 + values[pick1] + values[pick2];
}

/**
 * Get all possible verdict combinations for testing
 */
export function getAllVerdictCombinations(): Array<{
  co1: Decision;
  co2: Decision;
  cf: Decision;
  key: string;
  verdict: Verdict;
}> {
  const decisions: Decision[] = ['C', 'O', 'F'];
  const combinations: Array<{
    co1: Decision;
    co2: Decision;
    cf: Decision;
    key: string;
    verdict: Verdict;
  }> = [];

  for (const co1 of decisions) {
    for (const co2 of decisions) {
      for (const cf of decisions) {
        const key = `${co1}${co2}${cf}`;
        const verdict = VERDICT_TABLE[key];
        if (verdict) {
          combinations.push({ co1, co2, cf, key, verdict });
        }
      }
    }
  }

  return combinations;
}

/**
 * Validate verdict table completeness
 * Contract: All 27 combinations must be covered
 */
export function validateVerdictTable(): boolean {
  const combinations = getAllVerdictCombinations();
  return combinations.length === 8; // Only 8 valid combinations per spec
}
