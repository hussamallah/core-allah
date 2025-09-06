/**
 * SIF (Secondary Identity Face) System Types and Constants
 * 
 * This module contains all the types, constants, and mappings needed for the SIF system.
 * Import this into any quiz application to use the SIF logic.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

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

// ============================================================================
// FACE AND FAMILY MAPPINGS
// ============================================================================

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

// ============================================================================
// PRIZE MIRROR SYSTEM
// ============================================================================

// Prize Mirror mapping - each archetype maps to its corrective counterpart
export const PRIZE_MIRROR_MAP: Record<string, string> = {
  // Control family
  'Control:Rebel': 'Truth:Architect',     // Rebel → Architect (F)
  'Control:Sovereign': 'Recognition:Diplomat', // Sovereign → Diplomat (F)
  
  // Pace family  
  'Pace:Visionary': 'Truth:Architect',    // Visionary → Architect (F)
  'Pace:Navigator': 'Boundary:Guardian',  // Navigator → Guardian (F)
  
  // Boundary family
  'Boundary:Equalizer': 'Control:Sovereign', // Equalizer → Sovereign (M)
  'Boundary:Guardian': 'Recognition:Diplomat', // Guardian → Diplomat (F)
  
  // Truth family
  'Truth:Seeker': 'Control:Rebel',        // Seeker → Rebel (F)
  'Truth:Architect': 'Stress:Catalyst',   // Architect → Catalyst (F)
  
  // Recognition family
  'Recognition:Spotlight': 'Truth:Architect', // Spotlight → Architect (M)
  'Recognition:Diplomat': 'Control:Sovereign', // Diplomat → Sovereign (M)
  
  // Bonding family
  'Bonding:Partner': 'Boundary:Equalizer', // Partner → Equalizer (M)
  'Bonding:Provider': 'Boundary:Guardian', // Provider → Guardian (F)
  
  // Stress family
  'Stress:Catalyst': 'Pace:Navigator',    // Catalyst → Navigator (F)
  'Stress:Artisan': 'Pace:Visionary'      // Artisan → Visionary (M)
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

// ============================================================================
// FACE ANCHOR MAPPING FOR PHASE C QUESTIONS
// ============================================================================

export const FACE_ANCHOR: Record<string, { CO1: string; CO2: string; CF: string; TIE: [string, string] }> = {
  'Control': { CO1: 'Rebel', CO2: 'Sovereign', TIE: ['Rebel', 'Sovereign'], CF: 'Rebel' },
  'Pace': { CO1: 'Visionary', CO2: 'Navigator', TIE: ['Visionary', 'Navigator'], CF: 'Visionary' },
  'Boundary': { CO1: 'Equalizer', CO2: 'Guardian', TIE: ['Equalizer', 'Guardian'], CF: 'Equalizer' },
  'Truth': { CO1: 'Seeker', CO2: 'Architect', TIE: ['Seeker', 'Architect'], CF: 'Seeker' },
  'Recognition': { CO1: 'Spotlight', CO2: 'Diplomat', TIE: ['Spotlight', 'Diplomat'], CF: 'Spotlight' },
  'Bonding': { CO1: 'Partner', CO2: 'Provider', TIE: ['Partner', 'Provider'], CF: 'Partner' },
  'Stress': { CO1: 'Catalyst', CO2: 'Artisan', TIE: ['Catalyst', 'Artisan'], CF: 'Catalyst' }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// Helper function to create face key from family and face
export function createFaceKey(family: string, face: string): string {
  return `${family}:${face}`;
}

// Helper function to parse face key into family and face
export function parseFaceKey(faceKey: string): { family: string; face: string } {
  const [family, face] = faceKey.split(':');
  return { family: family || '', face: face || '' };
}

// ============================================================================
// FAMILY CONSTANTS
// ============================================================================

export const FAMILIES = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'] as const;

export type Family = typeof FAMILIES[number];

// ============================================================================
// QUESTION TYPES
// ============================================================================

export type QuestionType = 'CO' | 'CF' | 'TIE' | 'FINAL_PROBE' | 'SEVERITY_PROBE' | 'ARCHETYPE';
export type Choice = 'A' | 'B' | 'C';
export type Severity = 'F0' | 'F0.5' | 'F1';

// ============================================================================
// QUIZ INTEGRATION TYPES
// ============================================================================

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

export interface SIFIntegrationState {
  sifCounters: SIFCounters;
  sifResult: SIFResult | null;
  anchor: string | null;
  questionHistory: QuestionHistoryEntry[];
}

// Family verdicts for SIF calculation
export type FamilyVerdict = 'C' | 'O' | 'F';
export type FamilyVerdicts = Record<string, FamilyVerdict>;