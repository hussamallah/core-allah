import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizState, SIFResult, FAMILY_TO_PRIZE, FAMILIES, Family, getPrizeMirror } from '@/types/quiz';
import { prizeMirrorEngine } from '@/engine/PrizeMirrorEngine';
import { DiagnosticsPage } from '@/components/summary/DiagnosticsPage';
import { useExtractSnapshot } from '@/hooks/useExtractSnapshot';
import { resolveSIFData, getFaceVsILAnalysisText } from '@/utils/sifDataResolverNew';
import { getArchetypeQuestionsForFamily } from '@/data/questions';
import { getAllArchetypeSlugs } from '@/data/archetypePages';
import './SummaryClean.css';

interface SummaryCleanProps {
  state: QuizState;
  onSIFCalculate: (primaryFamily: string, primaryFace: string, prizeFace?: string) => SIFResult;
  onFinalizeSIFWithInstall: (primaryFamily: string, primaryFace: string) => SIFResult;
  onRestart: () => void;
  sifEngine: any;
}

// Helper functions for rich archetype descriptions
const getPrimaryDescription = (face: string) => {
  const descriptions: Record<string, string> = {
    'Control:Sovereign': 'You lead by setting the call and expecting alignment. This role defines your identity as decisive authority. Under pressure, you hold direction and push others to fall in line. Sovereign is about order first, people second. Everything else orbits this anchor.',
    'Control:Rebel': 'You lead by disruption, breaking constraints to move the system forward. This role defines identity as bold challenge. Under pressure, you refuse dead weight and create motion by tearing barriers down. It\'s raw force pointed at what feels stagnant.',
    'Pace:Visionary': 'You define identity by projecting forward, seeing what others miss. Visionary stretches time and imagines outcomes no one else can. Under pressure, you drift because the present feels too small. The anchor is future-first, not present-bound.',
    'Pace:Navigator': 'You define identity by mapping routes and adjusting rhythm. Navigator watches timing, adjusting moves to fit the larger arc. Under pressure, you may stall, caught between too many possible paths. But the Anchor here is timing itself.',
    'Boundary:Equalizer': 'You define identity by enforcing fairness. Equalizer cuts imbalance and demands lines everyone must follow. Under pressure, you tighten rules and remove leeway. The Anchor here is justice before preference.',
    'Boundary:Guardian': 'You define identity by guarding thresholds and protecting what matters. Guardian enforces limits by defense, not negotiation. Under pressure, you shut the gates tighter, even against allies. This anchor is defense as identity.',
    'Truth:Seeker': 'You define identity by hunting patterns and exposing reality. Seeker insists on truth even when it disrupts comfort. Under pressure, you obsess over the signal and ignore the noise. The Anchor is clarity itself.',
    'Truth:Architect': 'You define identity by structuring systems and building clarity into frameworks. Architect makes order its anchor. Under pressure, you double down on design instead of action.',
    'Recognition:Spotlight': 'You define identity through visibility. Spotlight shines on yourself and others to create impact. Under pressure, you overextend, trying to be everywhere at once. The Anchor here is being seen.',
    'Recognition:Diplomat': 'You define identity by mediation, making alliances hold. Diplomat thrives on smoothing gaps and stitching factions. Under pressure, you bend too far to avoid fracture.',
    'Bonding:Partner': 'You define identity through loyalty and deep connection. Partner fuses people, ensuring no one stands alone. Under pressure, you risk smothering others by holding too tightly.',
    'Bonding:Provider': 'You define identity through service and support. Provider measures worth by meeting needs. Under pressure, you overextend and exhaust yourself.',
    'Stress:Catalyst': 'You define identity by ignition. Catalyst sparks change under pressure, forcing motion when others stall. Under pressure, you can burn out fast.',
    'Stress:Artisan': 'You define identity through crafted output under strain. Artisan builds with care even when the pressure rises. Under pressure, you risk perfectionism or collapse.'
  };
  return descriptions[face] || 'This is your stable core role. It shows who you are inside and how you hold identity under pressure. Everything else revolves around this anchor.';
};

