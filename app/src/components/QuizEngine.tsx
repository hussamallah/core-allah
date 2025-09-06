import React, { useState, useCallback } from 'react';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { PhaseA } from './quiz/PhaseA';
import { PhaseB } from './quiz/PhaseB';
import { PhaseC } from './quiz/PhaseC';
import { PhaseE } from './quiz/PhaseE';
import PhaseD from './quiz/PhaseD';
import { Summary } from './quiz/Summary';
import { quizRecorder } from '@/utils/QuizRecorder';
import { ProgressBar } from './ProgressBar';
import { phaseDEngine } from '@/engine/PhaseD';
import { FACE_ANCHOR } from '@/types/quiz';

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
    recordSIFAnswer,
    recordSIFSeverity,
    recordAllSIFData,
    calculateSIF,
    setFamilyVerdicts,
    // SIF v3 methods
    setSIFShortlist,
    setInstalledChoice,
    finalizeSIFWithInstall
  } = useQuizEngine();

  
  // Calculate accurate progress based on current phase and completed steps
  const getProgress = useCallback(() => {
    const selectedALines = selectedA();
    const nonALines = nonA();
    
    let completed = 0;
    let total = 0;
    
    switch (state.phase) {
      case 'A':
        // Phase A: 7 family cards to select
        completed = selectedALines.length;
        total = 7;
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
        
        
      case 'E':
        // Phase E: Final calculations
        completed = 1;
        total = 1;
        break;
        
      case 'Archetype':
        // Archetype: Questions to determine specific archetype within family
        const archetypeQuestions = state.anchor ? 
          (() => {
            const { getArchetypeQuestionsForFamily } = require('@/data/questions');
            return getArchetypeQuestionsForFamily(state.anchor);
          })() : [];
        completed = Object.keys(state.archetypeAnswers).length;
        total = archetypeQuestions.length;
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
  }, [state.phase, selectedA, nonA]);

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
    console.log('🚀 Starting Phase B with A-lines:', selectedA().map(l => l.id));
    selectedA().forEach(line => {
      updateLine(line.id, {
        B: { picks: [], C_evidence: 0.6 }
      });
    });
    updatePhase('B');
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
    recordSIFSeverity(lineId, severity === 'high' ? 'F1' : severity === 'mid' ? 'F0.5' : 'F0');
    stepDone();
  };

  const handleProceedToC = () => {
    // Preseed A-line decisions based on Phase B picks
    selectedA().forEach(line => {
      if (line.mod.decisions.length) return;
      const p1 = line.B.picks[0];
      const p2 = line.B.picks[1];
      if (!p1 || !p2) return;

      const decisions: Array<{ type: 'CO1' | 'CO2' | 'CF'; pick: 'C' | 'O' | 'F' }> = [];
      // CO1 = B1 (convert F to O)
      decisions.push({ type: "CO1", pick: p1 === "F" ? "O" : p1 as 'C' | 'O' | 'F' });
      
      if (p1 === "C") {
        // CO2 = B2; CF = C (computed)
        decisions.push({ type: "CO2", pick: p2 === "F" ? "O" : p2 as 'C' | 'O' | 'F' });
        decisions.push({ type: "CF", pick: "C" });
      } else { // p1 === 'O'
        // CF = B2; CO2 = O (computed)
        decisions.push({ type: "CF", pick: p2 === "O" ? "F" : p2 as 'C' | 'O' | 'F' });
        decisions.push({ type: "CO2", pick: "O" });
      }

      updateLine(line.id, { mod: { decisions } });
    });
    
    // Determine primary family (anchor) before Phase C
    const selectedALines = state.lines.filter(l => l.selectedA);
    const nonALines = state.lines.filter(l => !l.selectedA);
    
    // Calculate face purity for A-lines
    const facePurity: Record<string, number> = {};
    selectedALines.forEach(l => facePurity[l.id] = l.B.C_evidence);
    
    // Calculate module purity for non-A lines (use existing decisions if any)
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

    // Don't set anchor here - let Phase E handle tie-breaking
    // The anchor will be determined after Phase D completes
    
    updatePhase('C');
  };

  const handleProceedToD = useCallback(() => {
    console.log('📈 Proceeding to Phase D');
    updatePhase('D');
  }, [updatePhase]);

  const handleProceedToE = () => {
    console.log('📈 Proceeding to Phase E');
    
    // Show celebration screen first
    updatePhase('Celebration');
    
    // After celebration, proceed to calculations
    setTimeout(() => {
      // Calculate anchor immediately after Phase D completes
      const anchor = calculateAnchor();
      if (anchor) {
        console.log('🎯 Auto-calculated anchor:', anchor);
        setAnchor(anchor);
        updatePhase('Archetype'); // Go to Archetype phase to determine specific archetype
      } else {
        console.log('🎯 Need tie-breaker, going to Phase E');
        updatePhase('E'); // Need tie-breaker
      }
    }, 2000); // 2 second celebration
  };


  const handleAnchorSelect = (primaryFace: string) => {
    console.log('🎯 Primary face selected:', primaryFace);
    
    // Extract family and face from primary face (e.g., "Control:Rebel" -> "Control", "Rebel")
    const [primaryFamily, primaryFaceName] = primaryFace.split(':');
    
    // Record SIF data now that primary is finalized
    console.log('🎯 Recording SIF data with finalized primary:', { primaryFamily, primaryFace });
    recordAllSIFData(state, primaryFamily, primaryFace);
    
    setAnchor(primaryFamily); // Store family for display
    setFinalArchetype(primaryFaceName); // Set the selected face as final archetype
    updatePhase('Summary'); // Go directly to Summary phase
  };

  const handleProceedToArchetype = ({ selectedLine, anchorSource }: {
    selectedLine: string;
    anchorSource: "E:Purity" | "E:TieBreak";
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
    
    updatePhase('Summary');
  };



  const handleRestart = () => {
    resetQuiz();
  };

  const handleSIFCalculate = useCallback((primaryFamily: string, primaryFace: string, prizeFace: string) => {
    return calculateSIF(primaryFamily, primaryFace, prizeFace);
  }, [calculateSIF]);

  return (
    <div className="bg-black text-gray-200 font-sans relative min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 bg-gray-900 rounded-xl">
        
        {(() => {
          const { completed, total } = getProgress();
          const getStepInfo = () => {
            switch (state.phase) {
              case 'A': return { step: 1, title: 'Choose your focus', description: 'Select 3 families that resonate with you' };
              case 'B': return { step: 2, title: 'Quick choices', description: `${completed}/${total} dilemmas completed` };
              case 'C': return { step: 3, title: 'Situations', description: `${completed}/${total} scenarios completed` };
              case 'D': return { step: 4, title: 'Final decisions', description: `${completed}/${total} assessments completed` };
              case 'E': return { step: 5, title: 'Your profile', description: 'Processing your results...' };
              case 'Archetype': return { step: 5, title: 'Your profile', description: 'Determining your specific archetype...' };
              case 'Summary': return { step: 6, title: 'Complete', description: 'Your 7-minute profile is ready!' };
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


        {/* Phase Content */}
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
            <PhaseB
              state={state}
              onChoice={handlePhaseBChoice}
              onProceedToC={handleProceedToC}
              onAddUsedQuestion={addUsedQuestion}
              onAddQuestionToHistory={addQuestionToHistory}
              onRecordSIFAnswer={recordSIFAnswer}
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
              onRecordSIFAnswer={recordSIFAnswer}
              updateLine={updateLine}
              setFamilyVerdicts={setFamilyVerdicts}
            />
          )}

          {state.phase === 'D' && (
            <PhaseD
              state={state}
              onSIFCalculate={calculateSIF}
              onRecordAllSIFData={recordAllSIFData}
              onProceedToE={() => updatePhase('E')}
              onSetSIFShortlist={setSIFShortlist}
              onSetInstalledChoice={setInstalledChoice}
            />
          )}

          {state.phase === 'E' && (
            <PhaseE
              state={state}
              onAddQuestionToHistory={addQuestionToHistory}
              onProceedToArchetype={handleProceedToArchetype}
              onArchetypeSelect={setFinalArchetype}
            />
          )}


          {state.phase === 'Celebration' && (
            <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-4">Done!</h2>
                <p className="text-xl text-gray-300 mb-2">Processing your 7-minute profile...</p>
                <div className="animate-pulse text-gray-400 text-sm">This will just take a moment</div>
              </div>
            </div>
          )}

          {state.phase === 'Summary' && (
            <Summary
              state={state}
              onSIFCalculate={calculateSIF}
              onFinalizeSIFWithInstall={finalizeSIFWithInstall}
              onRestart={handleRestart}
            />
          )}
          
        </div>

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
    </div>
  );
}