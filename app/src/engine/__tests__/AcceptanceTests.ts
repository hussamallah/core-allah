/**
 * Acceptance Tests for Quiz Engine
 * 
 * Contract: Minimum tests to declare "working"
 * - Routing: Verify selector returns questions in order, never repeats
 * - Verdict table: All 8 permutations match the table
 * - Severity gate: F verdicts block progression until severity selected
 * - Determinism: Same answers produce identical results
 * - Exhaustion error: Missing questions show clear error
 */

import { QuestionSelector } from '../QuestionSelector';
import { PhaseBEngine } from '../PhaseBEngine';
import { PhaseCEngine } from '../PhaseCEngine';
import { computeVerdict, getAllVerdictCombinations, validateVerdictTable } from '../VerdictEngine';

// Test data
const mockModuleQuestions = [
  {
    id: 'C-CTRL-01-CO',
    phase: 'C' as const,
    lineId: 'Control',
    type: 'CO' as const,
    order: 1 as const,
    prompt: 'Test CO1 question',
    options: { A: 'Option A', B: 'Option B' },
    mappings: { A: 'C', B: 'O' }
  },
  {
    id: 'C-CTRL-02-CO',
    phase: 'C' as const,
    lineId: 'Control',
    type: 'CO' as const,
    order: 2 as const,
    prompt: 'Test CO2 question',
    options: { A: 'Option A', B: 'Option B' },
    mappings: { A: 'C', B: 'O' }
  },
  {
    id: 'C-CTRL-03-CF',
    phase: 'C' as const,
    lineId: 'Control',
    type: 'CF' as const,
    order: 3 as const,
    prompt: 'Test CF question',
    options: { A: 'Option A', B: 'Option B' },
    mappings: { A: 'C', B: 'F' }
  }
];

const mockDuelQuestions = [
  {
    id: 'B-CTRL-01-CO',
    phase: 'B' as const,
    lineId: 'Control',
    type: 'CO' as const,
    order: 1 as const,
    prompt: 'Test Round 1 question',
    options: { A: 'Option A', B: 'Option B' },
    mappings: { A: 'C', B: 'O' }
  },
  {
    id: 'B-CTRL-02-CF',
    phase: 'B' as const,
    lineId: 'Control',
    type: 'CF' as const,
    order: 2 as const,
    prompt: 'Test Round 2 question',
    options: { A: 'Option A', B: 'Option B' },
    mappings: { A: 'C', B: 'F' }
  }
];

const mockSeverityQuestions = [
  {
    id: 'C-SEV-CTRL',
    phase: 'C' as const,
    lineId: 'Control',
    prompt: 'Test severity question',
    options: { A: 'High', B: 'Mid', C: 'Low' },
    mappings: { A: 'F1', B: 'F0.5', C: 'F0' }
  }
];

export class AcceptanceTests {
  private selector: QuestionSelector;
  private phaseBEngine: PhaseBEngine;
  private phaseCEngine: PhaseCEngine;

  constructor() {
    this.selector = new QuestionSelector(mockModuleQuestions, mockDuelQuestions, mockSeverityQuestions);
    this.phaseBEngine = new PhaseBEngine(this.selector, ['Control']);
    this.phaseCEngine = new PhaseCEngine(this.selector, ['Control']);
  }

  /**
   * Test 1: Routing - Verify selector returns questions in order, never repeats
   */
  testRouting(): boolean {
    console.log('🧪 Testing routing...');
    
    // Test module questions
    const q1 = this.selector.selectModuleQuestion('Control', 'CO', 1);
    const q2 = this.selector.selectModuleQuestion('Control', 'CO', 2);
    const q3 = this.selector.selectModuleQuestion('Control', 'CF', 3);
    
    if (!q1 || !q2 || !q3) {
      console.error('❌ Failed: Missing questions');
      return false;
    }
    
    if (q1.id !== 'C-CTRL-01-CO' || q2.id !== 'C-CTRL-02-CO' || q3.id !== 'C-CTRL-03-CF') {
      console.error('❌ Failed: Wrong question order');
      return false;
    }
    
    // Test that questions are marked as used
    const q1Again = this.selector.selectModuleQuestion('Control', 'CO', 1);
    if (q1Again) {
      console.error('❌ Failed: Question not marked as used');
      return false;
    }
    
    console.log('✅ Routing test passed');
    return true;
  }

