/**
 * SIF Mapping Test Utilities
 * 
 * Tests the new effect-based mapping to ensure O/F choices credit external faces correctly.
 */

import { SIFEngine } from '@/engine/SIFEngine';
import { validateSIFMapping, logValidationResults } from './sifValidation';

/**
 * Sample question from unified_question_pool_v1.json for testing
 */
const sampleQuestion = {
  id: "CTRL-001",
  family: "Control",
  type: "CO1",
  prompt: "The group hesitates without direction, time is slipping, and everyone looks to you to declare the next step clearly and quickly.",
  options: [
    {
      key: "A",
      label: "Decide firmly, announce the action, and align everyone to move together now.",
      pick: "C",
      c_flavor: "Sovereign",
      effects: {
        famC: ["Control"],
        famO: [],
        famF: [],
        faceC: ["Control:Sovereign"],
        faceO: [],
        faceF: []
      }
    },
    {
      key: "B",
      label: "Facilitate a brief round of input to cool tensions, then suggest a workable start point.",
      pick: "O",
      o_subtype: "consensus_wait",
      effects: {
        famC: [],
        famO: ["Control"],
        famF: [],
        faceC: [],
        faceO: ["Recognition:Diplomat"], // ✅ External face
        faceF: []
      }
    },
    {
      key: "C",
      label: "Stay silent to preserve harmony, hoping someone else decides so nobody feels pushed.",
      pick: "F",
      f_flavor: "harmony_preserve",
      effects: {
        famC: [],
        famO: [],
        famF: ["Control"],
        faceC: [],
        faceO: [],
        faceF: ["Bonding:Partner"] // ✅ External face
      }
    }
  ]
};

/**
 * Test the new SIF mapping with sample questions
 */
export function testSIFMapping(): void {
  console.log('🧪 Testing SIF Mapping with New Effects System\n');

  // Test validation first
  console.log('1️⃣ Validating sample question...');
  const validation = validateSIFMapping(sampleQuestion, 'B');
  logValidationResults(validation, 'Sample Question Validation');

  // Test SIFEngine with new mapping
  console.log('2️⃣ Testing SIFEngine with new recordAnswerWithEffects method...');
  const sifEngine = new SIFEngine();
  
  // Test C choice (should credit Control:Sovereign)
  console.log('\n📊 Testing C choice (A option):');
  sifEngine.recordAnswerWithEffects(sampleQuestion, 'A', 'Control');
  const countersAfterC = sifEngine.getCounters();
  console.log('Counters after C choice:', countersAfterC);
  
  // Verify C choice credited correct face
  if (countersAfterC.faceC['Control:Sovereign'] === 1) {
    console.log('✅ C choice correctly credited Control:Sovereign');
  } else {
    console.log('❌ C choice failed to credit Control:Sovereign');
  }

  // Test O choice (should credit Recognition:Diplomat)
  console.log('\n📊 Testing O choice (B option):');
  sifEngine.recordAnswerWithEffects(sampleQuestion, 'B', 'Control');
  const countersAfterO = sifEngine.getCounters();
  console.log('Counters after O choice:', countersAfterO);
  
  // Verify O choice credited external face
  if (countersAfterO.faceO['Recognition:Diplomat'] === 1) {
    console.log('✅ O choice correctly credited Recognition:Diplomat (external face)');
  } else {
    console.log('❌ O choice failed to credit Recognition:Diplomat');
  }

  // Test F choice (should credit Bonding:Partner)
  console.log('\n📊 Testing F choice (C option):');
  sifEngine.recordAnswerWithEffects(sampleQuestion, 'C', 'Control');
  const countersAfterF = sifEngine.getCounters();
  console.log('Counters after F choice:', countersAfterF);
  
  // Verify F choice credited external face
  if (countersAfterF.faceF['Bonding:Partner'] === 1) {
    console.log('✅ F choice correctly credited Bonding:Partner (external face)');
  } else {
    console.log('❌ F choice failed to credit Bonding:Partner');
  }

  // Test family-level effects
  console.log('\n📊 Testing family-level effects:');
  console.log(`famC[Control]: ${countersAfterF.famC['Control']} (should be 1)`);
  console.log(`famO[Control]: ${countersAfterF.famO['Control']} (should be 1)`);
  console.log(`famF[Control]: ${countersAfterF.famF['Control']} (should be 1)`);

  // Summary
  console.log('\n🎯 Test Summary:');
  const allTestsPassed = 
    countersAfterF.faceC['Control:Sovereign'] === 1 &&
    countersAfterF.faceO['Recognition:Diplomat'] === 1 &&
    countersAfterF.faceF['Bonding:Partner'] === 1 &&
    countersAfterF.famC['Control'] === 1 &&
    countersAfterF.famO['Control'] === 1 &&
    countersAfterF.famF['Control'] === 1;

  if (allTestsPassed) {
    console.log('✅ All SIF mapping tests passed!');
    console.log('✅ O/F choices now correctly credit external faces');
    console.log('✅ C choices correctly credit same-family faces');
    console.log('✅ Family-level effects work correctly');
  } else {
    console.log('❌ Some SIF mapping tests failed');
  }
}

/**
 * Test with multiple questions to ensure consistency
 */
export function testMultipleQuestions(): void {
  console.log('\n🧪 Testing Multiple Questions\n');

  const questions = [
    {
      id: "PACE-001",
      family: "Pace",
      options: [
        {
          key: "A",
          pick: "C",
          effects: {
            famC: ["Pace"],
            faceC: ["Pace:Visionary"]
          }
        },
        {
          key: "B", 
          pick: "O",
          effects: {
            famO: ["Pace"],
            faceO: ["Control:Rebel"] // External face
          }
        },
        {
          key: "C",
          pick: "F", 
          effects: {
            famF: ["Pace"],
            faceF: ["Truth:Architect"] // External face
          }
        }
      ]
    }
  ];

  const sifEngine = new SIFEngine();
  
  questions.forEach(question => {
    console.log(`\n📊 Testing question ${question.id}:`);
    
    // Test all three choices
    ['A', 'B', 'C'].forEach(choice => {
      sifEngine.recordAnswerWithEffects(question, choice as 'A' | 'B' | 'C', question.family);
    });
  });

  const finalCounters = sifEngine.getCounters();
  console.log('\n📊 Final counters after all questions:', finalCounters);

  // Verify external face crediting
  const externalFacesCredited = 
    finalCounters.faceO['Control:Rebel'] > 0 &&
    finalCounters.faceF['Truth:Architect'] > 0;

  if (externalFacesCredited) {
    console.log('✅ Multiple questions test passed - external faces correctly credited');
  } else {
    console.log('❌ Multiple questions test failed - external faces not credited');
  }
}

/**
 * Run all SIF mapping tests
 */
export function runAllSIFMappingTests(): void {
  console.log('🚀 Running All SIF Mapping Tests\n');
  console.log('=' .repeat(50));
  
  testSIFMapping();
  testMultipleQuestions();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 All SIF mapping tests completed');
}