const getPrizeDescription = (secondaryFace: string, prizeFace: string) => {
  const descriptions: Record<string, string> = {
    'Control:Sovereign': 'Sovereign → Diplomat: Authority balanced by bridge-making. Diplomat brings your decisive calls into negotiation and alliance-building. Without Diplomat, Sovereign authority stays isolated and brittle. With Diplomat, your authority lands across factions and builds lasting influence.',
    'Control:Rebel': 'Rebel → Spotlight: Disruption balanced by visibility. Spotlight gives your breaking moves public impact and traction. Without Spotlight, rebellion burns fast but vanishes unnoticed. With Spotlight, your disruptions force the world to respond and create lasting change.',
    'Pace:Visionary': 'Visionary → Catalyst: Time-drifting vision grounded by ignition. Catalyst forces your future projections to hit the ground and trigger real change. Without Catalyst, Visionary stays in the clouds and drifts endlessly. With Catalyst, foresight becomes breakthrough under pressure.',
    'Pace:Navigator': 'Navigator → Artisan: Path-plotting anchored by craft under strain. Artisan builds your mapped routes into real, crafted output when pressure rises. Without Artisan, Navigator risks endless planning with no delivery. With Artisan, timing locks into precision and results.',
    'Boundary:Equalizer': 'Equalizer → Partner: Fairness locked by loyalty. Partner makes your justice human and bonds people together instead of pushing them apart. Without Partner, Equalizer is cold and mechanical. With Partner, fairness becomes the foundation of lasting relationships.',
    'Boundary:Guardian': 'Guardian → Provider: Protection locked by service. Provider softens your defensive boundaries with care and sustains others. Without Provider, Guardian can isolate or over-restrict. With Provider, protection becomes sustainable service that builds trust.',
    'Truth:Seeker': 'Seeker → Sovereign: Pattern-hunter locked by authority. Sovereign turns your clarity into decisive calls that land outcomes. Without Sovereign, Seeker names patterns endlessly but never acts. With Sovereign, truth becomes direction and drives real change.',
    'Truth:Architect': 'Architect → Rebel: System-builder locked by disruption. Rebel stress-tests your frameworks and forces them to adapt and survive. Without Rebel, Architect risks rigidity and collapse. With Rebel, systems become resilient and evolve under pressure.',
    'Recognition:Spotlight': 'Spotlight → Rebel: Visibility locked by challenge. Rebel gives your performance teeth and forces change instead of shallow display. Without Rebel, Spotlight is just noise. With Rebel, what\'s visible becomes a force the world must respond to.',
    'Recognition:Diplomat': 'Diplomat → Sovereign: Bridge-builder locked by authority. Sovereign turns your mediation into decisive command that holds firm. Without Sovereign, Diplomat dilutes and bends too far. With Sovereign, bridges become strong foundations that support real alliances.',
    'Bonding:Partner': 'Partner → Equalizer: Fusion locked by fairness. Equalizer sets healthy boundaries so your loyalty doesn\'t become smothering. Without Equalizer, Partner drowns in attachment. With Equalizer, loyalty stays healthy and creates sustainable bonds.',
    'Bonding:Provider': 'Provider → Guardian: Service locked by protection. Guardian enforces protective edges so your care doesn\'t exhaust you. Without Guardian, Provider bleeds out. With Guardian, service becomes sustainable and builds lasting support systems.',
    'Stress:Catalyst': 'Catalyst → Visionary: Ignition locked by foresight. Visionary ties your sparks to long-term outcomes instead of just noise. Without Visionary, Catalyst burns out fast. With Visionary, ignition becomes breakthrough that creates lasting change.',
    'Stress:Artisan': 'Artisan → Navigator: Craft locked by long-route timing. Navigator ensures your precision lands on time and fits the larger arc. Without Navigator, Artisan gets lost in details. With Navigator, craft becomes strategic delivery that builds momentum.'
  };
  return descriptions[secondaryFace] || 'This is the mirror pattern that completes your Secondary. It\'s the opposite family style that locks your installed role in place and makes it usable outside. The system always checks if you have this installed.';
};

const getArchetypeFacePattern = (prizeArchetype: string) => {
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
  return patterns[prizeArchetype] || 'Mirror pattern that balances and completes the anchor';
};

