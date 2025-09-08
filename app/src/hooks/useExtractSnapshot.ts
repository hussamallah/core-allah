import { useState, useEffect } from 'react';
import { QuizState } from '@/types/quiz';
import { ExtractSnapshot, LinePath, FaceIL, AnchorResult, SecondaryResult, PrizeResult, FaceScoreboard, FaceMatchAnalysis, ShortlistFormation, SeverityResult, OWobbleDiagnostics } from '@/types/Extract';

export const useExtractSnapshot = (state: QuizState) => {
  const [extractSnapshot, setExtractSnapshot] = useState<ExtractSnapshot | null>(null);

  useEffect(() => {
    if (state.phase === 'Summary' && state.sifResult && !extractSnapshot) {
      console.log('🔍 Building extract snapshot...');
      
      const snapshot = buildExtractSnapshot(state);
      setExtractSnapshot(snapshot);
      
      console.log('✅ Extract snapshot built:', snapshot);
    }
  }, [state.phase, state.sifResult, extractSnapshot]);

  return extractSnapshot;
};

const buildExtractSnapshot = (state: QuizState): ExtractSnapshot => {
  // Build line paths
  const linePaths: Record<string, LinePath> = {};
  
  state.lines.forEach(line => {
    if (line.selectedA && line.B.picks.length >= 2) {
      // A-line path
      const decisions = line.B.picks as ("C"|"O"|"F")[];
      const key = decisions.join('');
      const verdict: "C" | "O" = (decisions[0] === 'C' && decisions[1] === 'C') ? 'C' : 'O';
      const modulePurity = 0.6 + (decisions[0] === 'C' ? 1.0 : 0.6) + (decisions[1] === 'C' ? 1.0 : 0.6);
      
      linePaths[line.id] = {
        family: line.id as any,
        kind: "A",
        decisions,
        key,
        verdict,
        modulePurity,
        counters: {
          cCount: decisions.filter(d => d === 'C').length,
          oCount: decisions.filter(d => d === 'O').length,
          fCount: decisions.filter(d => d === 'F').length,
          earlyO: decisions[0] === 'O' ? 1 : 0,
          endedF: decisions[decisions.length - 1] === 'F' ? 1 : 0,
          seedF: false // TODO: Get from actual seedF logic
        }
      };
    } else if (line.mod.decisions.length >= 3) {
      // Module path
      const decisions = line.mod.decisions.map(d => d.pick) as ("C"|"O"|"F")[];
      const key = decisions.join('');
      const verdict: "C" | "O" | "F" = ({
        CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
        OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
      }[key] || 'O') as "C" | "O" | "F";
      
      let modulePurity = 0;
      line.mod.decisions.forEach(decision => {
        if (decision.type === 'CO1' || decision.type === 'CO2') {
          if (decision.pick === 'C') modulePurity += 1.0;
          else if (decision.pick === 'O') modulePurity -= 1.0;
        } else if (decision.type === 'CF') {
          if (decision.pick === 'C') modulePurity += 1.6;
          else if (decision.pick === 'F') modulePurity -= 1.6;
        }
      });
      
      linePaths[line.id] = {
        family: line.id as any,
        kind: "M",
        decisions,
        key,
        verdict,
        modulePurity,
        counters: {
          cCount: decisions.filter(d => d === 'C').length,
          oCount: decisions.filter(d => d === 'O').length,
          fCount: decisions.filter(d => d === 'F').length,
          earlyO: decisions[0] === 'O' ? 1 : 0,
          endedF: decisions[decisions.length - 1] === 'F' ? 1 : 0
        }
      };
    }
  });

  // Build IL faces (simplified - would need actual SIF engine data)
  const ilFaces: FaceIL[] = [];
  
  // Build anchor result
  const anchor: AnchorResult = {
    line: state.anchor as any,
    archetype: state.finalArchetype || 'Unknown',
    source: "E:Purity", // TODO: Determine if tie-break occurred
    tie: undefined // TODO: Add tie-break logic
  };

  // Build secondary result
  const secondary: SecondaryResult = {
    shortlist: state.sifShortlist || [],
    installedChoice: state.installedChoice || '',
    collision: false, // TODO: Determine collision
    resolved: state.sifResult?.secondary?.face || ''
  };

  // Build prize result
  const prize: PrizeResult = {
    prizeFace: state.sifResult?.primary?.face || '',
    mirrorArchetype: 'Unknown', // TODO: Get from prize mirror logic
    hasMirrorGain: false, // TODO: Calculate mirror gain
    mirrorMismatch: false, // TODO: Calculate mismatch
    suggestedHabits: [], // TODO: Generate suggestions
    alignmentScore: 0.5 // TODO: Calculate alignment
  };

  // Build face scores (simplified)
  const faceScores: Record<string, FaceScoreboard> = {};

  // Build face match analysis (simplified)
  const faceMatchAnalysis: FaceMatchAnalysis[] = [];

  // Build shortlist formation (simplified)
  const shortlistFormation: ShortlistFormation = {
    candidates: (state.sifShortlist || []).map(face => ({
      face,
      il: 1.0, // TODO: Get actual IL scores
      family: face.split(':')[0] as any,
      included: true,
      reason: 'top IL'
    })),
    finalShortlist: state.sifShortlist || [],
    familyDiversityCheck: true, // TODO: Calculate diversity
    prunedCandidates: []
  };

  // Build severity results (simplified)
  const severityResults: SeverityResult[] = [];

  // Build O-wobble diagnostics
  const oWobbleDiagnostics: OWobbleDiagnostics[] = Object.values(linePaths).map(path => ({
    family: path.family,
    earlyO: path.counters.earlyO,
    oHits: path.counters.oCount,
    oRatio: path.counters.oCount / 2,
    endedF: path.counters.endedF,
    seedF: path.counters.seedF || false
  }));

  // Build timestamps (simplified - would need actual timing data)
  const timestamps = {
    phaseA: 0,
    phaseB: 0,
    phaseC: 0,
    phaseD: 0,
    phaseE: 0,
    totalDuration: 0
  };

  // Build why primary evidence
  const whyPrimary = {
    evidence: [
      `Selected ${state.anchor} as primary family`,
      `Archetype: ${state.finalArchetype}`,
      `Based on purity calculations and SIF Canon v3 logic`
    ],
    strength: 1.0, // TODO: Calculate actual strength
    tieBreakers: [] // TODO: Add tie-breaker reasons
  };

  return {
    canonVersion: "SIF Canon v3",
    verdictTableVersion: "v1.0",
    buildHash: undefined,
    anchor,
    primaryFace: `${state.anchor}:${state.finalArchetype}`,
    secondary,
    prize,
    linePaths: linePaths as Record<string, LinePath>,
    ilFaces,
    faceScores,
    faceMatchAnalysis,
    shortlistFormation,
    severityResults,
    oWobbleDiagnostics,
    timestamps,
    whyPrimary
  };
};
