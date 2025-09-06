/**
 * Quiz types and interfaces
 */

export const LINES = ["Control", "Pace", "Boundary", "Truth", "Recognition", "Bonding", "Stress"] as const;
export const FAMILIES = ["Control", "Pace", "Boundary", "Truth", "Recognition", "Bonding", "Stress"] as const;
export type Family = typeof FAMILIES[number];

// Family ID mapping for consistent key usage
export const FID: Record<Family, string> = {
  Control: 'Control',
  Pace: 'Pace', 
  Boundary: 'Boundary',
  Truth: 'Truth',
  Recognition: 'Recognition',
  Bonding: 'Bonding',
  Stress: 'Stress'
};

export interface Question {
  id: string;
  line: string;
  type: 'CO' | 'CF' | 'TIE' | 'FINAL_PROBE' | 'SEVERITY_PROBE' | 'ARCHETYPE';
  order: number;
  question: string;
  options: {
    A: string;
    B: string;
  };
  effects?: {
    A: string[];
    B: string[];
  };
}

export interface QuizLine {
  id: string;
  selectedA: boolean;
  B: {
    picks: string[];
    C_evidence: number;
  };
  mod: {
    decisions: Array<{
      type: 'CO1' | 'CO2' | 'CF';
      pick: 'C' | 'O' | 'F';
    }>;
  };
  verdict?: string;
}

export interface QuestionHistoryEntry {
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype';
  questionId: string;
  lineId: string;
  choice: string;
  timestamp: number;
}

// SIF (Secondary Identity Face) system types
export interface SIFCounters {
  famC: Record<string, number>;  // Family C counts
  famO: Record<string, number>;  // Family O counts  
  famF: Record<string, number>;  // Family F counts
  sevF: Record<string, number>;  // Severity F counts
  faceC: Record<string, number>; // Face C counts (using faceKey like "Control:Rebel")
  faceO: Record<string, number>; // Face O counts (using faceKey like "Control:Rebel")
}

export interface SIFResult {
  primary: {
    family: string;
    face: string;
  };
  secondary: {
    family: string;
    face: string;
  };
  prize: string;
  badge: 'Aligned' | 'Installed from outside' | 'Not yet aligned';
  context: {
    friction: Record<string, number>;
  };
}

// Face to Family mapping
export const FACE_TO_FAMILY: Record<string, string> = {
  'Rebel': 'Control',
  'Sovereign': 'Control',
  'Visionary': 'Pace',
  'Navigator': 'Pace',
  'Equalizer': 'Boundary',
  'Guardian': 'Boundary',
  'Seeker': 'Truth',
  'Architect': 'Truth',
  'Spotlight': 'Recognition',
  'Diplomat': 'Recognition',
  'Partner': 'Bonding',
  'Provider': 'Bonding',
  'Catalyst': 'Stress',
  'Artisan': 'Stress'
};

// Family to Faces mapping
export const FAMILY_TO_FACES: Record<string, string[]> = {
  'Control': ['Rebel', 'Sovereign'],
  'Pace': ['Visionary', 'Navigator'],
  'Boundary': ['Equalizer', 'Guardian'],
  'Truth': ['Seeker', 'Architect'],
  'Recognition': ['Spotlight', 'Diplomat'],
  'Bonding': ['Partner', 'Provider'],
  'Stress': ['Catalyst', 'Artisan']
};

// Prize Mirror mapping - each archetype maps to its corrective counterpart
export const PRIZE_MIRROR_MAP: Record<string, string> = {
  // Control family
  'Control:Sovereign': 'Recognition:Diplomat', // Sovereign → Diplomat
  'Control:Rebel': 'Truth:Architect',          // Rebel → Architect
  
  // Pace family  
  'Pace:Visionary': 'Truth:Architect',         // Visionary → Architect
  'Pace:Navigator': 'Boundary:Guardian',       // Navigator → Guardian
  
  // Boundary family
  'Boundary:Equalizer': 'Control:Sovereign',   // Equalizer → Sovereign
  'Boundary:Guardian': 'Recognition:Diplomat', // Guardian → Diplomat
  
  // Truth family
  'Truth:Seeker': 'Control:Rebel',             // Seeker → Rebel
  'Truth:Architect': 'Stress:Catalyst',        // Architect → Catalyst
  
  // Recognition family
  'Recognition:Spotlight': 'Truth:Architect',  // Spotlight → Architect
  'Recognition:Diplomat': 'Control:Sovereign', // Diplomat → Sovereign
  
  // Bonding family
  'Bonding:Partner': 'Boundary:Equalizer',     // Partner → Equalizer
  'Bonding:Provider': 'Boundary:Guardian',     // Provider → Guardian
  
  // Stress family
  'Stress:Catalyst': 'Pace:Navigator',         // Catalyst → Navigator
  'Stress:Artisan': 'Pace:Visionary'           // Artisan → Visionary
};

