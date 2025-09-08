/**
 * SIF Data Resolver - Single source of truth for all SIF calculations
 * Prevents contradictions and ensures consistent data across all components
 */

import { QuizState, SIFResult } from '@/types/quiz';

// Canon Prize Mapping - Exact archetype-to-archetype mapping
const CANON_PRIZE_MAPPING: Record<string, string> = {
  // Control → Recognition
  'Control:Sovereign': 'Recognition:Diplomat',
  'Control:Rebel': 'Recognition:Spotlight',
  
  // Pace → Stress  
  'Pace:Visionary': 'Stress:Catalyst',
  'Pace:Navigator': 'Stress:Artisan',
  
  // Boundary → Bonding
  'Boundary:Equalizer': 'Bonding:Partner',
  'Boundary:Guardian': 'Bonding:Provider',
  
  // Truth → Control
  'Truth:Seeker': 'Control:Sovereign',
  'Truth:Architect': 'Control:Rebel',
  
  // Recognition → Control
  'Recognition:Spotlight': 'Control:Rebel',
  'Recognition:Diplomat': 'Control:Sovereign',
  
  // Bonding → Boundary
  'Bonding:Partner': 'Boundary:Equalizer',
  'Bonding:Provider': 'Boundary:Guardian',
  
  // Stress → Pace
  'Stress:Catalyst': 'Pace:Visionary',
  'Stress:Artisan': 'Pace:Navigator'
};

// Archetype face colors
const ARCHETYPE_COLORS: Record<string, string> = {
  'Sovereign': 'Gold',
  'Rebel': 'Red',
  'Seeker': 'Blue',
  'Visionary': 'Purple',
  'Partner': 'Pink',
  'Navigator': 'Teal',
  'Equalizer': 'Green',
  'Guardian': 'Light Blue',
  'Architect': 'Yellow',
  'Spotlight': 'Violet',
  'Diplomat': 'Amber',
  'Provider': 'Aqua',
  'Catalyst': 'Orange',
  'Artisan': 'Sapphire'
};

export interface ResolvedSIFData {
  // Core identity
  primary: { family: string; face: string };
  prize: { family: string; face: string };
  secondary: { family: string; face: string };
  neededForAlignment: { family: string; face: string };
  aligned: boolean;
  
  // Face presentation
  facePattern: string;
  colorToken: string;
  
  // Per-line data (consistent across all components)
  perLine: Array<{
    family: string;
    isALine: boolean;
    phaseB?: string[];
    module?: string[];
    purity: number;
    verdict: 'C' | 'O' | 'F';
  }>;
  
  // Severity probes
  severityProbes: Array<{
    family: string;
    resolved: 'Light F' | 'Deep F';
    action: string;
  }>;
  
  // Legacy data
  prizeChain: string;
  
  // Face vs IL analysis
  faceVsIL: Array<{
    family: string;
    face: string;
    faceScore: number;
    ilScore: number;
    label: 'Match' | 'High IL, low Face' | 'Low IL, high Face' | 'Low Both';
  }>;
}

/**
 * Resolve all SIF data from quiz state - single source of truth
 */
export function resolveSIFData(state: QuizState, sifResult: SIFResult, sifEngine: any): ResolvedSIFData {
  const primaryFace = `${state.anchor}:${state.finalArchetype}`;
  const prizeFace = CANON_PRIZE_MAPPING[primaryFace] || primaryFace;
  const secondaryFace = sifResult.secondary.face;
  
  // Calculate alignment
  const aligned = secondaryFace === prizeFace;
  
  // Get face pattern and color
  const primaryArchetype = state.finalArchetype;
  const prizeArchetype = prizeFace.split(':')[1];
  const facePattern = getFacePattern(prizeArchetype);
  const colorToken = primaryArchetype ? ARCHETYPE_COLORS[primaryArchetype] || 'Unknown' : 'Unknown';
  
  // Calculate per-line data consistently
  const perLine = calculatePerLineData(state);
  
  // Calculate severity probes
  const severityProbes = calculateSeverityProbes(state, sifEngine);
  
  // Calculate prize chain
  const prizeChain = calculatePrizeChain(state);
  
  // Calculate face vs IL analysis
  const faceVsIL = calculateFaceVsIL(sifEngine);
  
  return {
    primary: { family: state.anchor || 'Unknown', face: primaryFace },
    prize: { family: prizeFace.split(':')[0], face: prizeFace },
    secondary: { family: secondaryFace.split(':')[0], face: secondaryFace },
    neededForAlignment: { family: prizeFace.split(':')[0], face: prizeFace },
    aligned,
    facePattern,
    colorToken,
    perLine,
    severityProbes,
    prizeChain,
    faceVsIL
  };
}

