import { FamilyCard, DuelQuestion, ModuleQuestion, FinalProbeQuestion, SeverityProbeQuestion, ArchetypeQuestion } from '@/types/quiz';
import unifiedQuestionsData from '../../../unified_question_pool_v1.json';

// Load Phase A family cards from unified pool
export const FAMILY_CARDS: FamilyCard[] = unifiedQuestionsData.phase_a.map((card: any) => ({
  id: card.id,
  phase: card.phase,
  kind: card.kind,
  family: card.family,
  blurb: card.blurb,
  reading_level: card.reading_level
}));

// Unified questions for both Phase B and Phase C
export const UNIFIED_QUESTIONS = unifiedQuestionsData.unified_questions;

// Function to clean option labels by removing mapping information in parentheses
function cleanOptionLabel(label: string): string {
  // Remove text in parentheses at the end of the label
  return label.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

// Phase B uses family effects from unified questions
export const DUEL_QUESTIONS: DuelQuestion[] = UNIFIED_QUESTIONS.map((q: any) => {
  // Map unified question types to Phase B structure
  const typeMapping: Record<string, string> = {
    'CO1': 'CO',
    'CO2': 'CO', 
    'CF1': 'CF',
    'Severity1': 'CF' // Severity questions are CF type for Phase B
  };
  
  const orderMapping: Record<string, number> = {
    'CO1': 1,
    'CO2': 2,
    'CF1': 1,
    'Severity1': 2
  };
  
  return {
    id: q.id,
    phase: 'B' as 'B',
    line: q.family,
    lineId: q.family,
    prompt: q.prompt,
    options: {
      A: cleanOptionLabel(q.options[0].label),
      B: cleanOptionLabel(q.options[1].label)
    },
    mappings: {
      A: q.options[0].pick,
      B: q.options[1].pick
    },
    type: typeMapping[q.type] as 'CO' | 'CF',
    order: orderMapping[q.type] as 1 | 2 | 3,
    kind: 'family',
    // HTML simulator mappings
    c_flavor: q.options[0].c_flavor || null,
    o_subtype: q.options[1].o_subtype || null,
    f_flavor: q.options[1].f_flavor || null
  };
});

// Debug logging to verify DUEL_QUESTIONS are loaded
console.log('🔍 DUEL_QUESTIONS Debug (Unified):', {
  totalQuestions: DUEL_QUESTIONS.length,
  boundaryQuestions: DUEL_QUESTIONS.filter(q => q.line === 'Boundary'),
  bondingQuestions: DUEL_QUESTIONS.filter(q => q.line === 'Bonding'),
  controlQuestions: DUEL_QUESTIONS.filter(q => q.line === 'Control'),
  allLines: Array.from(new Set(DUEL_QUESTIONS.map(q => q.line))),
  allTypes: Array.from(new Set(DUEL_QUESTIONS.map(q => q.type))),
  allOrders: Array.from(new Set(DUEL_QUESTIONS.map(q => q.order)))
});

// Phase C uses face effects from unified questions
export const MODULE_QUESTIONS: ModuleQuestion[] = UNIFIED_QUESTIONS.map((q: any) => {
  // Map unified question types to Phase C structure
  const typeMapping: Record<string, string> = {
    'CO1': 'CO',
    'CO2': 'CO',
    'CF1': 'CF', 
    'Severity1': 'CF' // Severity questions are CF type for Phase C
  };
  
  const orderMapping: Record<string, number> = {
    'CO1': 1,
    'CO2': 2,
    'CF1': 1,
    'Severity1': 2
  };
  
  // Generate face effects for Phase C
  const generateFaceEffects = (family: string, effects: any) => {
    const faceEffects: string[] = [];
    
    // Add face effects based on family
    if (effects.faceC) faceEffects.push(...effects.faceC);
    if (effects.faceO) faceEffects.push(...effects.faceO);
    if (effects.faceF) faceEffects.push(...effects.faceF);
    
    // If no face effects, generate default ones
    if (faceEffects.length === 0) {
      const faceMap: Record<string, string[]> = {
        'Control': ['Control:Rebel', 'Control:Sovereign'],
        'Pace': ['Pace:Visionary', 'Pace:Navigator'],
        'Boundary': ['Boundary:Equalizer', 'Boundary:Guardian'],
        'Truth': ['Truth:Seeker', 'Truth:Architect'],
        'Recognition': ['Recognition:Spotlight', 'Recognition:Diplomat'],
        'Bonding': ['Bonding:Anchor', 'Bonding:Connector'],
        'Stress': ['Stress:Catalyst', 'Stress:Artisan']
      };
      faceEffects.push(...(faceMap[family] || []));
    }
    
    return faceEffects[0] || `${family}:Face`; // Use first face or fallback
  };
  
  return {
    id: q.id,
    phase: 'C' as 'C',
    line: q.family,
    lineId: q.family,
    prompt: q.prompt,
    options: {
      A: cleanOptionLabel(q.options[0].label),
      B: cleanOptionLabel(q.options[1].label)
    },
    mappings: {
      A: q.options[0].pick,
      B: q.options[1].pick
    },
    type: typeMapping[q.type] as 'CO' | 'CF',
    order: orderMapping[q.type] as 1 | 2 | 3,
    face: generateFaceEffects(q.family, q.options[0].effects),
    kind: 'fused_face'
  };
});

// Debug logging to verify MODULE_QUESTIONS are loaded
console.log('🔍 MODULE_QUESTIONS Debug (Unified):', {
  totalQuestions: MODULE_QUESTIONS.length,
  controlQuestions: MODULE_QUESTIONS.filter(q => q.line === 'Control'),
  controlCFQuestions: MODULE_QUESTIONS.filter(q => q.line === 'Control' && q.type === 'CF'),
  allCFQuestions: MODULE_QUESTIONS.filter(q => q.type === 'CF'),
  allFaces: Array.from(new Set(MODULE_QUESTIONS.map(q => q.face)))
});

// Phase D questions are empty in unified pool (computation only)
export const FINAL_PROBE_QUESTIONS: FinalProbeQuestion[] = unifiedQuestionsData.phase_d_bundle.final_probes.map((q: any) => ({
  id: q.id,
  phase: q.phase,
  line: q.family,
  lineId: q.family,
  prompt: q.prompt,
  options: {
    A: q.options[0].label,
    B: q.options[1].label
  },
  mappings: {
    A: q.options[0].pick,
    B: q.options[1].pick
  },
  kind: q.kind
}));

// Severity probe questions from unified pool
export const SEVERITY_PROBE_QUESTIONS: SeverityProbeQuestion[] = UNIFIED_QUESTIONS
  .filter((q: any) => q.type === 'Severity1')
  .map((q: any) => ({
    id: q.id,
    phase: 'C' as 'C' | 'D', // Severity questions appear in Phase C, not Phase D
    line: q.family,
    lineId: q.family,
    prompt: q.prompt,
    options: {
      A: q.options[0].label,
      B: q.options[1].label
    },
    mappings: {
      A: q.options[0].pick,
      B: q.options[1].pick
    },
    kind: 'severity_probe'
  }));

export const ANCHOR_BLURBS: Record<string, string> = {
  "Control": "You are most yourself when you set the call and move the plan.",
  "Pace": "You are most yourself when you keep time by choosing one task and finishing it.",
  "Boundary": "You are most yourself when you draw the line and say what can fit now.",
  "Truth": "You are most yourself when you hold the reason and keep signals clear.",
  "Recognition": "You are most yourself when you show proof and claim the work you did.",
  "Bonding": "You are most yourself when you keep trust by caring for and protecting the link.",
  "Stress": "You are most yourself when you act under pressure while others stall."
};

// Load Phase E archetype questions from unified pool
export const ARCHETYPE_QUESTIONS: ArchetypeQuestion[] = unifiedQuestionsData.phase_e.map((q: any) => ({
  id: q.id,
  family: q.family,
  archetypes: q.archetypes,
  prompt: q.prompt,
  options: q.options,
  map: q.map,
  reading_level: q.reading_level
}));

// Helper functions for archetype questions
export function getArchetypeQuestionsForFamily(family: string): ArchetypeQuestion[] {
  return ARCHETYPE_QUESTIONS.filter(q => q.family === family);
}

export function getArchetypesForFamily(family: string): string[] {
  const questions = getArchetypeQuestionsForFamily(family);
  return questions.length > 0 ? questions[0].archetypes : [];
}

// Helper functions for unified questions
export function getUnifiedQuestionsForFamily(family: string) {
  return UNIFIED_QUESTIONS.filter((q: any) => q.family === family);
}

export function getUnifiedQuestionsByType(type: 'CO1' | 'CO2' | 'CF1' | 'Severity1') {
  return UNIFIED_QUESTIONS.filter((q: any) => q.type === type);
}

export function getUnifiedQuestionEffects(questionId: string, choice: 'A' | 'B') {
  const question = UNIFIED_QUESTIONS.find((q: any) => q.id === questionId);
  if (!question) return null;
  
  const option = question.options.find((opt: any) => opt.key === choice);
  return option ? option.effects : null;
}

// Validation function for unified question pool
export function validateUnifiedQuestionPool() {
  console.log('🔍 Validating Unified Question Pool...');
  
  // Check total questions
  const expectedTotal = 28;
  if (UNIFIED_QUESTIONS.length !== expectedTotal) {
    console.error(`❌ Expected ${expectedTotal} unified questions, got ${UNIFIED_QUESTIONS.length}`);
    return false;
  }
  
  // Check questions per line
  const lines = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
  const expectedPerLine = 4;
  
  lines.forEach(line => {
    const lineQuestions = UNIFIED_QUESTIONS.filter((q: any) => q.family === line);
    if (lineQuestions.length !== expectedPerLine) {
      console.error(`❌ Line ${line} should have ${expectedPerLine} questions, got ${lineQuestions.length}`);
      return false;
    }
    
    // Check question types
    const types = lineQuestions.map((q: any) => q.type);
    const expectedTypes = ['CO1', 'CO2', 'CF1', 'Severity1'];
    expectedTypes.forEach(type => {
      if (!types.includes(type)) {
        console.error(`❌ Line ${line} missing question type: ${type}`);
        return false;
      }
    });
  });
  
  console.log('✅ Unified question pool validation passed');
  return true;
}

// Run validation on load
validateUnifiedQuestionPool();