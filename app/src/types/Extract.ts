// Enhanced Extractor System Types
export type Decision = "C" | "O" | "F";
export type ProbeResult = "F1" | "F.5";
export type Family = "Control"|"Pace"|"Boundary"|"Truth"|"Recognition"|"Bonding"|"Stress";

export interface LinePath {
  family: Family;
  // Phase B for A-lines OR Phase C for modules
  kind: "A" | "M";
  decisions: Decision[];     // e.g. ["C","O","C"]
  key: string;               // e.g. "COC"
  verdict: Decision;         // computed via VERDICT_TABLE or B-path rule
  modulePurity: number;      // Phase D purity
  fProbe?: {
    run: boolean;
    result?: ProbeResult;    // "F1" or "F.5"
    outcomeText?: string;    // "persistent collapse", etc.
    numericValue?: number;   // resolved numeric, not template
  };
  counters: {
    cCount: number;          // number of C
    oCount: number;          // number of O
    fCount: number;          // number of F
    earlyO: 0|1;             // O on first decision/pick
    endedF: 0|1;             // last decision F
    seedF?: boolean;         // Phase B "seedF"
  };
}

export interface FaceIL {
  face: string;              // e.g. "Pace:Visionary"
  source: "A"|"M";
  il: number;
  breakdown: {
    cCount?: number;
    driftRatio?: number;     // (3 - cCount)/3
    endedF?: 0|1;
    isCCC?: 0|1;             // cCount == 3
    purityGap?: number;      // clamp((2.6 - facePurity)/2, 0, 1)
    bonuses: { 
      sibling: number;       // +1.0 if sibling in candidate family
      prize: number;         // +0.5 if prize mirror
    };
  }
}

export interface AnchorResult {
  line: Family;
  archetype: string;         // e.g. "Visionary"
  source: "E:Purity" | "E:TieBreak";
  tie?: { 
    candidates: Family[]; 
    selected: Family;
    reason: string;          // "cleanliness", "latency", "seeded"
  };
}

export interface SecondaryResult {
  shortlist: string[];       // 4 faces
  installedChoice: string;   // user pick from Phase D card
  collision: boolean;        // true if anchor==installed then downgraded
  collisionDetails?: {
    anchorFace: string;
    installedFace: string;
    downgradedTo: string;
  };
  resolved: string;          // final secondary face
}

export interface PrizeResult {
  prizeFace: string;         // e.g. "Truth:Architect"
  mirrorArchetype: string;   // e.g. "Stress"
  hasMirrorGain: boolean;
  mirrorMismatch: boolean;
  suggestedHabits: string[]; // ["Seeker during reviews"]
  alignmentScore: number;    // 0-1
}

export interface FaceScoreboard {
  face: string;
  internalStrength: number;  // 0-1 final score
  components: {
    NI: number;              // Natural Instinct
    SI: number;              // Situational Instinct  
    II: number;              // Installed Instinct
  };
}

export interface FaceMatchAnalysis {
  face: string;
  badge: "Aligned" | "Imposed" | "Hidden";
  reasoning: string;
}

export interface ShortlistFormation {
  candidates: Array<{
    face: string;
    il: number;
    family: Family;
    included: boolean;
    reason: string;          // "top IL", "family diversity", "pruned"
  }>;
  finalShortlist: string[];
  familyDiversityCheck: boolean;
  prunedCandidates: string[];
}

export interface SeverityResult {
  family: Family;
  result: "F1" | "F.5";
  outcomeText: string;       // "transient collapse", "structural collapse"
  numericValue: number;      // resolved numeric, not template
}

export interface OWobbleDiagnostics {
  family: Family;
  earlyO: 0|1;
  oHits: number;
  oRatio: number;            // oHits / 2
  endedF: 0|1;
  seedF: boolean;
}

export interface ExtractSnapshot {
  // Versioning
  canonVersion: string;      // "SIF Canon v3"
  verdictTableVersion: string;
  buildHash?: string;
  
  // Core Results
  anchor: AnchorResult;
  primaryFace: string;       // anchor as face
  secondary: SecondaryResult;
  prize: PrizeResult;
  
  // Complete Engine Truths
  linePaths: Record<Family, LinePath>;
  ilFaces: FaceIL[];
  faceScores: Record<string, FaceScoreboard>;
  faceMatchAnalysis: FaceMatchAnalysis[];
  shortlistFormation: ShortlistFormation;
  severityResults: SeverityResult[];
  oWobbleDiagnostics: OWobbleDiagnostics[];
  
  // Performance & Audit
  timestamps: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
    phaseD: number;
    phaseE: number;
    totalDuration: number;
  };
  
  // Human-Readable Evidence
  whyPrimary: {
    evidence: string[];
    strength: number;
    tieBreakers: string[];
  };
}