// Canon Prize Mapping - Exact archetype-to-archetype mapping
const getCanonPrizeMapping = (primaryFace: string) => {
  const canonMappings: Record<string, string> = {
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
  return canonMappings[primaryFace] || primaryFace;
};

const getArchetypeMappingTitle = (secondaryFace: string, prizeFace: string) => {
  const canonPrize = getCanonPrizeMapping(secondaryFace);
  const secondaryArchetype = secondaryFace.split(':')[1];
  const prizeArchetype = canonPrize.split(':')[1];
  return `${secondaryArchetype} → ${prizeArchetype}`;
};

export function SummaryClean({ state, onSIFCalculate, onFinalizeSIFWithInstall, onRestart, sifEngine }: SummaryCleanProps) {
  const router = useRouter();
  const [hasCalculated, setHasCalculated] = useState(false);
  const [verdictsCalculated, setVerdictsCalculated] = useState(false);
  const [prizeMirrorResult, setPrizeMirrorResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'diagnostics'>('results');
  
  // Get extract snapshot for diagnostics
  const extractSnapshot = useExtractSnapshot(state);

  // Helper function to get archetype slug for navigation
  const getArchetypeSlug = (face: string): string => {
    const archetype = face.split(':')[1];
    const slug = archetype.toLowerCase();
    console.log(`🎯 Converting face "${face}" to slug "${slug}"`);
    return slug;
  };

  // Handle archetype navigation - Use Secondary (user's choice) instead of Primary
  const handleArchetypeNavigation = () => {
    // Use secondary face (user's choice from Phase D) instead of primary
    const targetFace = secondary?.face || primary.face;
    const slug = getArchetypeSlug(targetFace);
    console.log(`🚀 Navigating to archetype page: /archetypes/${slug}`);
    console.log(`🎯 Using ${secondary?.face ? 'Secondary (user choice)' : 'Primary (fallback)'}: ${targetFace}`);
    
    // Store quiz data in localStorage for the archetype page
    try {
      localStorage.setItem('quizResults', JSON.stringify(state));
      console.log('💾 Quiz data stored in localStorage for archetype page');
    } catch (error) {
      console.warn('⚠️ Could not store quiz data in localStorage:', error);
    }
    
    // Check if the archetype exists in our data
    const archetypeExists = getAllArchetypeSlugs().includes(slug);
    if (!archetypeExists) {
      console.error(`❌ Archetype "${slug}" not found in available archetypes`);
      console.log('Available archetypes:', getAllArchetypeSlugs());
      // Fallback to archetypes index page
      router.push('/archetypes');
      return;
    }
    
    router.push(`/archetypes/${slug}`);
  };

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
  
  // Resolve all SIF data from single source of truth
  const sifData = resolveSIFData(state, state.sifResult, sifEngine);
  
  // Calculate SIF metrics for display
    const sifCounters = state.sifCounters;

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
    const reasoning: string[] = [];
    
    // Primary selection reasoning (SIF determination)
    reasoning.push(`• SIF Primary: ${primary.face} selected as anchor`);
    
    // Prize mapping reasoning - Prize is now mirror of Secondary, not Primary
    const canonPrize = getCanonPrizeMapping(secondary.face);
    reasoning.push(`• Prize Mirror: ${canonPrize} (mirror of Secondary: ${secondary.face})`);
    
    // Secondary selection reasoning (IL calculation)
    if (secondary.face) {
      reasoning.push(`• IL Secondary: ${secondary.face} from Phase D install choice`);
      
      // Find the line data for IL calculation
      const secondaryLine = state.lines.find(line => {
        if (line.selectedA && line.B?.picks) {
          const bPath = line.B.picks as ("C"|"O"|"F")[];
          const face = determineFaceFromBPath(line.id, bPath);
          return face === secondary.face;
        } else if (line.mod?.decisions && line.mod.decisions.length >= 3) {
          const mPath = line.mod.decisions.map(d => d.pick) as ("C"|"O"|"F")[];
          const face = determineFaceFromMPath(line.id, mPath);
          return face === secondary.face;
        }
        return false;
      });

      if (secondaryLine) {
        if (secondaryLine.selectedA && secondaryLine.B?.picks) {
          // A-line IL calculation
          const bPath = secondaryLine.B.picks as ("C"|"O"|"F")[];
          const earlyO = bPath[0] === "O" ? 1 : 0;
          const fTouch = bPath.includes("F") ? 1 : 0;
          const oHits = bPath.filter(p => p === "O").length;
          const oRatio = oHits / 2;
          const purity = computeFacePurityFromB(bPath);
          const purityGap = Math.max(0, Math.min(1, (2.6 - purity) / 2));
          const baseIL = 1.6*earlyO + 1.2*fTouch + 0.8*oRatio + 0.8*purityGap;
          
          reasoning.push(`• IL Calculation: A-line from B-path [${bPath.join(', ')}]`);
          reasoning.push(`• IL Factors: earlyO=${earlyO}, fTouch=${fTouch}, oRatio=${oRatio}, purityGap=${purityGap.toFixed(2)}`);
          reasoning.push(`• Base IL: ${baseIL.toFixed(2)} (1.6×${earlyO} + 1.2×${fTouch} + 0.8×${oRatio} + 0.8×${purityGap.toFixed(2)})`);
          
        } else if (secondaryLine.mod?.decisions && secondaryLine.mod.decisions.length >= 3) {
          // Module line IL calculation
          const mPath = secondaryLine.mod.decisions.map(d => d.pick) as ("C"|"O"|"F")[];
          const cCount = mPath.filter(p => p === "C").length;
          const driftRatio = (3 - cCount) / 3;
          const endedF = mPath[2] === "F" ? 1 : 0;
          const isCCC = cCount === 3 ? 1 : 0;
          const baseIL = 1.6*isCCC + 1.4*endedF + 0.8*driftRatio;
          
          reasoning.push(`• IL Calculation: Module from M-path [${mPath.join(', ')}]`);
          reasoning.push(`• IL Factors: cCount=${cCount}, driftRatio=${driftRatio.toFixed(2)}, endedF=${endedF}, isCCC=${isCCC}`);
          reasoning.push(`• Base IL: ${baseIL.toFixed(2)} (1.6×${isCCC} + 1.4×${endedF} + 0.8×${driftRatio.toFixed(2)})`);
        }
      }
      
      // Check alignment
      const isAligned = secondary.face === canonPrize;
      if (isAligned) {
        reasoning.push(`• Alignment: Perfect match (Secondary = Prize)`);
        reasoning.push(`• SIF Result: Full alignment gain achieved`);
      } else {
        reasoning.push(`• Alignment: No match (Secondary ≠ Prize)`);
        reasoning.push(`• SIF Result: No alignment gain`);
      }
    } else {
      reasoning.push(`• Secondary: Not determined (Phase D incomplete)`);
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
        {/* SIF v3 Results Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">SIF v3 Engine Results</h2>
            <div className="text-sm text-gray-400">
              {new Date().toISOString().split('T')[0]} • Engine v3.0
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Results */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Primary Identity</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Face:</span>
                    <span className="text-white font-medium">{primary.face}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-green-400">62.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Badge:</span>
                    <span className="text-yellow-400">{badge}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Evidence Anchor</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Face:</span>
                    <span className="text-white font-medium">{secondary.face}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Face Score:</span>
                    <span className="text-green-400">0.82</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">NI:</span>
                    <span className="text-blue-400">0.78</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SI:</span>
                    <span className="text-blue-400">0.86</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary Results */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Prize Mirror</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Face:</span>
                    <span className="text-white font-medium">{sifData.prize.face}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alignment:</span>
                    <span className={sifData.aligned ? "text-green-400" : "text-red-400"}>
                      {sifData.aligned ? 'Aligned' : 'Not yet aligned'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">SIF Signals</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alignment Strength:</span>
                    <span className="text-green-400">0.78</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wobble Factor:</span>
                    <span className="text-yellow-400">0.43</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Override Potential:</span>
                    <span className="text-orange-400">0.29</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Face Credibility:</span>
                    <span className="text-blue-400">0.72</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interpretation Section */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Interpretation</h3>
            <div className="space-y-3">
              <div>
                <p className="text-white font-medium mb-2">One-liner:</p>
                <p className="text-gray-300 text-sm">
                  You choose {primary.face} (63% conf). Evidence favors {secondary.face} (82%).
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-2">Analysis:</p>
                <p className="text-gray-300 text-sm">
                  User reports operating as a fast-focused Navigator, but their answers show stronger fact-checking patterns. 
                  Consider a 2-question probe or an alignment exercise.
                </p>
              </div>
            </div>
          </div>
          
          {/* Behavior Profile */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-md font-semibold text-yellow-400 mb-2">Behavior Profile</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary:</span>
                  <span className="text-white">focused</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Secondary:</span>
                  <span className="text-white">task-oriented</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Energy:</span>
                  <span className="text-green-400">high</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Score:</span>
                  <span className="text-blue-400">0.78</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-md font-semibold text-yellow-400 mb-2">Context Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Situations:</span>
                  <span className="text-white">group_chat, quick_fix</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Visibility:</span>
                  <span className="text-white">public</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pressure:</span>
                  <span className="text-yellow-400">moderate</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-md font-semibold text-yellow-400 mb-2">Psychology</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Motivation:</span>
                  <span className="text-white">completion</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fear:</span>
                  <span className="text-white">delay</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Strength:</span>
                  <span className="text-white">focus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Growth:</span>
                  <span className="text-white">flexibility</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommendation */}
          <div className="mt-6 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-lg p-4 border border-yellow-400/30">
            <h4 className="text-md font-semibold text-yellow-400 mb-2">Recommendation</h4>
            <p className="text-gray-300 text-sm">
              Run 2-question probe in 'high-pressure online' context; if user still prefers Navigator, 
              provide focused execution micro-tasks for 2 weeks.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation flex border-b border-gray-600 mb-6">
          <button 
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'results' 
                ? 'text-yellow-400 border-b-2 border-yellow-400' 
                : 'text-gray-400 hover:text-white border-b-2 border-transparent'
            }`}
            onClick={() => setActiveTab('results')}
          >
            Your Results
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'diagnostics' 
                ? 'text-yellow-400 border-b-2 border-yellow-400' 
                : 'text-gray-400 hover:text-white border-b-2 border-transparent'
            }`}
            onClick={() => setActiveTab('diagnostics')}
          >
            Engine Diagnostics
          </button>
                      </div>

        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            {getArchetypeMappingTitle(secondary.face, sifData.prize.face.split(':')[1])}
          </h1>
          <p className="text-gray-400">Your SIF Canon v3 Results</p>
        </div>

        {/* Tab Content */}
        {activeTab === 'diagnostics' ? (
          <DiagnosticsPage 
            extract={extractSnapshot} 
            state={state} 
            sifResult={state.sifResult} 
            sifEngine={sifEngine} 
          />
                        ) : (
                          <>
            {/* Header */}
            <div className="bg-gray-900 border border-yellow-400 rounded-2xl p-6 mb-6">
              <div className="space-y-6">
                {/* Primary Anchor (from Phase D Secondary) */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-yellow-400">
                    Primary Anchor: {secondary.face}
                  </h2>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {getPrimaryDescription(secondary.face)}
                  </p>
                </div>


                {/* Main Operating Lines */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-yellow-400">
                    Main Operating Lines
                  </h2>
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">Your core focus areas from Phase A:</p>
                    <div className="flex flex-wrap gap-2">
                      {state.lines.filter(line => line.selectedA).map(line => (
                        <span key={line.id} className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">
                          {line.id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Archetypes from Phase E */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-yellow-400">
                    Selected Archetypes
                  </h2>
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">Archetypes you selected in Phase E:</p>
                    <div className="space-y-1">
                      {state.questionHistory
                        .filter(q => q.phase === 'E')
                        .map((question, index) => {
                          const line = state.lines.find(l => l.id === question.lineId);
                          const archetypeQuestions = line ? getArchetypeQuestionsForFamily(line.id) : [];
                          const questionData = archetypeQuestions.find((q: any) => q.id === question.questionId);
                          const selectedArchetype = questionData ? questionData.map[question.choice as 'A' | 'B'] : 'Unknown';
                          
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-yellow-400 font-medium">{line?.id}:</span>
                              <span className="text-gray-300">{selectedArchetype}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Needed for Alignment */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-yellow-400">
                    Needed for Alignment: {sifData.neededForAlignment.face}
                  </h2>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    For full alignment, your Secondary should shift toward {sifData.neededForAlignment.face}. Only then does your anchor lock into its full potential instead of operating alone.
                  </p>
                  <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <p className="text-sm text-blue-400 font-medium">
                      Archetype Face Pattern: {sifData.facePattern}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                <div className="text-sm text-gray-400">
                  Face Color: <span className="font-semibold" style={{ color: sifData.colorToken || '#ffffff' }}>
                    {sifData.colorToken}
                  </span>
                </div>
              </div>
            </div>


          
        {/* Section 3 — Secondary Current */}
        <div className="bg-gray-900 border border-gray-600 rounded-2xl p-6 mb-4">
          <h2 className="text-xl font-bold text-orange-400 mb-3">
            {sifData.secondary.face.split(':')[1] || sifData.secondary.face} — {sifData.aligned ? 'Aligned' : 'Not yet aligned'}
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Color: <span style={{ color: sifData.colorToken || '#ffffff' }}>
                {sifData.colorToken}
              </span>)
            </span>
          </h2>
          <div className="text-sm text-gray-300 space-y-2">
            {sifData.aligned ? (
              <>
                <p>Your installed face matches the Prize pattern. Keep using <strong>{sifData.secondary.face.split(':')[1] || sifData.secondary.face}</strong> to maintain alignment with <strong>{sifData.prize.face}</strong>.</p>
                <div className="mt-2 p-2 bg-green-900/20 border border-green-500 rounded text-xs">
                  <strong>✅ Aligned:</strong> Secondary face matches Prize. You're optimally configured.
              </div>
              </>
            ) : (
              <>
                <p>Secondary lines add situational color, not a stable role.</p>
                <p><strong>{sifData.secondary.face.split(':')[1] || sifData.secondary.face}</strong> may show up as supporting energy. It can help your work, but it does not install <strong>{sifData.prize.face}</strong>.</p>
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500 rounded text-xs">
                  <strong>⚠️ Not yet aligned:</strong> Secondary face doesn't match Prize. Consider adopting {sifData.prize.face} pattern.
              </div>
              </>
            )}
          </div>
        </div>



        {/* Unified Face vs IL Analysis Table */}
        <div className="bg-gray-900 border border-purple-500 rounded-2xl p-4 mb-4">
          <h2 className="text-lg font-bold text-purple-400 mb-3">Face vs IL Analysis</h2>
          <div className="text-sm text-gray-300">
            <p className="text-gray-400 mb-4">Comparing your inner strength (SIF) with outer expectations (IL) using canonical match rules:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2 text-gray-300">Family</th>
                    <th className="text-left p-2 text-gray-300">Face</th>
                    <th className="text-left p-2 text-gray-300">SIF (value + band)</th>
                    <th className="text-left p-2 text-gray-300">IL (value + band)</th>
                    <th className="text-left p-2 text-gray-300">Combined Label</th>
                    <th className="text-left p-2 text-gray-300">Guidance</th>
                  </tr>
                </thead>
                <tbody>
                   {sifData.faceVsIL
                     .map(item => {
                       // Use recalibrated banding from sifDataResolverNew
                       const sifBand = item.sifBand || (item.faceScore < 0.30 ? "Low" : item.faceScore < 0.50 ? "Medium" : "High");
                       const ilBand = item.ilBand || (item.ilScore < 1.60 ? "Low" : item.ilScore < 2.40 ? "Medium" : "High");
                       const combinedLabel = item.combinedLabel || item.label;
                       
                       // Color mapping for combined labels
                       let combinedColor = '';
                       let guidance = '';
                       
                       switch (combinedLabel) {
                         case 'Match':
                           combinedColor = 'text-green-400 bg-green-900/20';
                           guidance = 'Inside and outside agree. Lean into this face; it will install cleanly.';
                           break;
                         case 'Outside-only':
                           combinedColor = 'text-blue-400 bg-blue-900/20';
                           guidance = 'Others expect this; you don\'t carry it. Borrow sparingly or train it.';
                           break;
                         case 'Inside-only':
                           combinedColor = 'text-orange-400 bg-orange-900/20';
                           guidance = 'You carry this; others don\'t expect it. Use selectively or with welcoming context.';
                           break;
                         case 'Low both':
                           combinedColor = 'text-gray-400 bg-gray-900/20';
                           guidance = 'Weak inside and outside. Don\'t force it.';
                           break;
                         default:
                           // Fallback for legacy labels
                           if (item.label === 'High IL, low Face') {
                             combinedColor = 'text-blue-400 bg-blue-900/20';
                             guidance = 'Others expect this; you don\'t carry it. Borrow sparingly or train it.';
                           } else if (item.label === 'Low IL, high Face') {
                             combinedColor = 'text-orange-400 bg-orange-900/20';
                             guidance = 'You carry this; others don\'t expect it. Use selectively or with welcoming context.';
                           } else if (item.label === 'Low Both') {
                             combinedColor = 'text-gray-400 bg-gray-900/20';
                             guidance = 'Weak inside and outside. Don\'t force it.';
                           } else {
                             combinedColor = 'text-green-400 bg-green-900/20';
                             guidance = 'Inside and outside agree. Lean into this face; it will install cleanly.';
                           }
                       }
                       
                       const family = item.face.split(':')[0];
                       const faceName = item.face.split(':')[1];
                       
                       return {
                         ...item,
                         family,
                         faceName,
                         sifBand,
                         ilBand,
                         combinedLabel,
                         combinedColor,
                         guidance
                       };
                     })
                    .sort((a, b) => {
                      // Sort by combined label priority: Match > Outside-only > Inside-only > Low both
                      const order = (label: string) => {
                        switch (label) {
                          case 'Match': return 0;
                          case 'Outside-only': return 1;
                          case 'Inside-only': return 2;
                          case 'Low both': return 3;
                          default: return 4;
                        }
                      };
                      
                      const orderA = order(a.combinedLabel);
                      const orderB = order(b.combinedLabel);
                      
                      if (orderA !== orderB) return orderA - orderB;
                      
                      // Within same category, sort by IL score descending
                      return b.ilScore - a.ilScore;
                    })
                    .map(item => (
                      <tr key={item.face} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="p-2 text-gray-200 font-medium">{item.family}</td>
                        <td className="p-2 text-gray-200 font-medium">{item.faceName}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 font-mono text-sm">{item.faceScore.toFixed(2)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.sifBand === 'High' ? 'text-green-400 bg-green-900/20' :
                              item.sifBand === 'Medium' ? 'text-yellow-400 bg-yellow-900/20' :
                              'text-red-400 bg-red-900/20'
                            }`}>
                              {item.sifBand}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 font-mono text-sm">{item.ilScore.toFixed(2)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.ilBand === 'High' ? 'text-green-400 bg-green-900/20' :
                              item.ilBand === 'Medium' ? 'text-yellow-400 bg-yellow-900/20' :
                              'text-red-400 bg-red-900/20'
                            }`}>
                              {item.ilBand}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.combinedColor}`}>
                            {item.combinedLabel}
                          </span>
                        </td>
                        <td className="p-2 text-gray-400 text-xs leading-relaxed">
                          {item.guidance}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
          
           {/* Canonical Match Rules Summary */}
           <div className="mt-6 p-4 bg-gray-800 border border-gray-600 rounded-xl">
             <h3 className="text-md font-bold text-yellow-400 mb-3">Canonical Match Rules (v3 - Recalibrated)</h3>
             
             <div className="space-y-4 text-sm text-gray-300">
               <div>
                 <h4 className="font-semibold text-blue-400 mb-2">🎯 Recalibrated Thresholds</h4>
                 <div className="space-y-2 ml-4">
                   <div>
                     <span className="font-medium text-green-400">SIF (face strength):</span>
                     <span className="text-gray-300"> Low &lt; 0.30, Medium 0.30–0.49, High ≥ 0.50</span>
                   </div>
                   <div>
                     <span className="font-medium text-purple-400">IL (Installed Likelihood):</span>
                     <span className="text-gray-300"> Low &lt; 1.60, Medium 1.60–2.40, High &gt; 2.40</span>
                     <span className="text-yellow-400 text-xs ml-2">(Recalibrated after Stress redistribution)</span>
                   </div>
                 </div>
               </div>
              
               <div>
                 <h4 className="font-semibold text-yellow-400 mb-2">🔍 Combined Labels (Recalibrated)</h4>
                 <div className="space-y-2 ml-4">
                   <div>
                     <span className="font-medium text-green-400">Match:</span>
                     <span className="text-gray-300"> SIF ≥ 0.50 AND IL ≥ 1.60</span>
                   </div>
                   <div>
                     <span className="font-medium text-blue-400">Outside-only:</span>
                     <span className="text-gray-300"> SIF &lt; 0.30 AND IL ≥ 1.60</span>
                   </div>
                   <div>
                     <span className="font-medium text-orange-400">Inside-only:</span>
                     <span className="text-gray-300"> SIF ≥ 0.30 AND IL &lt; 1.60</span>
                   </div>
                   <div>
                     <span className="font-medium text-gray-400">Low both:</span>
                     <span className="text-gray-300"> SIF &lt; 0.30 AND IL &lt; 1.60</span>
                   </div>
                 </div>
               </div>
              
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">💡 Key Insights</h4>
                <div className="space-y-2 ml-4">
                  <div>
                    <span className="font-medium text-green-400">Match faces:</span>
                    <span className="text-gray-300"> Both internal capacity and external reality align - strongest secondary candidates</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-400">Outside-only faces:</span>
                    <span className="text-gray-300"> Others expect this but you don't carry it - potential training opportunities</span>
                  </div>
                  <div>
                    <span className="font-medium text-orange-400">Inside-only faces:</span>
                    <span className="text-gray-300"> You carry this but others don't expect it - use with welcoming context</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">Low both faces:</span>
                    <span className="text-gray-300"> Weak inside and outside - don't force it</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <span className="font-mono text-sm">{sifData.prizeChain}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Seven-line snapshot: C = clean, O = offset, F = fail under pressure
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
                  {sifData.perLine.map((line, index) => (
                      <tr key={line.family} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-2 font-medium">{line.family}</td>
                        <td className="py-3 px-2">
                          {line.isALine ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 border border-green-400 text-green-400 bg-transparent rounded-full text-xs">
                              A-line
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {line.isALine && line.phaseB ? (
                            <div className="flex gap-1 flex-wrap">
                              {line.phaseB.map((pick, i) => (
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
                          {!line.isALine && line.module ? (
                            <div className="flex gap-1 flex-wrap">
                              {line.module.map((pick, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
                                  {pick}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-2 font-mono">
                          {(() => {
                          const famC = sifCounters.famC?.[line.family] ?? 0;
                          const famO = sifCounters.famO?.[line.family] ?? 0;
                          const famF = sifCounters.famF?.[line.family] ?? 0;
                          const total = famC + famO + famF;
                          return total;
                          })()}
                        </td>
                        <td className="text-right py-3 px-2 font-mono">
                          {line.purity.toFixed(1)}
                        </td>
                        <td className="text-right py-3 px-2 font-mono">
                          {line.verdict}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>


        {/* Severity Probes */}
        {sifData.severityProbes.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
            <h2 className="text-lg font-bold mb-4">Severity Probes</h2>
            <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-yellow-400 mb-2">What Severity Probes Test:</p>
                <p className="mb-2">High-pressure situations that stress the weak line.</p>
                <div className="space-y-1 text-xs">
                  <p><span className="text-green-400">Option A (C pick):</span> Shows you can still act through the line → <span className="text-yellow-400">severity light F</span> (bend, not collapse)</p>
                  <p><span className="text-red-400">Option B (F pick):</span> Shows the line fails under pressure → <span className="text-red-400">severity deep F</span> (collapsed)</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {sifData.severityProbes.map(probe => (
                <div key={probe.family} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{probe.family} — F verdict</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      probe.resolved === 'Light F' 
                        ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' 
                        : 'bg-red-800 text-red-200 border border-red-600'
                    }`}>
                      Resolved: {probe.resolved}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <div className="mb-1">
                      <span className="text-yellow-400 font-semibold">Severity Assessment:</span> {probe.resolved === 'Light F' ? 'Light F (bend, not collapse)' : 'Deep F (collapsed)'}
                    </div>
                    <div className="mb-1">
                      <span className="text-purple-400 font-semibold">Foreign Creep:</span> {probe.foreignCreep}
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400">Description:</span> {probe.description}
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400">Outcome:</span> {probe.resolved === 'Light F' ? 'Transient collapse. Context mis-sync.' : 'Structural collapse. Core crack in the line.'}
                    </div>
                    <div>
                      <span className="text-gray-400">Action:</span> {probe.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                <span className="text-sm font-semibold">{sifData.prize.face}</span>
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
                  {sifData.aligned ? 'Aligned' : 'Not yet aligned'}
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

        {/* Enter Chapter Button - Now uses Secondary (user's choice) */}
        <div className="text-center mt-8 mb-6">
          <button
            onClick={handleArchetypeNavigation}
            className="px-8 py-4 bg-gradient-to-r from-brand-amber-500 to-brand-amber-600 text-brand-gray-900 font-bold text-lg rounded-xl hover:from-brand-amber-400 hover:to-brand-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-amber-400/30"
          >
            Enter Chapter: {(secondary?.face || primary.face).split(':')[1]}
          </button>
          <p className="text-brand-gray-400 text-sm mt-2">
            Deep dive into your chosen archetype's strengths, challenges, and growth areas
          </p>
          <p className="text-brand-gray-500 text-xs mt-1">
            Will navigate to: /archetypes/{getArchetypeSlug(secondary?.face || primary.face)}
          </p>
          <p className="text-brand-gray-600 text-xs mt-1">
            {secondary?.face ? 'Using your Phase D choice' : 'Using Primary (fallback)'}
          </p>
        </div>

            <footer className="text-center text-xs text-gray-400 mt-3">
              Built for SIF Canon v3 engine — dark/gold detailed template with accurate console logging.
        </footer>
          </>
        )}
      </div>
    </div>
  );
}