// Legacy Prize mapping - kept for backward compatibility
// This maps families to their "default" prize face for SIF calculation
export const FAMILY_TO_PRIZE: Record<string, string> = {
  'Control': 'Sovereign',      // Default to Sovereign for Control family
  'Pace': 'Navigator',         // Default to Navigator for Pace family  
  'Boundary': 'Guardian',      // Default to Guardian for Boundary family
  'Truth': 'Architect',        // Default to Architect for Truth family
  'Recognition': 'Diplomat',   // Default to Diplomat for Recognition family
  'Bonding': 'Provider',       // Default to Provider for Bonding family
  'Stress': 'Catalyst'         // Default to Catalyst for Stress family
};

// Face anchor mapping for Phase C questions
export const FACE_ANCHOR: Record<string, { CO1: string; CO2: string; CF: string; TIE: [string, string] }> = {
  'Control': { CO1: 'Rebel', CO2: 'Sovereign', TIE: ['Rebel', 'Sovereign'], CF: 'Rebel' },
  'Pace': { CO1: 'Visionary', CO2: 'Navigator', TIE: ['Visionary', 'Navigator'], CF: 'Visionary' },
  'Boundary': { CO1: 'Equalizer', CO2: 'Guardian', TIE: ['Equalizer', 'Guardian'], CF: 'Equalizer' },
  'Truth': { CO1: 'Seeker', CO2: 'Architect', TIE: ['Seeker', 'Architect'], CF: 'Seeker' },
  'Recognition': { CO1: 'Spotlight', CO2: 'Diplomat', TIE: ['Spotlight', 'Diplomat'], CF: 'Spotlight' },
  'Bonding': { CO1: 'Partner', CO2: 'Provider', TIE: ['Partner', 'Provider'], CF: 'Partner' },
  'Stress': { CO1: 'Catalyst', CO2: 'Artisan', TIE: ['Catalyst', 'Artisan'], CF: 'Catalyst' }
};

// Helper function to get anchored face for Phase C questions
export function anchorFaceFor(family: string, kind: 'CO1' | 'CO2' | 'CF' | 'TIE'): string {
  const pack = FACE_ANCHOR[family];
  if (!pack) return `${family}:Face`;
  const face = kind === 'TIE' ? pack.TIE[0] : pack[kind];
  return `${family}:${face}`;
}

// Helper function to get Prize Mirror for a specific archetype
export function getPrizeMirror(archetype: string): string {
  return PRIZE_MIRROR_MAP[archetype] || archetype;
}

export interface QuizState {
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'Summary';
  lines: QuizLine[];
  anchor: string | null;
  usedQuestions: string[];
  currentQuestionIndex: number;
  questionHistory: QuestionHistoryEntry[];
  archetypeAnswers: Record<string, string>;
  finalArchetype: string | null;
  // SIF system additions
  sifCounters: SIFCounters;
  sifResult: SIFResult | null;
  familyVerdicts: Record<string, { type: 'F'; severity?: number }>;
  // SIF v3 additions
  sifShortlist: string[];
  installedChoice: string | null;
}

export interface FamilyCard {
  id: string;
  phase: 'A';
  kind: 'family_card';
  family: string;
  blurb: string;
  reading_level: string;
}

export interface DuelQuestion {
  id: string;
  phase: 'B';
  line: string;
  lineId: string;
  type: 'CO' | 'CF';
  order: 1 | 2 | 3;
  prompt: string;
  options: {
    A: string;
    B: string;
  };
  mappings: {
    A: string;
    B: string;
  };
  kind: string;
}

export interface ModuleQuestion {
  id: string;
  phase: 'C';
  line: string;
  lineId: string;
  type: 'CO' | 'CF';
  order: 1 | 2 | 3;
  prompt: string;
  options: {
    A: string;
    B: string;
  };
  mappings: {
    A: string;
    B: string;
  };
  face: string;
  kind: string;
}

export interface FinalProbeQuestion {
  id: string;
  phase: 'D';
  line: string;
  lineId: string;
  prompt: string;
  options: {
    A: string;
    B: string;
  };
  mappings: {
    A: string;
    B: string;
  };
  kind: string;
}

export interface SeverityProbeQuestion {
  id: string;
  phase: 'C' | 'D';
  kind: 'severity_probe';
  line: string;
  lineId: string;
  prompt: string;
  options: {
    A: string;
    B: string;
    C?: string;
  };
  mappings: {
    A: string;
    B: string;
    C?: string;
  };
}

export interface ArchetypeQuestion {
  id: string;
  family: string;
  archetypes: string[];
  prompt: string;
  options: {
    A: string;
    B: string;
  };
  map: {
    A: string;
    B: string;
  };
  reading_level: string;
}

export interface Decision {
  type: string;
  pick: string;
}

export interface QuestionHistoryEntry {
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype';
  lineId: string;
  questionId: string;
  choice: string;
  timestamp: number;
}

export interface QuizState {
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'Summary';
  lines: QuizLine[];
  anchor: string | null;
  usedQuestions: string[];
  currentQuestionIndex: number;
  questionHistory: QuestionHistoryEntry[];
  archetypeAnswers: Record<string, string>;
  finalArchetype: string | null;
  // SIF system additions
  sifCounters: SIFCounters;
  sifResult: SIFResult | null;
  familyVerdicts: Record<string, { type: 'F'; severity?: number }>;
  // SIF v3 additions
  sifShortlist: string[];
  installedChoice: string | null;
}

