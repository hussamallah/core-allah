import { FamilyCard, DuelQuestion, ModuleQuestion, FinalProbeQuestion, SeverityProbeQuestion, ArchetypeQuestion } from '@/types/quiz';
import questionsData from '../../../questions_template_upgraded.json';

export const FAMILY_CARDS: FamilyCard[] = [
  {
    id: "A-FAM-CTRL",
    phase: "A",
    kind: "family_card",
    family: "Control",
    blurb: "You set the call and move the plan.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-PACE",
    phase: "A",
    kind: "family_card",
    family: "Pace",
    blurb: "You keep time by picking a task and finishing it.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-BOUND",
    phase: "A",
    kind: "family_card",
    family: "Boundary",
    blurb: "You draw the line and say what can fit now.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-TRUTH",
    phase: "A",
    kind: "family_card",
    family: "Truth",
    blurb: "You hold the reason by checking facts and keeping signals clear.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-RECOG",
    phase: "A",
    kind: "family_card",
    family: "Recognition",
    blurb: "You show proof and claim the work you did.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-BOND",
    phase: "A",
    kind: "family_card",
    family: "Bonding",
    blurb: "You keep trust by caring for and protecting the link.",
    reading_level: "G5"
  },
  {
    id: "A-FAM-STRESS",
    phase: "A",
    kind: "family_card",
    family: "Stress",
    blurb: "You act when pressure is high and others stall.",
    reading_level: "G5"
  }
];

// Load questions from JSON file
export const DUEL_QUESTIONS: DuelQuestion[] = questionsData.phase_b.map((q: any) => {
  // Extract order from question ID (e.g., B-PACE-CO-001 -> 1, B-PACE-CO-002 -> 2)
  const orderMatch = q.id.match(/-(\d+)$/);
  const order = orderMatch ? parseInt(orderMatch[1]) : 1;
  
  return {
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
    type: q.structure,
    order: order as 1 | 2 | 3,
    kind: q.kind
  };
});

// Load module questions from JSON file - Phase C uses both CO questions from phase_c_fused and CF questions from phase_b
const coQuestions = questionsData.phase_c_fused.map((q: any) => {
  // Extract order from question ID (e.g., C-CTRL-REB-CO-001 -> 1, C-CTRL-REB-CO-002 -> 2)
  const orderMatch = q.id.match(/-(\d+)$/);
  const order = orderMatch ? parseInt(orderMatch[1], 10) : 1;
  
  return {
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
    type: q.structure,
    order: order as 1 | 2 | 3,
    face: q.face,
    kind: q.kind
  };
});

// Load CF questions from Phase B for Phase C
const cfQuestions = questionsData.phase_b
  .filter((q: any) => q.structure === 'CF')
  .map((q: any) => {
    // Extract order from question ID (e.g., B-CTRL-CF-001 -> 1, B-CTRL-CF-002 -> 2)
    const orderMatch = q.id.match(/-(\d+)$/);
    const order = orderMatch ? parseInt(orderMatch[1], 10) : 1;
    
    return {
      id: q.id,
      phase: 'C', // Mark as Phase C for module questions
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
      type: q.structure,
      order: order as 1 | 2 | 3,
      face: q.face || `${q.family}:Face`, // Fallback for Phase B questions that don't have face
      kind: q.kind
    };
  });

export const MODULE_QUESTIONS: ModuleQuestion[] = [...coQuestions, ...cfQuestions];

// Debug logging to verify CF questions are loaded
console.log('🔍 MODULE_QUESTIONS Debug:', {
  totalQuestions: MODULE_QUESTIONS.length,
  coQuestions: coQuestions.length,
  cfQuestions: cfQuestions.length,
  controlQuestions: MODULE_QUESTIONS.filter(q => q.line === 'Control'),
  controlCFQuestions: MODULE_QUESTIONS.filter(q => q.line === 'Control' && q.type === 'CF'),
  allCFQuestions: MODULE_QUESTIONS.filter(q => q.type === 'CF')
});

