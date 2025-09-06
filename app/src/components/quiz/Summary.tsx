import React, { useEffect, useState } from 'react';
import { QuizState, SIFResult, FAMILY_TO_PRIZE, FAMILIES, Family } from '@/types/quiz';
import { prizeMirrorEngine } from '@/engine/PrizeMirror';

interface SummaryProps {
  state: QuizState;
  onSIFCalculate: (primaryFamily: string, primaryFace: string, prizeFace?: string) => SIFResult;
  onFinalizeSIFWithInstall: (primaryFamily: string, primaryFace: string) => SIFResult;
  onRestart: () => void;
}

export function Summary({ state, onSIFCalculate, onFinalizeSIFWithInstall, onRestart }: SummaryProps) {
  const [hasCalculated, setHasCalculated] = useState(false);
  const [verdictsCalculated, setVerdictsCalculated] = useState(false);
  const [prizeMirrorResult, setPrizeMirrorResult] = useState<any>(null);

  // Calculate verdicts at the very end to include the anchor
  React.useEffect(() => {
    if (!verdictsCalculated) {
      console.log('🎯 SUMMARY PHASE - Calculating final verdicts with anchor included');
      
      // Calculate verdicts for all lines (both A and non-A)
      const verdictsToUpdate: { lineId: string; verdict: string }[] = [];
      
      state.lines.forEach(line => {
        if (line.mod.decisions.length > 0) {
          // Non-A lines: use module decisions
          const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
          const key = `${by.CO1 ?? ''}${by.CO2 ?? ''}${by.CF ?? ''}`;
          const verdict = {
            CCC: 'C', CCF: 'O', COC: 'O', COF: 'F',
            OCC: 'O', OCF: 'F', OOC: 'O', OOF: 'F'
          }[key] || 'O';
          
          verdictsToUpdate.push({ lineId: line.id, verdict });
        } else if (line.selectedA && line.B.picks.length >= 2) {
          // A-lines: use Phase B picks to determine verdict
          const p1 = line.B.picks[0];
          const p2 = line.B.picks[1];
          
          // Convert F to O for verdict calculation
          const pick1 = p1 === 'F' ? 'O' : p1;
          const pick2 = p2 === 'F' ? 'O' : p2;
          
          // A-line verdict logic: if both picks are C, verdict is C; otherwise O
          const verdict = (pick1 === 'C' && pick2 === 'C') ? 'C' : 'O';
          
          verdictsToUpdate.push({ lineId: line.id, verdict });
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
      finalArchetype: state.finalArchetype
    });
    console.log('🎯 SUMMARY PHASE - SIF Counters Details:', {
      famC: state.sifCounters?.famC || {},
      famO: state.sifCounters?.famO || {},
      famF: state.sifCounters?.famF || {},
      faceC: state.sifCounters?.faceC || {},
      faceO: state.sifCounters?.faceO || {}
    });
  }, [state.sifResult, state.anchor, state.finalArchetype]);

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
    } else {
      console.log('🎯 SUMMARY PHASE - Not calculating SIF because:', {
        hasSifResult: !!state.sifResult,
        hasCalculated,
        hasAnchor: !!state.anchor,
        hasFinalArchetype: !!state.finalArchetype
      });
    }
  }, [state.anchor, state.finalArchetype, state.sifResult, hasCalculated, onSIFCalculate]);

  if (!state.sifResult) {
    return (
      <div className="bg-black text-white min-h-screen p-7">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
        <div className="text-white text-xl">Calculating SIF result...</div>
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
    'Navigator': { prize: 'Timekeeper', mirror: 'Seeker', mirror_voice_gender: 'M' }, // Falls back to Seeker since Strategist is outside 14-lock set
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
  
  // Helper functions to get descriptions
  const getInternalDescription = (family: string): string => {
    const descriptions: Record<string, string> = {
      'Control': 'stability hinges on making the call, not deferring.',
      'Pace': 'stability hinges on rhythm — starting and finishing in time.',
      'Boundary': 'stability hinges on drawing the line, keeping scope clean.',
      'Truth': 'stability hinges on holding the reason, not letting it drift.',
      'Recognition': 'stability hinges on showing proof — catching and naming what\'s real.',
      'Bonding': 'stability hinges on trust — not betraying ties.',
      'Stress': 'stability hinges on movement under pressure — not freezing.'
    };
    return descriptions[family] || 'stability hinges on this line.';
  };
  
  const getExternalDescription = (family: string): string => {
    const descriptions: Record<string, string> = {
      'Control': 'the one who sets direction.',
      'Pace': 'the one who holds the tempo for others.',
      'Boundary': 'the one deciding what crosses the threshold.',
      'Truth': 'the one who lands the call when others stall.',
      'Recognition': 'the one who validates reality for others.',
      'Bonding': 'the one who steadies the bond.',
      'Stress': 'the one who sparks action when the crunch hits.'
    };
    return descriptions[family] || 'the one who fulfills this role.';
  };
  
  const getArchetypeDescription = (archetype: string): string => {
    const descriptions: Record<string, string> = {
      'Sovereign': 'commands the room, expects alignment.',
      'Rebel': 'breaks constraints to create motion.',
      'Visionary': 'sees ahead, struggles to land now.',
      'Navigator': 'plots routes through uncertainty.',
      'Equalizer': 'balances power, enforces fair play.',
      'Guardian': 'protects at all costs, safety first.',
      'Seeker': 'hunts patterns, truth over comfort.',
      'Architect': 'designs systems; order before action.',
      'Spotlight': 'thrives on visibility and audience.',
      'Diplomat': 'bridges factions, negotiates alignment.',
      'Partner': 'defines self through loyalty.',
      'Provider': 'measures worth by meeting needs.',
      'Catalyst': 'ignites change, starts the chain reaction.',
      'Artisan': 'crafts with care; quality as identity.'
    };
    return descriptions[archetype] || 'expresses this archetype uniquely.';
  };
  
  const getSecondaryDescription = (family: string, archetype: string): string => {
    const descriptions: Record<string, string> = {
      'Control': 'provides flashes of command or rebellion that disrupt your primary role.',
      'Pace': 'brings foresight or route-mapping energy that colors the tempo, not the face.',
      'Boundary': 'defends or balances situationally, but isn\'t installed as the consistent gate.',
      'Truth': 'hunts or structures patterns internally, but doesn\'t carry the decider\'s badge.',
      'Recognition': 'can perform or mediate, but the world doesn\'t default to you as "the witness".',
      'Bonding': 'leans on ties or caretaking, but isn\'t seen as the anchor.',
      'Stress': 'sparks or perfects under pressure, but isn\'t "the igniter".'
    };
    return descriptions[family] || 'provides supporting energy to your primary role.';
  };
  
  const getSupportDescription = (secondaryFamily: string, primaryFamily: string): string => {
    const supportMap: Record<string, Record<string, string>> = {
      'Control': {
        'Pace': 'adding urgency and decisiveness to your tempo-keeping.',
        'Boundary': 'strengthening your line-drawing with authority.',
        'Truth': 'giving your reasoning more commanding presence.',
        'Recognition': 'making your witnessing more assertive.',
        'Bonding': 'adding leadership to your anchoring role.',
        'Stress': 'providing control under pressure.'
      },
      'Pace': {
        'Control': 'adding rhythm and timing to your authority.',
        'Boundary': 'bringing tempo to your gatekeeping.',
        'Truth': 'adding timing to your decision-making.',
        'Recognition': 'bringing rhythm to your witnessing.',
        'Bonding': 'adding tempo to your anchoring.',
        'Stress': 'providing steady rhythm under pressure.'
      },
      'Boundary': {
        'Control': 'adding protective boundaries to your authority.',
        'Pace': 'creating safe spaces for your tempo-keeping.',
        'Truth': 'protecting the integrity of your decisions.',
        'Recognition': 'guarding the clarity of your witnessing.',
        'Bonding': 'creating safe boundaries for your anchoring.',
        'Stress': 'providing structure under pressure.'
      },
      'Truth': {
        'Control': 'adding clear reasoning to your authority.',
        'Pace': 'bringing clarity to your tempo-keeping.',
        'Boundary': 'providing logical foundation for your gatekeeping.',
        'Recognition': 'adding depth to your witnessing.',
        'Bonding': 'bringing truth to your anchoring.',
        'Stress': 'providing clarity under pressure.'
      },
      'Recognition': {
        'Control': 'adding visibility and validation to your authority.',
        'Pace': 'bringing awareness to your tempo-keeping.',
        'Boundary': 'making your gatekeeping more visible.',
        'Truth': 'adding proof to your decision-making.',
        'Bonding': 'making your anchoring more visible.',
        'Stress': 'providing recognition under pressure.'
      },
      'Bonding': {
        'Control': 'adding relational depth to your authority.',
        'Pace': 'bringing connection to your tempo-keeping.',
        'Boundary': 'adding care to your gatekeeping.',
        'Truth': 'bringing trust to your decision-making.',
        'Recognition': 'adding loyalty to your witnessing.',
        'Stress': 'providing support under pressure.'
      },
      'Stress': {
        'Control': 'adding urgency and drive to your authority.',
        'Pace': 'bringing intensity to your tempo-keeping.',
        'Boundary': 'adding pressure to your gatekeeping.',
        'Truth': 'bringing urgency to your decision-making.',
        'Recognition': 'adding intensity to your witnessing.',
        'Bonding': 'bringing drive to your anchoring.'
      }
    };
    return supportMap[secondaryFamily]?.[primaryFamily] || 'providing supporting energy to your primary role.';
  };
  
  const getWhenItShowsDescription = (family: string): string => {
    const descriptions: Record<string, string> = {
      'Control': 'under pressure, when you need to take charge or break constraints.',
      'Pace': 'when timing and rhythm become critical, or when you need to see ahead.',
      'Boundary': 'when protection or balance is needed, or when lines must be drawn.',
      'Truth': 'when clarity and structure are required, or when patterns need hunting.',
      'Recognition': 'when visibility or mediation is needed, or when proof must be shown.',
      'Bonding': 'when trust and connection are essential, or when care is required.',
      'Stress': 'under pressure, when you need to spark action or perfect your craft.'
    };
    return descriptions[family] || 'in specific situations that call for this energy.';
  };
  
  // Calculate SIF metrics for display
  const sifCounters = state.sifCounters;
  const primaryFaces = ['Control:Rebel', 'Control:Sovereign', 'Pace:Visionary', 'Pace:Navigator', 'Boundary:Equalizer', 'Boundary:Guardian', 'Truth:Seeker', 'Truth:Architect', 'Recognition:Spotlight', 'Recognition:Diplomat', 'Bonding:Partner', 'Bonding:Provider', 'Stress:Catalyst', 'Stress:Artisan'];
  const candidateFaces = primaryFaces.filter(face => !face.startsWith(primary.family));
  
  // Calculate face scores for display (matching SIFEngine formula)
  const faceScores: Record<string, number> = {};
  
  // Log the face counters for debugging
  console.debug('Summary faceC counters:', sifCounters.faceC);
  console.debug('Summary faceO counters:', sifCounters.faceO);
  
  // First pass: compute rawNI for all candidates
  const candidateData = candidateFaces.map(face => {
    const family = face.split(':')[0];
    const faceKey = face;  // face is already in "Family:Face" format
    const pos = sifCounters.faceC?.[faceKey] ?? 0;  // direct "fits me" votes
    const neg = sifCounters.faceO?.[faceKey] ?? 0;  // "not me" votes
    const rawNI = Math.max(0, pos - neg);  // or just `pos` if that's the spec
    const famC = sifCounters.famC[family] || 0;
    const famO = sifCounters.famO[family] || 0;
    const famF = sifCounters.famF[family] || 0;
    const sevF = sifCounters.sevF[family] || 0;
    
    return {
      face,
      family,
      rawNI,
      famC,
      famO,
      famF,
      sevF
    };
  });
  
  // Normalize after computing rawNI for all candidates
  const maxNI = Math.max(0, ...candidateData.map(c => c.rawNI));
  
  candidateData.forEach(c => {
    const NI = maxNI > 0 ? c.rawNI / maxNI : 0;
    const hasExposure = (c.famC + c.famO) > 0;
    const SI = hasExposure ? c.famC / (c.famC + c.famO) : 0.5;  // Family stability, neutral if no answers
    const II = Math.min(c.famF + c.sevF, 3);  // Instability, capped at 3
    const faceScore = 0.5 * NI + 0.5 * SI - 0.1 * II;  // Same as SIFEngine
    
    console.debug(`Summary rawNI for ${c.face}: ${c.rawNI}, NI: ${NI.toFixed(3)}, SI: ${SI.toFixed(3)} ${hasExposure ? '' : '(neutral fallback)'}`);
    
    faceScores[c.face] = faceScore;
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

  // Sanity check: log counter keys to detect mismatches
  console.table({
    famC_keys: Object.keys(sifCounters.famC || {}),
    famO_keys: Object.keys(sifCounters.famO || {}),
    famF_keys: Object.keys(sifCounters.famF || {}),
  });

  // Traditional rows from sifCounters (simplest approach)
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
            {primary.family} → {primaryArchetype} | Prize = {canonicalPrize}
          </h1>
          <div className="text-sm text-gray-400 mt-2">
            Face Color: <span className="font-semibold" style={{ color: ARCHETYPE_COLORS[primaryArchetype] || '#ffffff' }}>
              {ARCHETYPE_COLORS[primaryArchetype] || 'Unknown'}
            </span>
          </div>
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

        {/* Prize/Mirror/Secondary Canon Display */}
        {prizeMirrorResult && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-400 rounded-2xl p-6 mb-4">
            <h2 className="text-xl font-bold text-blue-200 mb-4">Canon Result Card</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-black/20 rounded-lg p-3">
                <div className="font-bold text-yellow-300 mb-2">Header:</div>
                <div className="text-white">{prizeMirrorResult.resultCard.header}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="font-bold text-yellow-300 mb-2">Section 1:</div>
                <div className="text-white">{prizeMirrorResult.resultCard.section1}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="font-bold text-yellow-300 mb-2">Section 2:</div>
                <div className="text-white">{prizeMirrorResult.resultCard.section2}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="font-bold text-yellow-300 mb-2">Section 3:</div>
                <div className="text-white">{prizeMirrorResult.resultCard.section3}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="font-bold text-yellow-300 mb-2">Footer:</div>
                <div className="text-white">{prizeMirrorResult.resultCard.footer}</div>
              </div>
            </div>
          </div>
        )}

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
              </>
            ) : (
              <>
                <p>Secondary lines add situational color, not a stable role.</p>
                <p><strong>{secondary.face.split(':')[1] || secondary.face}</strong> may show up as <strong>{getSecondaryDescription(secondary.family, secondary.face.split(':')[1] || secondary.face)}</strong>. It can help your work, but it does not install <strong>{canonicalPrize}</strong>.</p>
              </>
            )}
          </div>
        </div>

        {/* Session Info - Collapsed */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex gap-4">
              <span>Session: #SR-2025-001</span>
              <span>User: Quiz User</span>
            </div>
            <span>Dark / Gold layout</span>
          </div>
        </div>

        {/* Face Scoreboard */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Face Scoreboard</h2>
            <span className="text-xs text-gray-400">Top 6 shown</span>
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

        {/* Action Plan */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Action Plan (Path to Prize)</h2>
            <span className="text-xs text-gray-400">Probes target edges, not identity</span>
          </div>
                  <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-gray-400 text-sm">Probe 1:</span>
              <span className="text-sm">"Claim your full key."</span>
                  </div>
            <ul className="text-sm text-gray-400 ml-4 space-y-1">
              <li><span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs mr-2">A</span> One clear stake in the ground.</li>
              <li><span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs mr-2">B</span> Share the stake, invite a counter.</li>
              <li><span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs mr-2">C</span> No stake yet — observe the pull.</li>
            </ul>
            <div className="h-px bg-gray-700 my-2"></div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-gray-400 text-sm">Probe 2:</span>
              <span className="text-sm">"Claim bias on cause."</span>
                  </div>
            <ul className="text-sm text-gray-400 ml-4 space-y-1">
              <li><span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs mr-2">A</span> Anchor the bias openly.</li>
              <li><span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs mr-2">B</span> Name the doubt.</li>
              <li><span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs mr-2">C</span> Hold both; test together.</li>
            </ul>
            <div className="flex justify-end mt-2">
              <button className="px-3 py-2 border border-yellow-400 text-yellow-400 bg-transparent rounded-lg text-sm font-semibold hover:bg-yellow-400 hover:text-black transition-colors">
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        {/* Traditional Results - Full Width */}
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
                <span className="font-mono text-sm">CC C F CF</span>
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
                    <th className="text-left py-3 px-2">Plays</th>
                    <th className="text-left py-3 px-2">Probe picks</th>
                    <th className="text-left py-3 px-2">Phase B picks</th>
                    <th className="text-left py-3 px-2">Module decision</th>
                    <th className="text-right py-3 px-2">Votes</th>
                    <th className="text-right py-3 px-2">Purity</th>
                    <th className="text-right py-3 px-2">F severity</th>
            </tr>
          </thead>
          <tbody>
                  {state.lines.map((line, index) => (
                    <tr key={line.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-2 font-medium">{line.id}</td>
                      <td className="py-3 px-2">{line.selectedA ? 'No' : '—'}</td>
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
                      <td className="py-3 px-2">—</td>
                      <td className="text-right py-3 px-2 font-mono">
                        {(() => {
                          const famC = sifCounters.famC?.[line.id] ?? 0;
                          const famO = sifCounters.famO?.[line.id] ?? 0;
                          const famF = sifCounters.famF?.[line.id] ?? 0;
                          const total = famC + famO + famF;
                          
                          // Debug logging for each line
                          console.log(`🎯 Traditional Results - ${line.id}:`, { famC, famO, famF, total });
                          
                          return total;
                        })()}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {allPurity[line.id]?.toFixed(1) || '0.0'}
                  </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {line.verdict === 'F' ? (
                          (() => {
                            const severityEntry = state.questionHistory.find(q => 
                              q.phase === 'C' && 
                              q.lineId === line.id && 
                              (q.choice === 'F1' || q.choice === 'F0.5')
                            );
                            return severityEntry ? (severityEntry.choice === 'F1' ? '1' : '0.5') : '0';
                          })()
                        ) : '0'}
                  </td>
                </tr>
                  ))}
          </tbody>
        </table>
            </div>
          </div>
        </div>

        {/* Transcript Chips */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Transcript Chips</h2>
            <span className="text-xs text-gray-400">Lightweight evidence flags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.questionHistory
              .filter(q => q.choice === 'A' && q.phase === 'C')
              .slice(0, 5)
              .map((q, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
                  "I'll take the call."
                </span>
              ))}
            <span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
              Left the door open.
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
              Named the doubt.
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
              Stood ground in push.
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
              Invited counter.
                </span>
          </div>
      </div>

        {/* Final Verdict */}
        <div className="bg-gray-900 border border-yellow-400 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Final Verdict & Why</h2>
            <span className="text-xs text-gray-400">Placed after all evidence</span>
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
                  {badge === 'Aligned' ? 'Secondary face matches the Prize.' : 
                   badge === 'Installed from outside' ? 'Secondary face is in the same family as Prize.' :
                   'Secondary face is not yet the Prize.'}
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
                • Secondary rose on strong {secondary.family} family C votes ({(sifCounters.famC[secondary.family] || 0)}) with zero O/F noise.<br/>
                • Prize maps to {canonicalPrize} role; current secondary acts upstream, not prize-aligned.<br/>
                • Evidence chips show decisive calls but hesitation in {frictionFamilies.join(' & ')} flows.<br/>
                • Next step: run two probes (above). If they land C/C, recheck badge immediately.
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-3">
          Built for SIF engine — dark/gold detailed template. Replace sample values with live data.
        </footer>
      </div>
    </div>
  );
}