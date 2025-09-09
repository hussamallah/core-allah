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
    f_flavor: q.options[1].f_flavor || null,
    
    // Enhanced semantic tags for SIF and IL engines
    semantic_tags: {
      behavior: {
        A: q.options[0].behavior,
        B: q.options[1].behavior
      },
      context: {
        A: q.options[0].context,
        B: q.options[1].context
      },
      sif_signals: {
        A: q.options[0].sif_signals,
        B: q.options[1].sif_signals
      },
      il_factors: {
        A: q.options[0].il_factors,
        B: q.options[1].il_factors
      },
      psychology: {
        A: q.options[0].psychology,
        B: q.options[1].psychology
      },
      relationships: {
        A: q.options[0].relationships,
        B: q.options[1].relationships
      }
    }
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
    kind: 'fused_face',
    
    // Enhanced semantic tags for SIF and IL engines
    semantic_tags: {
      behavior: {
        A: q.options[0].behavior,
        B: q.options[1].behavior
      },
      context: {
        A: q.options[0].context,
        B: q.options[1].context
      },
      sif_signals: {
        A: q.options[0].sif_signals,
        B: q.options[1].sif_signals
      },
      il_factors: {
        A: q.options[0].il_factors,
        B: q.options[1].il_factors
      },
      psychology: {
        A: q.options[0].psychology,
        B: q.options[1].psychology
      },
      relationships: {
        A: q.options[0].relationships,
        B: q.options[1].relationships
      }
    }
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
export const SEVERITY_PROBE_QUESTIONS: SeverityProbeQuestion[] = unifiedQuestionsData.phase_d_bundle.severity_probes.map((q: any) => ({
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
  kind: 'severity_probe',
  
  // Enhanced semantic tags for SIF and IL engines
  semantic_tags: {
    behavior: {
      A: q.options[0].behavior,
      B: q.options[1].behavior
    },
    context: {
      A: q.options[0].context,
      B: q.options[1].context
    },
    sif_signals: {
      A: q.options[0].sif_signals,
      B: q.options[1].sif_signals
    },
    il_factors: {
      A: q.options[0].il_factors,
      B: q.options[1].il_factors
    },
    psychology: {
      A: q.options[0].psychology,
      B: q.options[1].psychology
    },
    relationships: {
      A: q.options[0].relationships,
      B: q.options[1].relationships
    }
  }
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

// Enhanced tag helper functions for SIF and IL engines
export function getEnhancedTagsForQuestion(questionId: string, choice: 'A' | 'B') {
  const question = UNIFIED_QUESTIONS.find(q => q.id === questionId);
  if (!question) return null;
  
  const option = question.options.find(opt => opt.key === choice);
  if (!option) return null;
  
  return {
    behavior: option.behavior,
    context: option.context,
    sif_signals: option.sif_signals,
    il_factors: option.il_factors,
    psychology: option.psychology,
    relationships: option.relationships
  };
}

export function calculateAlignmentStrength(questionId: string, choice: 'A' | 'B'): number {
  const tags = getEnhancedTagsForQuestion(questionId, choice);
  return tags?.sif_signals?.alignment_strength || 0.5;
}

export function calculateWobbleFactor(questionId: string, choice: 'A' | 'B'): number {
  const tags = getEnhancedTagsForQuestion(questionId, choice);
  return tags?.sif_signals?.wobble_factor || 0.5;
}

export function calculateOverridePotential(questionId: string, choice: 'A' | 'B'): number {
  const tags = getEnhancedTagsForQuestion(questionId, choice);
  return tags?.sif_signals?.override_potential || 0.5;
}

export function calculateInstalledLikelihood(questionId: string, choice: 'A' | 'B'): number {
  const tags = getEnhancedTagsForQuestion(questionId, choice);
  if (!tags?.il_factors) return 0.5;
  
  const factors = tags.il_factors;
  const weights = {
    natural_instinct: 0.3,
    situational_fit: 0.25,
    social_expectation: 0.25,
    internal_consistency: 0.2
  };
  
  return (
    factors.natural_instinct * weights.natural_instinct +
    factors.situational_fit * weights.situational_fit +
    factors.social_expectation * weights.social_expectation +
    factors.internal_consistency * weights.internal_consistency
  );
}

export function getBehavioralPattern(questionId: string, choice: 'A' | 'B'): string {
  const tags = getEnhancedTagsForQuestion(questionId, choice);
  return tags?.behavior?.primary || 'unknown';
}

export function getContextualSituation(questionId: string, choice: 'A' | 'B'): string {
  const tags = getEnhancedTagsForQuestion(questionId, choice);
  return tags?.context?.situation || 'routine';
}

export function getPsychologicalMotivation(questionId: string, choice: 'A' | 'B'): string {
  const tags = getEnhancedTagsForQuestion(questionId, choice);
  return tags?.psychology?.motivation || 'unknown';
}

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
  const expectedTotal = 21;
  if (UNIFIED_QUESTIONS.length !== expectedTotal) {
    console.error(`❌ Expected ${expectedTotal} unified questions, got ${UNIFIED_QUESTIONS.length}`);
    return false;
  }
  
  // Check questions per line
  const lines = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
  const expectedPerLine = 3;
  
  lines.forEach(line => {
    const lineQuestions = UNIFIED_QUESTIONS.filter((q: any) => q.family === line);
    if (lineQuestions.length !== expectedPerLine) {
      console.error(`❌ Line ${line} should have ${expectedPerLine} questions, got ${lineQuestions.length}`);
      return false;
    }
    
    // Check question types
    const types = lineQuestions.map((q: any) => q.type);
    const expectedTypes = ['CO1', 'CO2', 'CF1'];
    expectedTypes.forEach(type => {
      if (!types.includes(type)) {
        console.error(`❌ Line ${line} missing question type: ${type}`);
        return false;
      }
    });
  });
  
  // Check severity probes
  const expectedSeverityProbes = 14;
  if (SEVERITY_PROBE_QUESTIONS.length !== expectedSeverityProbes) {
    console.error(`❌ Expected ${expectedSeverityProbes} severity probes, got ${SEVERITY_PROBE_QUESTIONS.length}`);
    return false;
  }
  
  console.log('✅ Unified question pool validation passed');
  return true;
}

// Run validation on load
validateUnifiedQuestionPool();