// Load final probe questions from JSON file
export const FINAL_PROBE_QUESTIONS: FinalProbeQuestion[] = questionsData.phase_d_bundle.final_probes.map((q: any) => ({
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

// Load severity probe questions from JSON file
export const SEVERITY_PROBE_QUESTIONS: SeverityProbeQuestion[] = questionsData.phase_d_bundle.severity_probes.map((q: any) => ({
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
  kind: q.kind
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

export const ARCHETYPE_QUESTIONS: ArchetypeQuestion[] = [
  {
    "id": "CORE-CTRL-01",
    "family": "Control",
    "archetypes": ["Sovereign", "Rebel"],
    "prompt": "When you lead, what feels right at your core?",
    "options": {
      "A": "Set the line so others can move with you.",
      "B": "Break the line so movement starts again."
    },
    "map": {
      "A": "Sovereign",
      "B": "Rebel"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-CTRL-02",
    "family": "Control",
    "archetypes": ["Sovereign", "Rebel"],
    "prompt": "Rules to you are mainly…",
    "options": {
      "A": "Language I declare so work is clear.",
      "B": "Material I bend to open the path."
    },
    "map": {
      "A": "Sovereign",
      "B": "Rebel"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-CTRL-03",
    "family": "Control",
    "archetypes": ["Sovereign", "Rebel"],
    "prompt": "Power, in your body, feels like…",
    "options": {
      "A": "Calm authority that others align to.",
      "B": "A spark that flips the room into motion."
    },
    "map": {
      "A": "Sovereign",
      "B": "Rebel"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-PACE-01",
    "family": "Pace",
    "archetypes": ["Visionary", "Navigator"],
    "prompt": "What pulls you more when you move?",
    "options": {
      "A": "The end picture that calls from the future.",
      "B": "The next step that keeps the route clean."
    },
    "map": {
      "A": "Visionary",
      "B": "Navigator"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-PACE-02",
    "family": "Pace",
    "archetypes": ["Visionary", "Navigator"],
    "prompt": "Your time sense is mostly…",
    "options": {
      "A": "Timing the reveal when the arc is ready.",
      "B": "Pacing the work so it finishes on time."
    },
    "map": {
      "A": "Visionary",
      "B": "Navigator"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-PACE-03",
    "family": "Pace",
    "archetypes": ["Visionary", "Navigator"],
    "prompt": "When paths split, you trust…",
    "options": {
      "A": "The bold line that fits the long story.",
      "B": "The simple line that lands a result now."
    },
    "map": {
      "A": "Visionary",
      "B": "Navigator"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOUND-01",
    "family": "Boundary",
    "archetypes": ["Equalizer", "Guardian"],
    "prompt": "Your first duty feels like…",
    "options": {
      "A": "Keep the field fair so power is balanced.",
      "B": "Keep people safe so harm does not land."
    },
    "map": {
      "A": "Equalizer",
      "B": "Guardian"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOUND-02",
    "family": "Boundary",
    "archetypes": ["Equalizer", "Guardian"],
    "prompt": "When lines get fuzzy, you…",
    "options": {
      "A": "Redraw the rule so all play by it.",
      "B": "Shield the person most at risk."
    },
    "map": {
      "A": "Equalizer",
      "B": "Guardian"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOUND-03",
    "family": "Boundary",
    "archetypes": ["Equalizer", "Guardian"],
    "prompt": "What settles you more?",
    "options": {
      "A": "Shared limits that make things fair.",
      "B": "Knowing the vulnerable are protected."
    },
    "map": {
      "A": "Equalizer",
      "B": "Guardian"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-TRUTH-01",
    "family": "Truth",
    "archetypes": ["Seeker", "Architect"],
    "prompt": "Truth, to you, shows up first as…",
    "options": {
      "A": "A live signal I can test in the wild.",
      "B": "A clear frame I can build and check."
    },
    "map": {
      "A": "Seeker",
      "B": "Architect"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-TRUTH-02",
    "family": "Truth",
    "archetypes": ["Seeker", "Architect"],
    "prompt": "Your mind rests better when…",
    "options": {
      "A": "Patterns emerge from real examples.",
      "B": "Definitions lock and terms stay clean."
    },
    "map": {
      "A": "Seeker",
      "B": "Architect"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-TRUTH-03",
    "family": "Truth",
    "archetypes": ["Seeker", "Architect"],
    "prompt": "Your core move with confusion is…",
    "options": {
      "A": "Ask for the one signal that matters.",
      "B": "Draw the structure so parts fit right."
    },
    "map": {
      "A": "Seeker",
      "B": "Architect"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-RECOG-01",
    "family": "Recognition",
    "archetypes": ["Spotlight", "Diplomat"],
    "prompt": "How do you make change real?",
    "options": {
      "A": "Shine a light so people see and move.",
      "B": "Bridge sides so people align and move."
    },
    "map": {
      "A": "Spotlight",
      "B": "Diplomat"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-RECOG-02",
    "family": "Recognition",
    "archetypes": ["Spotlight", "Diplomat"],
    "prompt": "Your proof lives mostly in…",
    "options": {
      "A": "Public signal that carries far.",
      "B": "Quiet deals that unlock doors."
    },
    "map": {
      "A": "Spotlight",
      "B": "Diplomat"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-RECOG-03",
    "family": "Recognition",
    "archetypes": ["Spotlight", "Diplomat"],
    "prompt": "What feels more honest to you?",
    "options": {
      "A": "Stand up and show the win.",
      "B": "Line up the room, then share the win."
    },
    "map": {
      "A": "Spotlight",
      "B": "Diplomat"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOND-01",
    "family": "Bonding",
    "archetypes": ["Partner", "Provider"],
    "prompt": "Care, in your body, is mostly…",
    "options": {
      "A": "Being there with you through the hard part.",
      "B": "Doing the thing so your load is lighter."
    },
    "map": {
      "A": "Partner",
      "B": "Provider"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOND-02",
    "family": "Bonding",
    "archetypes": ["Partner", "Provider"],
    "prompt": "What proves love to you more?",
    "options": {
      "A": "We face it side by side.",
      "B": "I handle it so you can rest."
    },
    "map": {
      "A": "Partner",
      "B": "Provider"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-BOND-03",
    "family": "Bonding",
    "archetypes": ["Partner", "Provider"],
    "prompt": "Your bond keeps strength by…",
    "options": {
      "A": "Staying close in the storm.",
      "B": "Taking care of the needs."
    },
    "map": {
      "A": "Partner",
      "B": "Provider"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-STRESS-01",
    "family": "Stress",
    "archetypes": ["Catalyst", "Artisan"],
    "prompt": "Under stress, your gift is…",
    "options": {
      "A": "Ignite motion and cut the drag.",
      "B": "Keep quality and land one clean piece."
    },
    "map": {
      "A": "Catalyst",
      "B": "Artisan"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-STRESS-02",
    "family": "Stress",
    "archetypes": ["Catalyst", "Artisan"],
    "prompt": "What do you trust more when it's tight?",
    "options": {
      "A": "Start the chain and push it forward.",
      "B": "Craft the standard others can copy."
    },
    "map": {
      "A": "Catalyst",
      "B": "Artisan"
    },
    "reading_level": "G5"
  },
  {
    "id": "CORE-STRESS-03",
    "family": "Stress",
    "archetypes": ["Catalyst", "Artisan"],
    "prompt": "Your core pride comes from…",
    "options": {
      "A": "Making the first move that changes the field.",
      "B": "Making the thing so well it holds up."
    },
    "map": {
      "A": "Catalyst",
      "B": "Artisan"
    },
    "reading_level": "G5"
  }
];

// Helper functions for archetype questions
export function getArchetypeQuestionsForFamily(family: string): ArchetypeQuestion[] {
  return ARCHETYPE_QUESTIONS.filter(q => q.family === family);
}

export function getArchetypesForFamily(family: string): string[] {
  const questions = getArchetypeQuestionsForFamily(family);
  return questions.length > 0 ? questions[0].archetypes : [];
}