/**
 * Calculate per-line data consistently
 */
function calculatePerLineData(state: QuizState) {
  const lineOrder = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
  
  return lineOrder.map(lineId => {
    const line = state.lines.find(l => l.id === lineId);
    if (!line) {
      return {
        family: lineId,
        isALine: false,
        purity: 0,
        verdict: 'O' as const
      };
    }
    
    if (line.selectedA && line.B.picks.length >= 2) {
      // A-line: use Phase B picks
      const p1 = line.B.picks[0];
      const p2 = line.B.picks[1];
      
      // Convert F to O for verdict calculation
      const pick1 = p1 === 'F' ? 'O' : p1;
      const pick2 = p2 === 'F' ? 'O' : p2;
      
      // A-line verdict logic: if both picks are C, verdict is C; otherwise O
      const verdict = (pick1 === 'C' && pick2 === 'C') ? 'C' as const : 'O' as const;
      
      // Calculate face purity
      const purity = 0.6 + (pick1 === 'C' ? 1.0 : 0.6) + (pick2 === 'C' ? 1.0 : 0.6);
      
      return {
        family: lineId,
        isALine: true,
        phaseB: line.B.picks,
        purity,
        verdict
      };
    } else if (line.mod.decisions.length >= 3) {
      // Non-A line: use module decisions
      const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
      const key = `${by.CO1 ?? ''}${by.CO2 ?? ''}${by.CF ?? ''}`;
      const verdict = ({
        CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
        OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
      }[key] || 'O') as 'C' | 'O' | 'F';
      
      // Calculate module purity
      let purity = 0;
      line.mod.decisions.forEach(decision => {
        if (decision.type === 'CO1' || decision.type === 'CO2') {
          if (decision.pick === 'C') purity += 1.0;
          else if (decision.pick === 'O') purity -= 1.0;
        } else if (decision.type === 'CF') {
          if (decision.pick === 'C') purity += 1.6;
          else if (decision.pick === 'F') purity -= 1.6;
        }
      });
      
      return {
        family: lineId,
        isALine: false,
        module: line.mod.decisions.map(d => d.pick),
        purity,
        verdict
      };
    } else {
      return {
        family: lineId,
        isALine: false,
        purity: 0,
        verdict: 'O' as const
      };
    }
  });
}

/**
 * Calculate severity probes
 */
function calculateSeverityProbes(state: QuizState, sifEngine: any) {
  const severityProbes: Array<{ family: string; resolved: 'Light F' | 'Deep F'; action: string }> = [];
  
  state.lines.forEach(line => {
    // Check if line has F verdict
    let verdict = '';
    if (line.selectedA && line.B.picks.length >= 2) {
      const p1 = line.B.picks[0];
      const p2 = line.B.picks[1];
      if (p1 === 'F' || p2 === 'F') {
        verdict = 'F';
      }
    } else if (line.mod.decisions.length >= 3) {
      const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
      const key = `${by.CO1 ?? ''}${by.CO2 ?? ''}${by.CF ?? ''}`;
      verdict = {
        CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
        OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
      }[key] || 'O';
    }
    
    if (verdict === 'F') {
      // Check if severity probe was answered
      const sifEngineCounters = sifEngine?.getCounters?.();
      const severityValue = sifEngineCounters?.sevF?.[line.id];
      
      if (severityValue !== undefined && severityValue !== null) {
        const resolved = severityValue === 1 || severityValue === '1' || severityValue === 0 || severityValue === '0' ? 'Light F' : 'Deep F';
        const action = resolved === 'Light F' ? 'Track pattern; no install needed' : 'Add counter-routine; monitor 30 days';
        
        severityProbes.push({
          family: line.id,
          resolved,
          action
        });
      }
    }
  });
  
  return severityProbes;
}

