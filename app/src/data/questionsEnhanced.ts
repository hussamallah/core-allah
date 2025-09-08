import { FamilyCard, DuelQuestion, ModuleQuestion, FinalProbeQuestion, SeverityProbeQuestion, ArchetypeQuestion } from '@/types/quiz';
import unifiedQuestionsData from '../../../unified_question_pool_v1.json';

// Enhanced unified questions with simulator improvements
export const UNIFIED_QUESTIONS_ENHANCED = unifiedQuestionsData.unified_questions;

// Function to clean option labels by removing mapping information in parentheses
function cleanOptionLabel(label: string): string {
  // Remove text in parentheses at the end of the label
  return label.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

// Enhanced Phase B questions with simulator features
export const DUEL_QUESTIONS_ENHANCED: DuelQuestion[] = UNIFIED_QUESTIONS_ENHANCED.map((q: any) => {
  const typeMapping: Record<string, string> = {
    'CO1': 'CO',
    'CO2': 'CO', 
    'CF1': 'CF',
    'Severity1': 'CF'
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
    // Enhanced simulator features
    enhanced: {
      autoAdvance: true,
      keyboardShortcuts: true,
      timeContext: q.prompt.includes('time') || q.prompt.includes('minute'),
      socialDynamics: q.prompt.includes('group') || q.prompt.includes('people'),
      c_flavor: extractCFlavor(q.options[0]),
      o_subtype: extractOSubtype(q.options[1]),
      f_flavor: q.type === 'CF' ? extractFFlavor(q.options[1]) : null
    }
  };
});

// Extract enhanced data tracking from HTML simulator mappings
function extractCFlavor(option: any): string {
  // Use HTML simulator's c_flavor if available, otherwise extract from label
  if (option.c_flavor) return option.c_flavor;
  if (option.label.includes('clearly') || option.label.includes('direct')) return 'direct';
  if (option.label.includes('lead') || option.label.includes('move')) return 'assertive';
  if (option.label.includes('organize') || option.label.includes('plan')) return 'systematic';
  return 'balanced';
}

function extractOSubtype(option: any): string {
  // Use HTML simulator's o_subtype if available, otherwise extract from label
  if (option.o_subtype) return option.o_subtype;
  if (option.label.includes('wait') || option.label.includes('pause')) return 'hesitant';
  if (option.label.includes('ask') || option.label.includes('discuss')) return 'collaborative';
  if (option.label.includes('observe') || option.label.includes('watch')) return 'analytical';
  return 'neutral';
}

function extractFFlavor(option: any): string {
  // Use HTML simulator's f_flavor if available, otherwise extract from label
  if (option.f_flavor) return option.f_flavor;
  if (option.label.includes('force') || option.label.includes('must')) return 'forceful';
  if (option.label.includes('need') || option.label.includes('require')) return 'necessary';
  if (option.label.includes('should') || option.label.includes('better')) return 'corrective';
  return 'adaptive';
}

// Enhanced validation with simulator features
export function validateEnhancedQuestionPool() {
  console.log('🔍 Validating Enhanced Unified Question Pool...');
  
  // Check enhanced features
  const enhancedQuestions = DUEL_QUESTIONS_ENHANCED.filter(q => q.enhanced);
  if (enhancedQuestions.length !== DUEL_QUESTIONS_ENHANCED.length) {
    console.warn('⚠️ Some questions missing enhanced features');
  }
  
  // Check psychological depth
  const timeContextQuestions = DUEL_QUESTIONS_ENHANCED.filter(q => q.enhanced?.timeContext);
  const socialDynamicsQuestions = DUEL_QUESTIONS_ENHANCED.filter(q => q.enhanced?.socialDynamics);
  
  console.log('✅ Enhanced features validation:', {
    totalQuestions: DUEL_QUESTIONS_ENHANCED.length,
    timeContextQuestions: timeContextQuestions.length,
    socialDynamicsQuestions: socialDynamicsQuestions.length,
    autoAdvanceEnabled: DUEL_QUESTIONS_ENHANCED.every(q => q.enhanced?.autoAdvance),
    keyboardShortcutsEnabled: DUEL_QUESTIONS_ENHANCED.every(q => q.enhanced?.keyboardShortcuts)
  });
  
  return true;
}

// Enhanced Phase C questions with simulator features
export const MODULE_QUESTIONS_ENHANCED: ModuleQuestion[] = UNIFIED_QUESTIONS_ENHANCED.map((q: any) => {
  const typeMapping: Record<string, string> = {
    'CO1': 'CO',
    'CO2': 'CO',
    'CF1': 'CF', 
    'Severity1': 'CF'
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
    
    if (effects.faceC) faceEffects.push(...effects.faceC);
    if (effects.faceO) faceEffects.push(...effects.faceO);
    if (effects.faceF) faceEffects.push(...effects.faceF);
    
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
    
    return faceEffects[0] || `${family}:Face`;
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
    // Enhanced simulator features
    enhanced: {
      autoAdvance: true,
      keyboardShortcuts: true,
      timeContext: q.prompt.includes('time') || q.prompt.includes('minute'),
      socialDynamics: q.prompt.includes('group') || q.prompt.includes('people'),
      c_flavor: extractCFlavor(q.options[0]),
      o_subtype: extractOSubtype(q.options[1]),
      f_flavor: q.type === 'CF' ? extractFFlavor(q.options[1]) : null
    }
  };
});

// Run validation on load
validateEnhancedQuestionPool();
