import React, { useEffect, useState } from 'react';
import { QuizState, SIFResult, FAMILY_TO_PRIZE, FAMILIES, Family, getPrizeMirror } from '@/types/quiz';
import { prizeMirrorEngine } from '@/engine/PrizeMirrorEngine';

interface SummaryEnhancedProps {
  state: QuizState;
  onSIFCalculate: (primaryFamily: string, primaryFace: string, prizeFace?: string) => SIFResult;
  onFinalizeSIFWithInstall: (primaryFamily: string, primaryFace: string) => SIFResult;
  onRestart: () => void;
  sifEngine: any;
}

export function SummaryEnhanced({ state, onSIFCalculate, onFinalizeSIFWithInstall, onRestart, sifEngine }: SummaryEnhancedProps) {
  const [hasCalculated, setHasCalculated] = useState(false);
  const [verdictsCalculated, setVerdictsCalculated] = useState(false);
  const [prizeMirrorResult, setPrizeMirrorResult] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Calculate verdicts at the very end to include the anchor
  React.useEffect(() => {
    if (!verdictsCalculated) {
      console.log('🎯 SUMMARY PHASE - Calculating final verdicts with anchor included');
      
      // Calculate verdicts for all lines (both A and non-A)
      const verdictsToUpdate: { lineId: string; verdict: string; purity: number; needsSeverity: boolean }[] = [];
      
      state.lines.forEach(line => {
        if (line.mod.decisions.length > 0) {
          // Non-A lines: use module decisions
          const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
          const key = `${by.CO1 ?? ''}${by.CO2 ?? ''}${by.CF ?? ''}`;
          const verdict = {
            CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
            OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
          }[key] || 'O';
          
          // Calculate module purity
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
          
          verdictsToUpdate.push({ 
            lineId: line.id, 
            verdict, 
            purity: modulePurity,
            needsSeverity: verdict === 'F'
          });
        } else if (line.selectedA && line.B.picks.length >= 2) {
          // A-lines: use Phase B picks to determine verdict
          const p1 = line.B.picks[0];
          const p2 = line.B.picks[1];
          
          // Convert F to O for verdict calculation
          const pick1 = p1 === 'F' ? 'O' : p1;
          const pick2 = p2 === 'F' ? 'O' : p2;
          
          // A-line verdict logic: if both picks are C, verdict is C; otherwise O
          const verdict = (pick1 === 'C' && pick2 === 'C') ? 'C' : 'O';
          
          // Calculate face purity
          const facePurity = 0.6 + (pick1 === 'C' ? 1.0 : 0.6) + (pick2 === 'C' ? 1.0 : 0.6);
          
          verdictsToUpdate.push({ 
            lineId: line.id, 
            verdict, 
            purity: facePurity,
            needsSeverity: false
          });
        }
      });
      
      console.log('🎯 SUMMARY PHASE - Final verdicts calculated:', verdictsToUpdate);
      setVerdictsCalculated(true);
    }
  }, [verdictsCalculated, state.lines]);

  // Log SIF state at start of Summary Phase
  React.useEffect(() => {
    console.log('🎯 SUMMARY PHASE - SIF State:', {
      sifCounters: state.sifCounters,
      sifResult: state.sifResult,
      anchor: state.anchor,
      finalArchetype: state.finalArchetype,
      installedChoice: state.installedChoice,
      sifShortlist: state.sifShortlist
    });
    console.log('🎯 SUMMARY PHASE - SIF Counters Details:', {
      famC: state.sifCounters?.famC || {},
      famO: state.sifCounters?.famO || {},
      famF: state.sifCounters?.famF || {},
      faceC: state.sifCounters?.faceC || {},
      faceO: state.sifCounters?.faceO || {}
    });
  }, [state.sifResult, state.anchor, state.finalArchetype, state.installedChoice, state.sifShortlist]);

  useEffect(() => {
    console.log('🎯 SUMMARY PHASE - useEffect triggered:', {
      hasSifResult: !!state.sifResult,
      hasCalculated,
      hasAnchor: !!state.anchor,
      hasFinalArchetype: !!state.finalArchetype,
      anchor: state.anchor,
      finalArchetype: state.finalArchetype,
      sifCounters: state.sifCounters,
      familyVerdicts: state.familyVerdicts
    });
    
    if (!state.sifResult && !hasCalculated && state.anchor && state.finalArchetype) {
      // Use SIF v3 finalization if we have installed choice, otherwise fallback to old method
      const primaryFamily = state.anchor;
      const primaryFace = `${state.anchor}:${state.finalArchetype}`;
      
      console.log('🎯 CALCULATING SIF RESULT (v3):', {
        primaryFamily,
        primaryFace,
        sifCounters: state.sifCounters,
        familyVerdicts: state.familyVerdicts,
        installedChoice: state.installedChoice,
        sifShortlist: state.sifShortlist
      });
      
      setHasCalculated(true);
      
      let sifResult;
      if (state.installedChoice && state.sifShortlist.length > 0) {
        // Use new SIF v3 finalization
        console.log('🎯 Using SIF v3 finalization with installed choice');
        sifResult = onFinalizeSIFWithInstall(primaryFamily, primaryFace);
      } else {
        // Fallback to old method
        console.log('🎯 Using legacy SIF calculation (no installed choice)');
        sifResult = onSIFCalculate(primaryFamily, primaryFace);
      }
      
      console.log('🎯 SIF RESULT CALCULATED:', sifResult);
      
      // Calculate Prize/Mirror/Secondary result
      const prizeMirror = prizeMirrorEngine.calculateResult(
        state.anchor,
        state.finalArchetype,
        sifResult?.secondary?.face
      );
      console.log('🎯 SUMMARY PHASE - Prize/Mirror Result:', prizeMirror);
      setPrizeMirrorResult(prizeMirror);
      
      // Store debug info for display
      setDebugInfo({
        primaryFamily,
        primaryFace,
        installedChoice: state.installedChoice,
        sifShortlist: state.sifShortlist,
        sifCounters: state.sifCounters,
        prizeMirror
      });
    } else {
      console.log('🎯 SUMMARY PHASE - Not calculating SIF because:', {
        hasSifResult: !!state.sifResult,
        hasCalculated,
        hasAnchor: !!state.anchor,
        hasFinalArchetype: !!state.finalArchetype
      });
    }
  }, [state.anchor, state.finalArchetype, state.sifResult, hasCalculated, onSIFCalculate, onFinalizeSIFWithInstall, state.installedChoice, state.sifShortlist]);

  if (!state.sifResult) {
    return (
      <div className="bg-black text-white min-h-screen p-7">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
            <div className="text-white text-xl">Calculating SIF result...</div>
            <div className="text-gray-400 text-sm mt-2">
              Processing Phase D verdicts and SIF Canon v3 finalization...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { primary, secondary, badge, context } = state.sifResult;
  
  // Canon table: Archetype → Prize Role + Mirror Archetype
  const MIRROR_MAP: Record<string, { prize: string; mirror: string; mirror_voice_gender: 'F' | 'M' }> = {
    'Sovereign': { prize: 'Authority', mirror: 'Diplomat', mirror_voice_gender: 'M' },
    'Rebel': { prize: 'Authority', mirror: 'Architect', mirror_voice_gender: 'M' },
    'Visionary': { prize: 'Timekeeper', mirror: 'Seeker', mirror_voice_gender: 'M' },
    'Navigator': { prize: 'Timekeeper', mirror: 'Seeker', mirror_voice_gender: 'M' },
    'Equalizer': { prize: 'Gatekeeper', mirror: 'Provider', mirror_voice_gender: 'M' },
    'Guardian': { prize: 'Gatekeeper', mirror: 'Partner', mirror_voice_gender: 'M' },
    'Seeker': { prize: 'Decider', mirror: 'Visionary', mirror_voice_gender: 'M' },
    'Architect': { prize: 'Decider', mirror: 'Rebel', mirror_voice_gender: 'M' },
    'Spotlight': { prize: 'Witness', mirror: 'Sovereign', mirror_voice_gender: 'M' },
    'Diplomat': { prize: 'Witness', mirror: 'Sovereign', mirror_voice_gender: 'M' },
    'Partner': { prize: 'Anchor', mirror: 'Guardian', mirror_voice_gender: 'M' },
    'Provider': { prize: 'Anchor', mirror: 'Equalizer', mirror_voice_gender: 'M' },
    'Catalyst': { prize: 'Igniter', mirror: 'Artisan', mirror_voice_gender: 'M' },
    'Artisan': { prize: 'Igniter', mirror: 'Catalyst', mirror_voice_gender: 'M' }
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
  
  // Archetype tendency and corrective mappings
  const ARCHETYPE_TENDENCIES: Record<string, { tendency: string; corrective: string; action: string }> = {
    'Sovereign': { tendency: 'claims the room', corrective: 'creates consent', action: 'Write a 3-step frame and assign owners.' },
    'Rebel': { tendency: 'breaks constraints', corrective: 'builds structure', action: 'Name the constraint and pick the next smallest ship.' },
    'Visionary': { tendency: 'sees far', corrective: 'tests what\'s real now', action: 'Freeze scope; open a follow-on lane.' },
    'Navigator': { tendency: 'plots routes', corrective: 'validates the next step', action: 'Name the constraint and pick the next smallest ship.' },
    'Equalizer': { tendency: 'enforces fairness', corrective: 'meets the need', action: 'Write a 3-step frame and assign owners.' },
    'Guardian': { tendency: 'protects', corrective: 'binds loyalty', action: 'Freeze scope; open a follow-on lane.' },
    'Seeker': { tendency: 'hunts patterns', corrective: 'frames direction', action: 'Write a 3-step frame and assign owners.' },
    'Architect': { tendency: 'orders systems', corrective: 'creates motion', action: 'Name the constraint and pick the next smallest ship.' },
    'Spotlight': { tendency: 'demands visibility', corrective: 'sets direction', action: 'Write a 3-step frame and assign owners.' },
    'Diplomat': { tendency: 'bridges factions', corrective: 'lands the call', action: 'Write a 3-step frame and assign owners.' },
    'Partner': { tendency: 'holds bonds', corrective: 'defends the bond', action: 'Freeze scope; open a follow-on lane.' },
    'Provider': { tendency: 'serves needs', corrective: 'keeps balance', action: 'Write a 3-step frame and assign owners.' },
    'Catalyst': { tendency: 'sparks change', corrective: 'finishes with quality', action: 'Name the constraint and pick the next smallest ship.' },
    'Artisan': { tendency: 'perfects craft', corrective: 'initiates action', action: 'Freeze scope; open a follow-on lane.' }
  };
  
  // Prize role microcopy
  const PRIZE_MICROCOPY: Record<string, string> = {
    'Authority': 'Set direction when others drift.',
    'Timekeeper': 'Hold the tempo so work finishes on time.',
    'Gatekeeper': 'Decide what crosses the line and what waits.',
    'Decider': 'Land the call when ambiguity stalls the room.',
    'Witness': 'Name what\'s real and make it visible.',
    'Anchor': 'Stabilize the bond so people don\'t spin.',
    'Igniter': 'Spark motion when pressure hits.'
  };
  
  // Get the prize role and mirror for the primary archetype
  const primaryArchetype = primary.face.split(':')[1] || primary.face;
  const mirrorData = MIRROR_MAP[primaryArchetype] || { prize: 'Unknown', mirror: 'Unknown', mirror_voice_gender: 'M' };
  const canonicalPrize = mirrorData.prize;
  const prizeMirrorArchetype = mirrorData.mirror;
  const mirrorVoiceGender = mirrorData.mirror_voice_gender;
  
  // Check alignment: Secondary = Mirror → alignment gain
  const secondaryArchetype = secondary.face.split(':')[1] || secondary.face;
  const isAligned = secondaryArchetype === prizeMirrorArchetype;
  
  // Calculate SIF metrics for display
  const sifCounters = state.sifCounters;
  const primaryFaces = ['Control:Rebel', 'Control:Sovereign', 'Pace:Visionary', 'Pace:Navigator', 'Boundary:Equalizer', 'Boundary:Guardian', 'Truth:Seeker', 'Truth:Architect', 'Recognition:Spotlight', 'Recognition:Diplomat', 'Bonding:Partner', 'Bonding:Provider', 'Stress:Catalyst', 'Stress:Artisan'];
  const candidateFaces = primaryFaces.filter(face => !face.startsWith(primary.family));
  
  // Use SIF Canon v3 Installed Likelihood (IL) scores from the engine
  const faceScores: Record<string, number> = {};
  
  // Get the actual IL scores from the SIF Engine
  const ilScores: Record<string, number> = sifEngine.getILScores();
  
  // Normalize IL scores to 0-1 range for display
  const ilValues = Object.values(ilScores) as number[];
  const maxIL = Math.max(...ilValues);
  const minIL = Math.min(...ilValues);
  const range = maxIL - minIL;
  
  Object.entries(ilScores).forEach(([face, il]) => {
    faceScores[face] = range > 0 ? (il - minIL) / range : 0.5;
  });

  // Get top 6 faces by score
  const topFaces = Object.entries(faceScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  // Calculate purity for all lines
  const allPurity: Record<string, number> = {};
  state.lines.forEach(line => {
    if (line.selectedA) {
      allPurity[line.id] = line.B.C_evidence;
    } else {
      // Use canonical purity formula for non-A lines
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
      allPurity[line.id] = purity;
    }
  });

  // Calculate prize chain from actual verdicts
  const calculatePrizeChain = () => {
    const verdicts: string[] = [];
    
    // Order: Control, Pace, Boundary, Truth, Recognition, Bonding, Stress
    const lineOrder = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
    
    lineOrder.forEach(lineId => {
      const line = state.lines.find(l => l.id === lineId);
      if (!line) {
        verdicts.push('?');
        return;
      }
      
      if (line.selectedA && line.B?.picks && line.B.picks.length >= 2) {
        // A-lines: use Phase B picks to determine verdict
        const p1 = line.B.picks[0];
        const p2 = line.B.picks[1];
        
        // Convert F to O for verdict calculation
        const pick1 = p1 === 'F' ? 'O' : p1;
        const pick2 = p2 === 'F' ? 'O' : p2;
        
        // A-line verdict logic: if both picks are C, verdict is C; otherwise O
        const verdict = (pick1 === 'C' && pick2 === 'C') ? 'C' : 'O';
        verdicts.push(verdict);
      } else if (line.mod?.decisions && line.mod.decisions.length >= 3) {
        // Non-A lines: use module decisions
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
  };

  // Generate SIF Canon v3 reasoning for secondary selection
  const generateSecondaryReasoning = () => {
    if (!state.installedChoice || !state.sifShortlist || state.sifShortlist.length === 0) {
      return "• Secondary selection requires Phase D install choice and shortlist data.<br/>• Run complete quiz flow to see InstalledLikelihood reasoning.";
    }

    const installedFace = state.installedChoice;
    const shortlist = state.sifShortlist;
    const secondaryFamily = installedFace.split(':')[0];
    
    // Find the line data for the installed face
    const installedLine = state.lines.find(line => {
      if (line.selectedA && line.B?.picks) {
        // A-line: determine face from B-path
        const bPath = line.B.picks as ("C"|"O"|"F")[];
        const face = determineFaceFromBPath(line.id, bPath);
        return face === installedFace;
      } else if (line.mod?.decisions && line.mod.decisions.length >= 3) {
        // Module line: determine face from M-path
        const mPath = line.mod.decisions.map(d => d.pick) as ("C"|"O"|"F")[];
        const face = determineFaceFromMPath(line.id, mPath);
        return face === installedFace;
      }
      return false;
    });

    if (!installedLine) {
      return "• Secondary face data not found in quiz state.<br/>• Check Phase B/C completion and face determination logic.";
    }

    const isALine = installedLine.selectedA;
    const reasoning: string[] = [];

    if (isALine && installedLine.B?.picks) {
      // A-line reasoning based on B-path
      const bPath = installedLine.B.picks as ("C"|"O"|"F")[];
      const earlyO = bPath[0] === "O" ? 1 : 0;
      const fTouch = bPath.indexOf("F") !== -1 ? 1 : 0;
      const oHits = bPath.filter(p => p === "O").length;
      const oRatio = oHits / 2;
      const purity = computeFacePurityFromB(bPath);
      const purityGap = Math.max(0, Math.min(1, (2.6 - purity) / 2));
      
      reasoning.push(`• A-line ${installedFace} selected from Phase B path [${bPath.join(', ')}]`);
      reasoning.push(`• InstalledLikelihood factors: earlyO=${earlyO}, fTouch=${fTouch}, oRatio=${oRatio}, purityGap=${purityGap.toFixed(2)}`);
      reasoning.push(`• Base IL: ${(1.6*earlyO + 1.2*fTouch + 0.8*oRatio + 0.8*purityGap).toFixed(2)} (1.6×${earlyO} + 1.2×${fTouch} + 0.8×${oRatio} + 0.8×${purityGap.toFixed(2)})`);
      
      if (earlyO > 0) reasoning.push(`• Early O-pick shows off-axis tendency, boosting install likelihood`);
      if (fTouch > 0) reasoning.push(`• F-touch indicates override capability, high install signal`);
      if (oRatio > 0) reasoning.push(`• O-ratio ${oRatio} shows consistent off-axis behavior`);
      if (purityGap > 0) reasoning.push(`• Purity gap ${purityGap.toFixed(2)} indicates distance from 2.6 threshold`);
      
    } else if (installedLine.mod?.decisions && installedLine.mod.decisions.length >= 3) {
      // Module line reasoning based on M-path
      const mPath = installedLine.mod.decisions.map(d => d.pick) as ("C"|"O"|"F")[];
      const cCount = mPath.filter(p => p === "C").length;
      const driftRatio = (3 - cCount) / 3;
      const endedF = mPath[2] === "F" ? 1 : 0;
      const isCCC = cCount === 3 ? 1 : 0;
      
      reasoning.push(`• Module ${installedFace} selected from Phase C path [${mPath.join(', ')}]`);
      reasoning.push(`• InstalledLikelihood factors: cCount=${cCount}, driftRatio=${driftRatio.toFixed(2)}, endedF=${endedF}, isCCC=${isCCC}`);
      reasoning.push(`• Base IL: ${(1.6*isCCC + 1.4*endedF + 0.8*driftRatio).toFixed(2)} (1.6×${isCCC} + 1.4×${endedF} + 0.8×${driftRatio.toFixed(2)})`);
      
      if (isCCC > 0) reasoning.push(`• Perfect CCC pattern shows strong Control alignment`);
      if (endedF > 0) reasoning.push(`• Ended-F indicates override capability, high install signal`);
      if (driftRatio > 0) reasoning.push(`• Drift ratio ${driftRatio.toFixed(2)} shows off-axis tendency`);
    }

    // Add shortlist context
    const shortlistIndex = shortlist.indexOf(installedFace);
    if (shortlistIndex >= 0) {
      reasoning.push(`• Selected from shortlist position ${shortlistIndex + 1}/${shortlist.length}: [${shortlist.join(', ')}]`);
    }

    // Add anchor candidate family bonus if applicable
    const anchorFamily = state.anchor;
    if (secondaryFamily === anchorFamily) {
      reasoning.push(`• Sibling bonus: ${installedFace} family matches anchor ${anchorFamily} (+1.0 IL)`);
    }

    // Add prize mirror bonus if applicable
    const prizeFace = getPrizeMirror(`${anchorFamily}:${state.finalArchetype}`);
    if (installedFace === prizeFace) {
      reasoning.push(`• Prize mirror bonus: ${installedFace} matches prize ${prizeFace} (+0.5 IL)`);
    }

    return reasoning.join('<br/>');
  };

  // Helper functions for face determination
  const determineFaceFromBPath = (lineId: string, bPath: ("C"|"O"|"F")[]): string => {
    // Simplified face determination - in real implementation this would use the full logic
    const family = lineId;
    const hasEarlyO = bPath[0] === "O";
    const hasFTouch = bPath.indexOf("F") !== -1;
    
    // Basic face mapping based on B-path patterns
    if (family === "Control") return hasEarlyO ? "Control:Rebel" : "Control:Sovereign";
    if (family === "Pace") return hasEarlyO ? "Pace:Driver" : "Pace:Navigator";
    if (family === "Boundary") return hasEarlyO ? "Boundary:Equalizer" : "Boundary:Guardian";
    if (family === "Truth") return hasEarlyO ? "Truth:Seeker" : "Truth:Architect";
    if (family === "Recognition") return hasEarlyO ? "Recognition:Diplomat" : "Recognition:Spotlight";
    if (family === "Bonding") return hasEarlyO ? "Bonding:Provider" : "Bonding:Partner";
    if (family === "Stress") return hasEarlyO ? "Stress:Artisan" : "Stress:Catalyst";
    
    return `${family}:Unknown`;
  };

  const determineFaceFromMPath = (lineId: string, mPath: ("C"|"O"|"F")[]): string => {
    // Simplified face determination for module lines
    const family = lineId;
    const cCount = mPath.filter(p => p === "C").length;
    const isCCC = cCount === 3;
    
    // Basic face mapping based on M-path patterns
    if (family === "Control") return isCCC ? "Control:Sovereign" : "Control:Rebel";
    if (family === "Pace") return isCCC ? "Pace:Navigator" : "Pace:Driver";
    if (family === "Boundary") return isCCC ? "Boundary:Guardian" : "Boundary:Equalizer";
    if (family === "Truth") return isCCC ? "Truth:Architect" : "Truth:Seeker";
    if (family === "Recognition") return isCCC ? "Recognition:Spotlight" : "Recognition:Diplomat";
    if (family === "Bonding") return isCCC ? "Bonding:Partner" : "Bonding:Provider";
    if (family === "Stress") return isCCC ? "Stress:Catalyst" : "Stress:Artisan";
    
    return `${family}:Unknown`;
  };

  const computeFacePurityFromB = (bPath: ("C"|"O"|"F")[]): number => {
    // Simplified purity calculation from B-path
    let purity = 0;
    bPath.forEach(pick => {
      if (pick === "C") purity += 1.0;
      else if (pick === "O") purity -= 1.0;
      // F is treated as O for purity calculation
    });
    return purity;
  };

  // Traditional rows from sifCounters
  const families: Family[] = ["Control","Pace","Boundary","Truth","Recognition","Bonding","Stress"];
  const traditionalRows = families.map(fam => {
    const c = sifCounters?.famC?.[fam] ?? 0;
    const o = sifCounters?.famO?.[fam] ?? 0;
    const f = sifCounters?.famF?.[fam] ?? 0;
    return { family: fam, famC: c, famO: o, famF: f, total: c + o + f };
  });
  
  console.log('🎯 Traditional Rows from sifCounters:', traditionalRows);

  // Sort families by purity score (highest first) using canonical families
  const sortedFamilies = [...FAMILIES]
    .sort((a, b) => (allPurity[b] || 0) - (allPurity[a] || 0));

  // Get friction families
  const frictionFamilies = Object.keys(context.friction || {});

  // Get primary face picks for display
  const primaryLine = state.lines.find(l => l.id === primary.family);
  const primaryPicks = primaryLine?.selectedA ? primaryLine.B.picks : [];

  return (
    <div className="bg-black text-white min-h-screen p-7">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 border border-yellow-400 rounded-2xl p-4 mb-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-400">
            → {primary.family}:{primaryArchetype} | Prize = {canonicalPrize}
          </h1>
          <div className="text-sm text-gray-400 mt-2">
            Face Color: <span className="font-semibold" style={{ color: ARCHETYPE_COLORS[primaryArchetype] || '#ffffff' }}>
              {ARCHETYPE_COLORS[primaryArchetype] || 'Unknown'}
            </span>
          </div>
          {debugInfo && (
            <div className="text-xs text-gray-500 mt-2">
              SIF Canon v3 | Installed: {debugInfo.installedChoice || 'None'} | Shortlist: {debugInfo.sifShortlist?.length || 0} faces
            </div>
          )}
        </div>

        {/* Section 1 — Outward Role (Prize) */}
        <div className="bg-gradient-to-r from-yellow-300 to-orange-400 text-black rounded-2xl p-6 mb-4">
          <h2 className="text-2xl font-bold mb-3">{canonicalPrize} — Your Stable Role</h2>
          <div className="text-sm space-y-2">
            <p>You hold the Prize of <strong>{canonicalPrize}</strong>.</p>
            <p>Your outward presence is shaped through the <strong>{primaryArchetype}</strong> face.</p>
            <div className="mt-3 p-2 bg-black/10 rounded text-xs italic">
              <strong>Direction anchor:</strong> Keep {canonicalPrize} first. Treat {primaryArchetype} as your style, not your job.
            </div>
            <div className="mt-2 p-2 bg-black/10 rounded text-xs">
              <strong>Microcopy:</strong> {PRIZE_MICROCOPY[canonicalPrize] || 'Your role in the system.'}
            </div>
          </div>
        </div>

        {/* Section 2 — Mirror Install */}
        <div className="bg-gray-900 border border-gray-600 rounded-2xl p-6 mb-4">
          <h2 className="text-xl font-bold text-white mb-3">
            {prizeMirrorArchetype} — Mirror Install
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Color: <span style={{ color: ARCHETYPE_COLORS[prizeMirrorArchetype] || '#ffffff' }}>
                {ARCHETYPE_COLORS[prizeMirrorArchetype] || 'Unknown'}
              </span>)
            </span>
          </h2>
          <div className="text-sm text-gray-300 space-y-2">
            <p>To lock <strong>{canonicalPrize}</strong>, adopt the <strong>{prizeMirrorArchetype}</strong> pattern in <strong>{mirrorVoiceGender === 'M' ? 'masculine' : 'feminine'}</strong> POV.</p>
            <p>Where <strong>{primaryArchetype}</strong> tends to <strong>{ARCHETYPE_TENDENCIES[primaryArchetype]?.tendency || 'act'}</strong>, <strong>{prizeMirrorArchetype}</strong> brings <strong>{ARCHETYPE_TENDENCIES[primaryArchetype]?.corrective || 'balance'}</strong>.</p>
            <p>Use it when <strong>ambiguity is high; stakes are rising</strong> and <strong>the team stalls; scope is expanding</strong>.</p>
            <div className="mt-3 p-2 bg-gray-800 rounded text-xs italic">
              <strong>Direction anchor:</strong> Run one move now: {ARCHETYPE_TENDENCIES[primaryArchetype]?.action || 'Take action.'}
            </div>
          </div>
        </div>

        {/* Section 3 — Secondary Current */}
        <div className="bg-gray-900 border border-gray-600 rounded-2xl p-6 mb-4">
          <h2 className="text-xl font-bold text-orange-400 mb-3">
            {secondary.face.split(':')[1] || secondary.face} — {isAligned ? 'Mirror Detected (alignment gain)' : 'Supporting Current (no alignment gain)'}
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Color: <span style={{ color: ARCHETYPE_COLORS[secondary.face.split(':')[1] || secondary.face] || '#ffffff' }}>
                {ARCHETYPE_COLORS[secondary.face.split(':')[1] || secondary.face] || 'Unknown'}
              </span>)
            </span>
          </h2>
          <div className="text-sm text-gray-300 space-y-2">
            {isAligned ? (
              <>
                <p>Your installed face matches the mirror pattern. Keep using <strong>{secondary.face.split(':')[1] || secondary.face}</strong> in <strong>{mirrorVoiceGender === 'M' ? 'masculine' : 'feminine'}</strong> POV to stabilize <strong>{canonicalPrize}</strong>.</p>
                <div className="mt-2 p-2 bg-green-900/20 border border-green-500 rounded text-xs">
                  <strong>✅ Alignment Gain:</strong> Secondary face matches Prize mirror. You're optimally configured.
                </div>
              </>
            ) : (
              <>
                <p>Secondary lines add situational color, not a stable role.</p>
                <p><strong>{secondary.face.split(':')[1] || secondary.face}</strong> may show up as supporting energy. It can help your work, but it does not install <strong>{canonicalPrize}</strong>.</p>
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500 rounded text-xs">
                  <strong>⚠️ No Alignment:</strong> Secondary face doesn't match Prize mirror. Consider adopting {prizeMirrorArchetype} pattern.
                </div>
              </>
            )}
          </div>
        </div>

        {/* SIF Canon v3 Debug Info */}
        {debugInfo && (
          <div className="bg-gray-900 border border-blue-500 rounded-2xl p-4 mb-4">
            <h2 className="text-lg font-bold text-blue-400 mb-3">SIF Canon v3 Debug Info</h2>
            <div className="text-xs text-gray-300 space-y-2">
              <div><strong>Primary Family:</strong> {debugInfo.primaryFamily}</div>
              <div><strong>Primary Face:</strong> {debugInfo.primaryFace}</div>
              <div><strong>Installed Choice:</strong> {debugInfo.installedChoice || 'None'}</div>
              <div><strong>Shortlist Length:</strong> {debugInfo.sifShortlist?.length || 0} faces</div>
              <div><strong>Shortlist:</strong> {debugInfo.sifShortlist?.join(', ') || 'None'}</div>
              <div><strong>Badge:</strong> {badge}</div>
            </div>
          </div>
        )}

        {/* IL Scores Display */}
        {sifEngine && (
          <div className="bg-gray-900 border border-green-500 rounded-2xl p-4 mb-4">
            <h2 className="text-lg font-bold text-green-400 mb-3">InstalledLikelihood (IL) Scores</h2>
            <div className="text-sm text-gray-300">
              <p className="text-gray-400 mb-3">How likely people are to install you into each role:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(() => {
                  const ilScores = sifEngine.getILScores();
                  const sortedScores = Object.entries(ilScores)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .map(([face, score]) => ({ face, score: score as number }));
                  
                  return sortedScores.map(({ face, score }) => (
                    <div key={face} className="flex justify-between items-center bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-200 font-medium">{face}</span>
                      <span className={`font-bold ${score >= 2.0 ? 'text-green-400' : score >= 1.0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score.toFixed(2)}
                      </span>
                    </div>
                  ));
                })()}
              </div>
              <div className="mt-3 text-xs text-gray-400">
                <p><span className="text-green-400">Green (≥2.0):</span> High likelihood</p>
                <p><span className="text-yellow-400">Yellow (1.0-1.9):</span> Medium likelihood</p>
                <p><span className="text-red-400">Red (&lt;1.0):</span> Low likelihood</p>
              </div>
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex gap-4">
              <span>Session: #SR-2025-001</span>
              <span>User: Quiz User</span>
              <span>Engine: SIF Canon v3</span>
            </div>
            <span>Dark / Gold layout</span>
          </div>
        </div>

        {/* Face Scoreboard */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Face Scoreboard</h2>
            <span className="text-xs text-gray-400">Top 6 shown (SIF Canon v3 scoring)</span>
          </div>
          <div className="space-y-2">
            {topFaces.map(([face, score]) => {
              const family = face.split(':')[0];
              const faceName = face.split(':')[1];
              const percentage = Math.max(0, Math.min(100, (score / Math.max(...Object.values(faceScores))) * 100));
            
              return (
                <div key={face} className="flex gap-2 items-center">
                  <div className="w-32 text-sm text-gray-400 truncate">
                    {family} • {faceName}
                  </div>
                  <div className="flex-1 bg-gray-800 border border-gray-600 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-11 text-right text-sm font-mono">
                    {score.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Footer Rule */}
        <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4 mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-300 font-mono">
              <em>Prize = stable outward role. Mirror = opposite-gender pattern that installs the Prize. Secondary = situational color; only equals Mirror → alignment gain.</em>
            </div>
          </div>
        </div>

        {/* Traditional Results - Enhanced */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Traditional Results</h2>
            <span className="text-xs text-gray-400">For comparison only</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-gray-400 text-sm">Line</span>
                <span className="text-sm font-semibold">{primary.family}</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-gray-400 text-sm">Prize-chain</span>
                <span className="font-mono text-sm">{calculatePrizeChain()}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-base text-gray-400 mb-3">Per-line details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2">Line</th>
                    <th className="text-left py-3 px-2">A-line</th>
                    <th className="text-left py-3 px-2">Phase B picks</th>
                    <th className="text-left py-3 px-2">Module decisions</th>
                    <th className="text-right py-3 px-2">Votes</th>
                    <th className="text-right py-3 px-2">Purity</th>
                    <th className="text-right py-3 px-2">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {state.lines.map((line, index) => (
                    <tr key={line.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-2 font-medium">{line.id}</td>
                      <td className="py-3 px-2">
                        {line.selectedA ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 border border-green-400 text-green-400 bg-transparent rounded-full text-xs">
                            A-line
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {line.selectedA && line.B.picks.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {line.B.picks.map((pick, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
                                {pick}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {!line.selectedA && line.mod.decisions.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {line.mod.decisions.map((decision, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
                                {decision.pick}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {(() => {
                          const famC = sifCounters.famC?.[line.id] ?? 0;
                          const famO = sifCounters.famO?.[line.id] ?? 0;
                          const famF = sifCounters.famF?.[line.id] ?? 0;
                          const total = famC + famO + famF;
                          return total;
                        })()}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {allPurity[line.id]?.toFixed(1) || '0.0'}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {(() => {
                          // Calculate verdict for display
                          if (line.selectedA && line.B.picks.length >= 2) {
                            const p1 = line.B.picks[0] === 'F' ? 'O' : line.B.picks[0];
                            const p2 = line.B.picks[1] === 'F' ? 'O' : line.B.picks[1];
                            return (p1 === 'C' && p2 === 'C') ? 'C' : 'O';
                          } else if (line.mod.decisions.length > 0) {
                            const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
                            const key = `${by.CO1 ?? ''}${by.CO2 ?? ''}${by.CF ?? ''}`;
                            return {
                              CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
                              OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
                            }[key] || 'O';
                          }
                          return '—';
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Final Verdict - Enhanced */}
        <div className="bg-gray-900 border border-yellow-400 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Final Verdict & Why</h2>
            <span className="text-xs text-gray-400">SIF Canon v3 analysis</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-gray-400 text-sm">Primary</span>
                <span className="text-sm font-semibold">{primary.face}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-gray-400 text-sm">Secondary (SIF)</span>
                <span className="text-sm font-semibold">{secondary.face}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-gray-400 text-sm">Prize</span>
                <span className="text-sm font-semibold">{canonicalPrize}</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-gray-400 text-sm">Badge</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
                  {badge}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-gray-400 text-sm">Alignment</span>
                <span className="text-sm">
                  {isAligned ? 'Secondary face matches the Prize mirror.' : 
                   'Secondary face is not yet the Prize mirror.'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-gray-400 text-sm">Friction</span>
                <span className="text-sm">{frictionFamilies.join(', ') || 'None'}</span>
              </div>
            </div>
            <div className="font-mono">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-gray-400 text-sm">Why</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {generateSecondaryReasoning()}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-3">
          Built for SIF Canon v3 engine — dark/gold detailed template with accurate console logging.
        </footer>
      </div>
    </div>
  );
}