/**
 * Calculate prize chain
 */
function calculatePrizeChain(state: QuizState) {
  const lineOrder = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
  const verdicts: string[] = [];
  
  lineOrder.forEach(lineId => {
    const line = state.lines.find(l => l.id === lineId);
    if (!line) {
      verdicts.push('?');
      return;
    }
    
    if (line.selectedA && line.B.picks.length >= 2) {
      const p1 = line.B.picks[0];
      const p2 = line.B.picks[1];
      const pick1 = p1 === 'F' ? 'O' : p1;
      const pick2 = p2 === 'F' ? 'O' : p2;
      const verdict = (pick1 === 'C' && pick2 === 'C') ? 'C' : 'O';
      verdicts.push(verdict);
    } else if (line.mod.decisions.length >= 3) {
      const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
      const key = `${by.CO1 ?? ''}${by.CO2 ?? ''}${by.CF ?? ''}`;
      const verdict = {
        CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
        OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
      }[key] || 'O';
      verdicts.push(verdict);
    } else {
      verdicts.push('?');
    }
  });
  
  return verdicts.join(' ');
}

/**
 * Calculate face vs IL analysis
 */
function calculateFaceVsIL(sifEngine: any) {
  if (!sifEngine) return [];
  
  const ilScores = sifEngine.getILScores();
  const ilValues = Object.values(ilScores) as number[];
  const maxIL = Math.max(...ilValues);
  const minIL = Math.min(...ilValues);
  const range = maxIL - minIL;
  
  return Object.entries(ilScores).map(([face, il]) => {
    const faceScore = range > 0 ? ((il as number) - minIL) / range : 0.5;
    const ilScore = il as number;
    
    let label: 'Match' | 'High IL, low Face' | 'Low IL, high Face' | 'Low Both';
    if (ilScore >= 2.0 && faceScore >= 0.7) {
      label = 'Match';
    } else if (ilScore >= 2.0 && faceScore < 0.7) {
      label = 'High IL, low Face';
    } else if (ilScore < 2.0 && faceScore >= 0.7) {
      label = 'Low IL, high Face';
    } else {
      label = 'Low Both';
    }
    
    return {
      family: face.split(':')[0],
      face,
      faceScore,
      ilScore,
      label
    };
  }).sort((a, b) => b.ilScore - a.ilScore);
}

/**
 * Get face pattern description
 */
function getFacePattern(archetype: string): string {
  const patterns: Record<string, string> = {
    'Diplomat': 'Authority through negotiation and bridge-building',
    'Spotlight': 'Disruption with visibility and public impact',
    'Catalyst': 'Vision with ignition and breakthrough under pressure',
    'Artisan': 'Navigation with crafted output and precision',
    'Partner': 'Fairness with loyalty and human connection',
    'Provider': 'Protection with service and sustainable care',
    'Sovereign': 'Truth with decisive calls and direction',
    'Rebel': 'Architecture with stress-testing and adaptation',
    'Equalizer': 'Partnership with healthy boundaries and limits',
    'Guardian': 'Provision with protective edges and sustainability',
    'Visionary': 'Catalyst with foresight and breakthrough potential',
    'Navigator': 'Artisan with mapped routes and timely delivery'
  };
  return patterns[archetype] || 'Mirror pattern that balances and completes the anchor';
}

/**
 * Get analysis text for face vs IL
 */
export function getFaceVsILAnalysisText(label: string): string {
  const texts: Record<string, string> = {
    'Match': 'Inside and outside agree.',
    'High IL, low Face': 'Outside expects this from you; inside you don\'t carry it.',
    'Low IL, high Face': 'You carry this inside; others don\'t expect it.',
    'Low Both': 'Not strong inside; not expected outside.'
  };
  return texts[label] || 'Analysis not available.';
}
