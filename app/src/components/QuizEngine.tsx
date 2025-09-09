import React, { useState, useCallback, useEffect } from 'react';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { PhaseA } from './quiz/PhaseA';
import { PhaseBIntegrated } from './quiz/PhaseBIntegrated';
import { PhaseC } from './quiz/PhaseC';
import { PhaseE } from './quiz/PhaseE';
import PhaseD from './quiz/PhaseD';
import { SummaryClean } from './quiz/SummaryClean';
import { quizRecorder } from '@/utils/QuizRecorder';
import { ProgressBar } from './ProgressBar';
import { phaseDEngine } from '@/engine/PhaseD';
import { getArchetypeQuestionsForFamily, getArchetypesForFamily } from '@/data/questions';
import { FACE_ANCHOR } from '@/types/quiz';
import LoadingScreen from './quiz/LoadingScreen';
import { useLoadingTransition } from '@/hooks/useLoadingTransition';

export function QuizEngine() {
  const {
    state,
    selectedA,
    nonA,
    updateLine,
    updatePhase,
    setAnchor,
    resetQuiz,
    verdictFrom,
    addUsedQuestion,
    removeUsedQuestion,
    goBack,
    addQuestionToHistory,
    addArchetypeAnswer,
    setFinalArchetype,
    // SIF methods
    recordSIFAnswerWithEffects, // NEW
    recordSIFAnswer, // DEPRECATED but kept for compatibility
    recordSIFSeverity,
    recordAllSIFData,
    calculateSIF,
    setFamilyVerdicts,
    // SIF v3 methods
    setSIFShortlist,
    setInstalledChoice,
    finalizeSIFWithInstall,
    sifEngine
  } = useQuizEngine();

  // Loading screen state
  const { isLoading, currentPhase: loadingPhase, showLoading, hideLoading } = useLoadingTransition();
  const [previousPhase, setPreviousPhase] = useState<string | null>(null);

  // Track when to show loading screens (only on user actions, not automatic phase changes)
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [targetPhase, setTargetPhase] = useState<string | null>(null);

  const getLoadingPhase = (phase: string) => {
    switch (phase) {
      case 'A':
        return 'home-to-a';
      case 'B':
        return 'a-to-b';
      case 'C':
        return 'b-to-c';
      case 'D':
        return 'c-to-d';
      case 'E':
        return 'd-to-e';
      case 'Summary':
        return 'final-result';
      default:
        return null;
    }
  };

  // Show loading screen when user action triggers it
  useEffect(() => {
    if (shouldShowLoading && targetPhase) {
      const loadingPhase = getLoadingPhase(targetPhase);
      if (loadingPhase) {
        showLoading(loadingPhase);
        setShouldShowLoading(false);
        setTargetPhase(null);
      }
    }
  }, [shouldShowLoading, targetPhase, showLoading]);

  const handleLoadingComplete = () => {
    hideLoading();
    // Now actually update the phase after loading screen completes
    // We need to get the current target phase from the loading screen
    const currentLoadingPhase = loadingPhase;
    if (currentLoadingPhase) {
      // Map loading phase back to quiz phase
      const phaseMap: Record<string, string> = {
        'home-to-a': 'A',
        'a-to-b': 'B', 
        'b-to-c': 'C',
        'c-to-d': 'D',
        'd-to-e': 'E',
        'final-result': 'Summary'
      };
      const quizPhase = phaseMap[currentLoadingPhase];
      if (quizPhase) {
        // Do all processing here during loading screen completion
        if (quizPhase === 'B') {
          // Process Phase B initialization
          console.log('🚀 Starting Phase B with A-lines:', selectedA().map(l => l.id));
          selectedA().forEach(line => {
            updateLine(line.id, {
              B: { picks: [], C_evidence: 0.6 }
            });
          });
        } else if (quizPhase === 'C') {
          // Process Phase C initialization
          const selectedALines = state.lines.filter(l => l.selectedA);
          const nonALines = state.lines.filter(l => !l.selectedA);
          
          // Calculate face purity for A-lines
          const facePurity: Record<string, number> = {};
          selectedALines.forEach(l => facePurity[l.id] = l.B.C_evidence);
          
          // Calculate module purity for non-A lines
          const modulePurity: Record<string, number> = {};
          nonALines.forEach(l => modulePurity[l.id] = l.mod.decisions.filter(d => d.pick === "C").length * 1.0);

          // Calculate purity for all lines
          const allPurity: Record<string, number> = {};
          state.lines.forEach(line => {
            if (line.selectedA) {
              allPurity[line.id] = facePurity[line.id];
            } else {
              allPurity[line.id] = modulePurity[line.id];
            }
          });
        }
        
        updatePhase(quizPhase);
      }
    }
  };

  
  // Calculate accurate progress based on current phase and completed steps
  const getProgress = useCallback(() => {
    const selectedALines = selectedA();
    const nonALines = nonA();
    
    let completed = 0;
    let total = 0;
    
    switch (state.phase) {
      case 'A':
        // Phase A: 3 family cards to select (33% each, 100% when all 3 selected)
        const selectedCount = selectedALines.length;
        completed = Math.min(selectedCount, 3); // Cap at 3
        total = 3; // Show progress out of 3, not 7
        break;
        
      case 'B':
        // Phase B: 2 duels per A-line (6 total)
        completed = selectedALines.reduce((sum, line) => sum + line.B.picks.length, 0);
        total = selectedALines.length * 2;
        break;
        
      case 'C':
        // Phase C: 3 module questions per non-A line (12 total) + severity if needed
        const moduleCompleted = nonALines.reduce((sum, line) => sum + line.mod.decisions.length, 0);
        const severityNeeded = nonALines.filter(line => {
          const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
          return by['CF'] === 'F';
        }).length;
        
        completed = moduleCompleted;
        total = nonALines.length * 3 + severityNeeded;
        break;
        
      case 'D':
        // Phase D: Install question - progress based on whether user has made a choice
        completed = state.installedChoice ? 1 : 0;
        total = 1;
        break;
        
      case 'E':
        // Phase E: Anchor selection - progress based on whether user has made a choice
        completed = state.anchor ? 1 : 0;
        total = 1;
        break;
        
      case 'Archetype':
        // Archetype: Questions to determine specific archetype within family (best-of-3 system)
        const archetypeQuestions = state.anchor ? getArchetypeQuestionsForFamily(state.anchor) : [];
        completed = Object.keys(state.archetypeAnswers).length;
        
        // Calculate dynamic total based on best-of-3 logic
        if (completed === 0) {
          total = 2; // Start with 2 questions minimum
        } else {
          // Count current archetype wins to determine if we need a 3rd question
          const archetypes = state.anchor ? getArchetypesForFamily(state.anchor) : [];
          const archetypeCounts = archetypes.reduce((acc, archetype) => {
            acc[archetype] = 0;
            return acc;
          }, {} as Record<string, number>);
          
          // Count archetype selections
          Object.entries(state.archetypeAnswers).forEach(([questionId, choice]) => {
            const question = archetypeQuestions.find(q => q.id === questionId);
            if (question && (choice === 'A' || choice === 'B')) {
              const archetype = question.map[choice];
              archetypeCounts[archetype]++;
            }
          });
          
          const maxWins = Math.max(...Object.values(archetypeCounts));
          
          if (maxWins >= 2) {
            // Early win! Total is the number of questions answered
            total = completed;
          } else if (completed === 2) {
            // After 2 questions, check if we need a tiebreaker
            const values = Object.values(archetypeCounts);
            const isTied = values[0] === values[1] && values[0] === 1;
            total = isTied ? 3 : 2; // Need 3rd question if tied, otherwise done at 2
          } else {
            // Still in progress, show 2 as target
            total = 2;
          }
        }
        break;
        
      case 'FinalProcessing':
        // Final Processing: Complete
        completed = 1;
        total = 1;
        break;
        
      case 'Summary':
        // Summary: Complete
        completed = 1;
        total = 1;
        break;
        
      default:
        completed = 0;
        total = 1;
    }
    
    return { completed, total };
  }, [state.phase, state.installedChoice, state.anchor, selectedA, nonA]);

  const stepDone = useCallback(() => {
    // Progress is calculated dynamically, no need to manually track
    // The UI will update automatically when state changes
  }, []);

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // Anchor calculation function - runs after Phase D completes
  const calculateAnchor = useCallback(() => {
    const selectedALines = selectedA();
    const nonALines = nonA();

    // Calculate purity scores
    const facePurity: Record<string, number> = {};
    selectedALines.forEach(l => facePurity[l.id] = l.B.C_evidence);
    
    const modulePurity: Record<string, number> = {};
    nonALines.forEach(l => modulePurity[l.id] = l.mod.decisions.filter(d => d.pick === "C").length * 1.0);

    // Calculate purity for all lines
    const allPurity: Record<string, number> = {};
    state.lines.forEach(line => {
      if (line.selectedA) {
        // A-lines: use face purity (C_evidence)
        allPurity[line.id] = facePurity[line.id];
      } else {
        // Non-A lines: use module purity
        allPurity[line.id] = modulePurity[line.id];
      }
    });
    
    console.log('🔍 Anchor calculation - All purity scores:', allPurity);
    
    // Priority 1: Any A-line with exactly 2.6
    const a26 = selectedALines.filter(l => Math.abs(allPurity[l.id] - 2.6) < 1e-9);
    if (a26.length === 1) {
      console.log('🎯 Priority 1 - Single A-line with 2.6:', a26[0].id);
      return a26[0].id; // Return the single 2.6 A-line
    } else if (a26.length > 1) {
      console.log('🎯 Priority 1 - Multiple A-lines with 2.6, need tie-breaker:', a26.map(l => l.id));
      return null; // Need tie-breaker
    }
    
    // Priority 2: Any line with exactly 3.0
    const anyThree = state.lines.filter(l => Math.abs(allPurity[l.id] - 3.0) < 1e-9);
    if (anyThree.length === 1) {
      console.log('🎯 Priority 2 - Single line with 3.0:', anyThree[0].id);
      return anyThree[0].id; // Return the single 3.0 line
    } else if (anyThree.length > 1) {
      console.log('🎯 Priority 2 - Multiple lines with 3.0, need tie-breaker:', anyThree.map(l => l.id));
      return null; // Need tie-breaker
    }
    
    // Priority 3: Best score less than 3.0 (higher is better)
    let best = -999;
    let bestLines: string[] = [];
    state.lines.forEach(l => {
      const p = allPurity[l.id];
      if (Math.abs(p - 2.6) < 1e-9) return; // exclude 2.6 here per rule
      if (p < 3.0 - 1e-9) {
        if (p > best + 1e-9) { 
          best = p; 
          bestLines = [l.id]; 
        } else if (Math.abs(p - best) < 1e-9) { 
          bestLines.push(l.id); 
        }
      }
    });
    
    if (bestLines.length === 1) {
      console.log('🎯 Priority 3 - Single best < 3.0:', bestLines[0], 'score:', best);
      return bestLines[0];
    } else if (bestLines.length > 1) {
      console.log('🎯 Priority 3 - Multiple best < 3.0, need tie-breaker:', bestLines, 'score:', best);
      return null; // Need tie-breaker
    }
    
    console.log('❌ No anchor found - this should not happen');
    return null;
  }, [selectedA, nonA, state.lines]);

  const handleLineToggle = (lineId: string) => {
    const line = state.lines.find(l => l.id === lineId);
    if (!line) return;

    const currentSelected = selectedA().length;
    if (!line.selectedA && currentSelected >= 3) return;

    updateLine(lineId, { selectedA: !line.selectedA });
  };

  const handleStartPhaseB = () => {
    // Show loading screen immediately, do processing during loading
    setTargetPhase('B');
    setShouldShowLoading(true);
  };

  const handlePhaseBChoice = (lineId: string, choice: string) => {
    const line = state.lines.find(l => l.id === lineId);
    if (!line) return;

    const round = line.B.picks.length + 1;
    const firstWasO = line.B.picks[0] === "O";
    const promptType = round === 1 ? "CO" : (firstWasO ? "CF" : "CO");

    const newPicks = [...line.B.picks, choice];
    const newC_evidence = line.B.C_evidence + (choice === "C" ? 1.0 : 0);

    updateLine(lineId, {
      B: {
        picks: newPicks,
        C_evidence: newC_evidence
      }
    });

    stepDone();
  };

  const handlePhaseCChoice = (lineId: string, choice: string, decisionType: 'CO1' | 'CO2' | 'CF') => {
    const line = state.lines.find(l => l.id === lineId);
    if (!line) return;

    const newDecisions = [...line.mod.decisions, { type: decisionType, pick: choice as 'C' | 'O' | 'F' }];
    updateLine(lineId, { mod: { decisions: newDecisions } });
    stepDone();
  };

  const handleSeveritySelect = (lineId: string, severity: 'high' | 'mid' | 'low', score: 1.0 | 0.5 | 0.0) => {
    // Record the severity selection in SIF counters
    // Map low severity to F0.5 since recordSIFSeverity only accepts F0.5 | F1
    recordSIFSeverity(lineId, severity === 'high' ? 'F1' : 'F0.5');
    stepDone();
  };

  const handleProceedToC = () => {
    // Show loading screen immediately, do processing during loading
    setTargetPhase('C');
    setShouldShowLoading(true);
  };

  const handleProceedToD = useCallback(() => {
    console.log('📈 Proceeding to Phase D');
    // Show loading screen before transitioning to Phase D
    setTargetPhase('D');
    setShouldShowLoading(true);
  }, []);

  const handleProceedToE = () => {
    console.log('📈 Proceeding to Phase E (Primary/Anchor selection)');
    
    // Build SIF shortlist before Phase E so it can use self-installed candidates
    console.log('🔧 Building SIF shortlist for Phase E...');
    
    // Get anchor candidate families for SIF shortlist
    const selectedALines = state.lines.filter(l => l.selectedA);
    const nonALines = state.lines.filter(l => !l.selectedA);
    
    // Calculate face purity for A-lines
    const facePurity: Record<string, number> = {};
    selectedALines.forEach(l => facePurity[l.id] = l.B.C_evidence);
    
    // Calculate module purity for non-A lines
    const modulePurity: Record<string, number> = {};
    nonALines.forEach(l => modulePurity[l.id] = l.mod.decisions.filter(d => d.pick === "C").length * 1.0);
    
    // Find A-line 2.6 faces and module top families
    const a26Faces = selectedALines
      .filter(l => Math.abs(facePurity[l.id] - 2.6) < 1e-9)
      .map(l => `${l.id}:Face`); // Convert to face format
    
    const topModulePurity = Math.max(...nonALines.map(l => modulePurity[l.id]));
    const moduleTopFamilies = nonALines
      .filter(l => Math.abs(modulePurity[l.id] - topModulePurity) < 1e-9)
      .map(l => l.id);
    
    console.log('🔧 SIF shortlist inputs:', { a26Faces, moduleTopFamilies });
    
    // Build SIF shortlist using the engine
    const shortlist = sifEngine.buildPhaseDInstallShortlist(state, a26Faces, moduleTopFamilies);
    setSIFShortlist(shortlist);
    
    console.log('🔧 SIF shortlist built:', shortlist);
    
    // Show celebration screen first
    updatePhase('Celebration');
    
    // After celebration, proceed to Phase E
    setTimeout(() => {
      // Calculate anchor immediately after Phase C completes
      const anchor = calculateAnchor();
      if (anchor) {
        console.log('🎯 Anchor determined immediately:', anchor);
        setAnchor(anchor);
        // Show loading screen before transitioning to Phase E
        setTargetPhase('E');
        setShouldShowLoading(true);
      } else {
        console.log('🎯 No clear anchor, proceeding to Phase E for tie-break');
        // Show loading screen before transitioning to Phase E
        setTargetPhase('E');
        setShouldShowLoading(true);
      }
    }, 2500); // 2.5 second celebration
  };



  const handleAnchorSelect = (anchor: string) => {
    console.log('🎯 Anchor selected:', anchor);
    setAnchor(anchor);
  };

  const handleProceedToArchetype = ({ selectedLine, anchorSource }: {
    selectedLine: string;
    anchorSource: "E:Purity" | "E:TieBreak" | "E:SelfInstalled";
  }) => {
    console.log('🎯 Phase E proceeding to archetype:', { selectedLine, anchorSource });
    
    // Check if this is an A-line (selected in Phase A)
    const selectedLineData = state.lines.find(line => line.id === selectedLine);
    const isALine = selectedLineData?.selectedA || false;
    
    console.log('🎯 Line type check:', { selectedLine, isALine, selectedLineData });
    
    let finalArchetype = 'Rebel'; // Default fallback
    
    if (isALine) {
      // A-lines: determine archetype from Phase B picks
      const picks = selectedLineData?.B?.picks || [];
      console.log('🎯 A-line Phase B picks:', { selectedLine, picks });
      
      // For A-lines, use the first pick to determine archetype
      // This is a simplified approach - in a real system you might have more complex logic
      if (picks.length > 0) {
        // Use the FACE_ANCHOR mapping to determine which face corresponds to the first pick
        const faceAnchor = FACE_ANCHOR[selectedLine];
        if (faceAnchor) {
          // For now, default to the first face in the family
          finalArchetype = faceAnchor.CO1; // Use CO1 as default
          console.log('🎯 A-line archetype determined:', { selectedLine, finalArchetype, faceAnchor });
        }
      }
    } else {
      // Non-A lines: determine archetype from SIF face counters
      const faceCounters = state.sifCounters.faceC;
      const familyFaces = Object.keys(faceCounters).filter(face => 
        face.startsWith(`${selectedLine}:`)
      );
      
      console.log('🎯 Non-A line SIF counters:', {
        selectedLine,
        familyFaces,
        faceCounters: familyFaces.map(face => ({ face, count: faceCounters[face] }))
      });
      
      // Find the face with highest count for this family
      let maxCount = 0;
      
      familyFaces.forEach(face => {
        const count = faceCounters[face] || 0;
        if (count > maxCount) {
          maxCount = count;
          finalArchetype = face.split(':')[1]; // Extract archetype part
        }
      });
      
      console.log('🎯 Non-A line archetype determined:', { selectedLine, finalArchetype, maxCount });
    }
    
    console.log('🎯 Final archetype determined:', { selectedLine, finalArchetype });
    
    // Set both anchor and final archetype
    setAnchor(selectedLine);
    setFinalArchetype(finalArchetype);
    
    // Record SIF data with the determined archetype
    const primaryFace = `${selectedLine}:${finalArchetype}`;
    console.log('🎯 Recording SIF data with determined archetype:', { selectedLine, primaryFace });
    recordAllSIFData(state, selectedLine, primaryFace);
    
    updatePhase('FinalProcessing');
  };



  const handleRestart = () => {
    resetQuiz();
  };

  // Handle FinalProcessing phase transition
  const [finalProcessingStep, setFinalProcessingStep] = useState(0);
  
  useEffect(() => {
    if (state.phase === 'FinalProcessing') {
      setFinalProcessingStep(0);
      
      // Skip the pattern found step
      const patternTimer = setTimeout(() => {
        setFinalProcessingStep(1);
      }, 100);
      
      // Go to Summary after 1.5 seconds
      const summaryTimer = setTimeout(() => {
        // Show loading screen before transitioning to Summary
        setTargetPhase('Summary');
        setShouldShowLoading(true);
      }, 1500);
      
      return () => {
        clearTimeout(patternTimer);
        clearTimeout(summaryTimer);
      };
    }
  }, [state.phase, updatePhase]);

  const handleSIFCalculate = useCallback((primaryFamily: string, primaryFace: string, prizeFace: string) => {
    return calculateSIF(primaryFamily, primaryFace, prizeFace);
  }, [calculateSIF]);

  return (
    <div className="bg-black text-gray-200 font-sans relative min-h-screen">
      <div className={`mx-auto px-4 py-4 sm:py-8 bg-gray-900 rounded-xl ${
        state.phase === 'B' || state.phase === 'C' ? 'max-w-2xl' : 'max-w-4xl'
      }`}>
        
        {(() => {
          const { completed, total } = getProgress();
          const getStepInfo = () => {
            switch (state.phase) {
              case 'A': return { step: 1, title: 'Choose your focus', description: `${completed}/3 families selected` };
              case 'B': return { step: 2, title: 'Quick choices', description: `${completed}/${total} dilemmas completed` };
              case 'C': return { step: 3, title: 'Module decisions', description: `${completed}/${total} scenarios completed` };
              case 'D': return { step: 4, title: 'Install question', description: `${completed}/${total} choice made` };
              case 'E': return { step: 5, title: 'Anchor selection', description: `${completed}/${total} choice made` };
              case 'Archetype': return { step: 5, title: 'Your profile', description: 'Determining your specific archetype...' };
              case 'FinalProcessing': return { step: 6, title: 'Final processing', description: 'Processing results...' };
              case 'Summary': return { step: 7, title: 'Complete', description: 'Your 7-minute profile is ready!' };
              default: return { step: 1, title: 'Getting started', description: 'This takes about 7 minutes' };
            }
          };
          
          const stepInfo = getStepInfo();
          return total > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Step {stepInfo.step}: {stepInfo.title}</h2>
                  <p className="text-sm text-gray-400">{stepInfo.description}</p>
                </div>
                {state.phase === 'A' && (
                  <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                    ~7 minutes
                  </div>
                )}
              </div>
              <ProgressBar progress={completed} total={total} />
            </div>
          );
        })()}


        {/* Phase Content - Only show when not loading */}
        {!isLoading && (
          <div id="app" className="relative transition-all duration-300 ease-in-out">
            {state.phase === 'A' && (
              <PhaseA
                state={state}
                onLineToggle={handleLineToggle}
                onStartPhaseB={handleStartPhaseB}
                onAddQuestionToHistory={addQuestionToHistory}
              />
            )}

            {state.phase === 'B' && (
              <PhaseBIntegrated
                state={state}
                onChoice={handlePhaseBChoice}
                onProceedToC={handleProceedToC}
                onAddUsedQuestion={addUsedQuestion}
                onAddQuestionToHistory={addQuestionToHistory}
                onRecordSIFAnswer={recordSIFAnswer} // DEPRECATED
                onRecordSIFAnswerWithEffects={recordSIFAnswerWithEffects} // NEW
                onSeveritySelect={handleSeveritySelect}
              />
            )}

            {state.phase === 'C' && (
            <PhaseC
              state={state}
              onChoice={handlePhaseCChoice}
              onSeveritySelect={handleSeveritySelect}
              onProceedToD={handleProceedToD}
              stepDone={stepDone}
              onAddUsedQuestion={addUsedQuestion}
              onAddQuestionToHistory={addQuestionToHistory}
              onRecordSIFAnswer={recordSIFAnswer} // DEPRECATED
              onRecordSIFAnswerWithEffects={recordSIFAnswerWithEffects} // NEW
              updateLine={updateLine}
              setFamilyVerdicts={setFamilyVerdicts}
            />
          )}

          {state.phase === 'D' && (
            <PhaseD
              state={state}
              onSIFCalculate={calculateSIF}
              onRecordAllSIFData={recordAllSIFData}
              onProceedToE={() => {
                setTargetPhase('E');
                setShouldShowLoading(true);
              }}
              onSetSIFShortlist={setSIFShortlist}
              onSetInstalledChoice={setInstalledChoice}
              sifEngine={sifEngine}
            />
          )}

          {state.phase === 'E' && (
            <PhaseE
              state={state}
              sifResult={state.sifResult}
              sifEngine={sifEngine}
              onAddQuestionToHistory={addQuestionToHistory}
              onProceedToArchetype={handleProceedToArchetype}
              onArchetypeSelect={setFinalArchetype}
              onAnchorSelect={handleAnchorSelect}
            />
          )}


          {state.phase === 'Celebration' && (
            <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-4">Done!</h2>
                <p className="text-xl text-gray-500 mb-2">Processing results...</p>
                <div className="animate-pulse text-gray-400 text-sm">This will just take a moment</div>
              </div>
            </div>
          )}

          {state.phase === 'FinalProcessing' && (
            <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-500 text-xl font-medium mb-4">
                  Processing final results
                </div>
              </div>
            </div>
          )}

          {state.phase === 'Summary' && (
            <SummaryClean
              state={state}
              onSIFCalculate={calculateSIF}
              onFinalizeSIFWithInstall={finalizeSIFWithInstall}
              onRestart={handleRestart}
              sifEngine={sifEngine}
            />
          )}
          
          </div>
        )}

        {/* Recording Data Display - TEMPORARILY HIDDEN */}
        {/* <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-bold mb-2">Quiz Recording Data</h3>
          <div className="text-sm text-gray-300">
            <div>Total Records: {quizRecorder.getRecords().length}</div>
            <div>Phase Breakdown: {JSON.stringify(quizRecorder.getSummary().phaseBreakdown)}</div>
            <div>Lines Involved: {quizRecorder.getSummary().linesInvolved.join(', ')}</div>
            <div>Severity Assessments: {quizRecorder.getSummary().severityAssessments}</div>
            <div>Verdicts Calculated: {quizRecorder.getSummary().verdictsCalculated}</div>
            {state.phase === 'D' && (
              <div className="text-green-400">
                Phase D Engine: {phaseDEngine.getVerdictCount()} verdicts computed
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              const data = quizRecorder.exportToJSON();
              console.log('Quiz Recording Data:', data);
              navigator.clipboard.writeText(data);
              alert('Recording data copied to clipboard and logged to console');
            }}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Export Recording Data
          </button>
        </div>

        <div className="mt-4 text-slate-400 text-sm">
          © Spec implementation for testing. No tracking; results held in-memory only.
        </div> */}
      </div>

      {/* Loading Screen */}
      {isLoading && loadingPhase && (
        <LoadingScreen
          phase={loadingPhase}
          onComplete={handleLoadingComplete}
          duration={10000}
        />
      )}
    </div>
  );
}