  /**
   * Test 2: Verdict table - All 8 permutations match the table
   */
  testVerdictTable(): boolean {
    console.log('🧪 Testing verdict table...');
    
    if (!validateVerdictTable()) {
      console.error('❌ Failed: Verdict table validation');
      return false;
    }
    
    const combinations = getAllVerdictCombinations();
    const expectedResults = {
      'CCC': 'C', 'CCF': 'O', 'COC': 'O', 'COF': 'F',
      'OCC': 'O', 'OCF': 'F', 'OOC': 'O', 'OOF': 'F'
    };
    
    for (const combo of combinations) {
      const expected = expectedResults[combo.key as keyof typeof expectedResults];
      if (combo.verdict !== expected) {
        console.error(`❌ Failed: ${combo.key} should be ${expected}, got ${combo.verdict}`);
        return false;
      }
    }
    
    console.log('✅ Verdict table test passed');
    return true;
  }

  /**
   * Test 3: Severity gate - F verdicts block progression until severity selected
   */
  testSeverityGate(): boolean {
    console.log('🧪 Testing severity gate...');
    
    // Record CO1 and CO2 as C, CF as F (should trigger severity)
    this.phaseCEngine.recordPick('C', 'C-CTRL-01-CO');
    this.phaseCEngine.recordPick('C', 'C-CTRL-02-CO');
    this.phaseCEngine.recordPick('F', 'C-CTRL-03-CF');
    
    const state = this.phaseCEngine.getCurrentState();
    if (!state.severityQuestion) {
      console.error('❌ Failed: Severity question not triggered for F verdict');
      return false;
    }
    
    if (state.isComplete) {
      console.error('❌ Failed: Phase should not be complete with pending severity');
      return false;
    }
    
    // Record severity selection
    this.phaseCEngine.recordSeverity('high', 1.0);
    
    const finalState = this.phaseCEngine.getCurrentState();
    if (!finalState.isComplete) {
      console.error('❌ Failed: Phase should be complete after severity selection');
      return false;
    }
    
    console.log('✅ Severity gate test passed');
    return true;
  }

  /**
   * Test 4: Determinism - Same answers produce identical results
   */
  testDeterminism(): boolean {
    console.log('🧪 Testing determinism...');
    
    // Create two identical engines
    const selector1 = new QuestionSelector(mockModuleQuestions, mockDuelQuestions, mockSeverityQuestions);
    const selector2 = new QuestionSelector(mockModuleQuestions, mockDuelQuestions, mockSeverityQuestions);
    
    const engine1 = new PhaseBEngine(selector1, ['Control']);
    const engine2 = new PhaseBEngine(selector2, ['Control']);
    
    // Record same picks in both engines
    engine1.recordPick('C', 'B-CTRL-01-CO');
    engine1.recordPick('O', 'B-CTRL-02-CF');
    
    engine2.recordPick('C', 'B-CTRL-01-CO');
    engine2.recordPick('O', 'B-CTRL-02-CF');
    
    // Check that results are identical
    const purity1 = engine1.getFacePurity('Control');
    const purity2 = engine2.getFacePurity('Control');
    
    if (purity1 !== purity2) {
      console.error('❌ Failed: Different purity values for same inputs');
      return false;
    }
    
    if (purity1 !== 2.2) { // C=1.0, O=0.6, so 0.6 + 1.0 + 0.6 = 2.2
      console.error('❌ Failed: Wrong purity calculation');
      return false;
    }
    
    console.log('✅ Determinism test passed');
    return true;
  }

  /**
   * Test 5: Exhaustion error - Missing questions show clear error
   */
  testExhaustionError(): boolean {
    console.log('🧪 Testing exhaustion error...');
    
    // Create engine with empty question bank
    const emptySelector = new QuestionSelector([], [], []);
    const emptyEngine = new PhaseCEngine(emptySelector, ['Control']);
    
    const state = emptyEngine.getCurrentState();
    if (!state.error || !state.error.includes('Missing question')) {
      console.error('❌ Failed: No error message for missing question');
      return false;
    }
    
    console.log('✅ Exhaustion error test passed');
    return true;
  }

  /**
   * Run all acceptance tests
   */
  runAllTests(): boolean {
    console.log('🚀 Running all acceptance tests...\n');
    
    const tests = [
      () => this.testRouting(),
      () => this.testVerdictTable(),
      () => this.testSeverityGate(),
      () => this.testDeterminism(),
      () => this.testExhaustionError()
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
      try {
        if (test()) {
          passed++;
        }
      } catch (error) {
        console.error('❌ Test failed with error:', error);
      }
    }
    
    console.log(`\n📊 Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All acceptance tests passed! Engine is working correctly.');
      return true;
    } else {
      console.log('💥 Some tests failed. Engine needs fixes.');
      return false;
    }
  }
}

// Export for use in other files
export function runAcceptanceTests(): boolean {
  const tests = new AcceptanceTests();
  return tests.runAllTests();
}
