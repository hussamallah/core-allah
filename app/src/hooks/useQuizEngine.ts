import { useState, useCallback, useEffect } from 'react';
import { QuizState, QuizLine, LINES, SIFCounters, SIFResult, FACE_TO_FAMILY, FAMILY_TO_FACES } from '@/types/quiz';
import { SIFEngine } from '@/engine/SIFEngine';

const initialSIFCounters: SIFCounters = {
  famC: {},
  famO: {},
  famF: {},
  sevF: {},
  faceC: {},
  faceO: {},
  faceF: {}
};

const initialQuizState: QuizState = {
  phase: 'A',
  lines: LINES.map(id => ({
    id,
    selectedA: false,
    B: { picks: [], C_evidence: 0.0 },
    mod: { decisions: [] },
    verdict: undefined,
  })),
  anchor: null,
  usedQuestions: [],
  currentQuestionIndex: 0,
  questionHistory: [],
  archetypeAnswers: {},
  finalArchetype: null,
  sifCounters: initialSIFCounters,
  sifResult: null,
  familyVerdicts: {},
  sifShortlist: [],
  installedChoice: null
};

export function useQuizEngine() {
  const [state, setState] = useState<QuizState>(initialQuizState);
  const [sifEngine] = useState(() => new SIFEngine());

  // Clear corrupted localStorage on initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('quiz_engine_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Check if the state has corrupted A-line assignments
          if (parsed.selectedALines && parsed.selectedALines.length > 0) {
            console.log('🔍 Found saved state, checking for corruption...');
            // For now, clear any saved state to prevent corruption
            localStorage.removeItem('quiz_engine_state');
            console.log('🗑️ Cleared potentially corrupted saved state');
          }
        } catch (error) {
          console.log('🗑️ Cleared corrupted saved state');
          localStorage.removeItem('quiz_engine_state');
        }
      }
    }
  }, []);

  // Initialize SIF counters
  useEffect(() => {
    sifEngine.initializeCounters();
  }, [sifEngine, state.lines]);

  const byId = useCallback((id: string) => 
    state.lines.find(l => l.id === id), [state.lines]);

  const selectedA = useCallback(() => 
    state.lines.filter(l => l.selectedA), [state.lines]);

  const nonA = useCallback(() => 
    state.lines.filter(l => !l.selectedA), [state.lines]);

  const updateLine = useCallback((lineId: string, updates: Partial<QuizLine>) => {
    setState(prev => ({
      ...prev,
      lines: prev.lines.map(line => 
        line.id === lineId ? { ...line, ...updates } : line
      )
    }));
  }, []);

  const updatePhase = useCallback((phase: QuizState['phase']) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  const setAnchor = useCallback((anchor: string | null) => {
    setState(prev => ({ ...prev, anchor }));
  }, []);

  const resetQuiz = useCallback(() => {
    // Clear any corrupted localStorage data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz_engine_state');
      console.log('🗑️ Cleared corrupted localStorage data');
    }
    setState(initialQuizState);
    sifEngine.reset();
    sifEngine.clearILScores(); // Clear IL scores when starting new quiz
  }, [sifEngine]);

  const addUsedQuestion = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      usedQuestions: [...prev.usedQuestions, questionId]
    }));
  }, []);

  const removeUsedQuestion = useCallback((questionId: string) => {
    setState(prev => ({
      ...prev,
      usedQuestions: prev.usedQuestions.filter(id => id !== questionId)
    }));
  }, []);

  // NEW: Record SIF answer with proper effects
  const recordSIFAnswerWithEffects = useCallback((question: any, choice: 'A' | 'B' | 'C', family: string) => {
    sifEngine.recordAnswerWithEffects(question, choice, family);

    // Update state counters
    setState(prev => {
      const newCounters = sifEngine.getCounters();
      return { ...prev, sifCounters: newCounters };
    });
  }, [sifEngine]);

  // DEPRECATED: SIF-specific methods (kept for backward compatibility)
  const recordSIFAnswer = useCallback((phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => {
    console.warn('⚠️ Using deprecated recordSIFAnswer - use recordSIFAnswerWithEffects instead');
    if (phase === 'B') {
      sifEngine.recordPhaseBAnswer(family, questionType, choice);
    } else if (phase === 'C' && anchoredFace) {
      sifEngine.recordPhaseCAnswer(family, questionType, choice, anchoredFace);
    }

    // Update state counters
    setState(prev => {
      const newCounters = sifEngine.getCounters();
      return { ...prev, sifCounters: newCounters };
    });
  }, [sifEngine, state.lines]);

  const recordSIFSeverity = useCallback((family: string, severity: 'F0.5' | 'F1') => {
    // Record the severity probe in the SIFEngine first
    sifEngine.recordSeverityProbe(family, severity);

    // Update state to ensure the counters are properly synchronized
    setState(prev => {
      const newCounters = sifEngine.getCounters();
      return { 
        ...prev, 
        sifCounters: {
          ...newCounters,
          sevF: { ...newCounters.sevF }
        }
      };
    });
  }, [sifEngine]);


  const recordAllSIFData = useCallback((quizData: any, primaryFamily: string, primaryFace: string) => {
    sifEngine.recordAllSIFData(quizData, primaryFamily, primaryFace);
    
    // Force state update to ensure counters are properly synchronized
    setState(prev => {
      const newCounters = sifEngine.getCounters();
      console.log(`🔍 recordAllSIFData updating state:`, {
        prevSevF: prev.sifCounters.sevF,
        newSevF: newCounters.sevF,
        sevFChanged: JSON.stringify(prev.sifCounters.sevF) !== JSON.stringify(newCounters.sevF)
      });
      
      return { 
        ...prev, 
        sifCounters: {
          ...newCounters,
          sevF: { ...newCounters.sevF } // Ensure sevF is properly copied
        }
      };
    });
  }, [sifEngine]);

  const setFamilyVerdicts = useCallback((verdicts: Array<{ family: string; type: 'F'; severity?: number }>) => {
    setState(prev => {
      const next: Record<string, { type: 'F'; severity?: number }> = {};
      for (const v of verdicts) {
        next[v.family] = { type: 'F', severity: v.severity };
      }
      return { ...prev, familyVerdicts: next };
    });
  }, []);

  const setSIFShortlist = useCallback((shortlist: string[]) => {
    setState(prev => ({ ...prev, sifShortlist: shortlist }));
  }, []);

  const setInstalledChoice = useCallback((choice: string) => {
    setState(prev => ({ ...prev, installedChoice: choice }));
  }, []);

  const finalizeSIFWithInstall = useCallback((primaryFamily: string, primaryFace: string) => {
    console.log("SIF FINAL RESULT (CANON V3): Starting finalization", { primaryFamily, primaryFace });
    
    // Build allFacesByIL from the shortlist (ordered by IL score)
    const allFacesByIL = state.sifShortlist || [];
    console.log("🔍 allFacesByIL from shortlist:", allFacesByIL);
    
    const sifResult = sifEngine.finalizeSIFWithInstall(state, primaryFace, allFacesByIL);
    
    setState(prev => ({ ...prev, sifResult }));
    return sifResult;
  }, [sifEngine, state]);

  const calculateSIF = useCallback((primaryFamily: string, primaryFace: string, prizeFace?: string) => {
    // Convert stored family verdicts to the format expected by SIFEngine
    const familyVerdicts: Record<string, "C" | "O" | "F"> = {};
    
    // Use stored family verdicts if available, otherwise derive from line verdicts
    if (Object.keys(state.familyVerdicts ?? {}).length > 0) {
      // Convert from { family: { type: 'F', severity?: number } } to { family: 'F' }
      Object.entries(state.familyVerdicts).forEach(([family, verdict]) => {
        familyVerdicts[family] = verdict.type;
      });
    } else {
      // Fallback: derive from line verdicts
      state.lines.forEach(line => {
        if (line.verdict) {
          familyVerdicts[line.id] = line.verdict as "C" | "O" | "F";
        }
      });
    }
    
    console.log("🎯 SIF Calculation - Family Verdicts:", familyVerdicts);
    console.log("🎯 SIF Calculation - Stored familyVerdicts:", state.familyVerdicts);
    console.log("🎯 SIF Calculation - All line verdicts:", state.lines.map(l => ({ id: l.id, verdict: l.verdict })));
    
    // If no verdicts found, log a warning
    if (Object.keys(familyVerdicts).length === 0) {
      console.warn("⚠️ No family verdicts found - SIF calculation will treat all families as non-F");
      console.warn("⚠️ This means all families will be considered eligible for secondary selection");
    }
    
    const sifResult = sifEngine.calculateSIF(primaryFamily, primaryFace, familyVerdicts, prizeFace);
    
    setState(prev => ({ ...prev, sifResult }));
    return sifResult;
  }, [sifEngine, state.familyVerdicts, state.lines]);

  const goBack = useCallback(() => {
    setState(prev => {
      // If no question history, can't go back
      if (prev.questionHistory.length === 0) {
        return prev;
      }

      // Get the last question from history
      const lastQuestion = prev.questionHistory[prev.questionHistory.length - 1];
      const newHistory = prev.questionHistory.slice(0, -1);
      
      // Remove the question from used questions
      const newUsedQuestions = prev.usedQuestions.filter(id => id !== lastQuestion.questionId);
      
      // Revert the choice based on the question type
      const updatedLines = prev.lines.map(line => {
        if (line.id !== lastQuestion.lineId) return line;
        
        switch (lastQuestion.phase) {
          case 'A':
            return { ...line, selectedA: false };
          case 'B':
            const newPicks = line.B.picks.slice(0, -1);
            const newC_evidence = line.B.C_evidence - (lastQuestion.choice === "C" ? 1.0 : 0);
            return {
              ...line,
              B: {
                picks: newPicks,
                C_evidence: newC_evidence
              }
            };
          case 'C':
            const newDecisions = line.mod.decisions.slice(0, -1);
            return { ...line, mod: { decisions: newDecisions } };
          case 'D':
            if (lastQuestion.questionId.includes('severity')) {
              return { ...line };
            } else {
              // This is a final probe question
              const newDecisions = line.mod.decisions.slice(0, -1);
              return { ...line, mod: { decisions: newDecisions } };
            }
          default:
            return line;
        }
      });

      // Determine if we need to change phase
      let newPhase = prev.phase;
      if (lastQuestion.phase !== prev.phase) {
        newPhase = lastQuestion.phase;
      }

      return {
        ...prev,
        phase: newPhase,
        lines: updatedLines,
        usedQuestions: newUsedQuestions,
        currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
        questionHistory: newHistory
      };
    });
  }, []);

  const addQuestionToHistory = useCallback((phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => {
    setState(prev => ({
      ...prev,
      questionHistory: [
        ...prev.questionHistory,
        {
          phase,
          lineId,
          questionId,
          choice,
          timestamp: Date.now()
        }
      ],
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
  }, []);

  // Verdict calculation utility
  const verdictFrom = useCallback((decisions: { type: string; pick: string }[]) => {
    const d = Object.fromEntries(decisions.map(x => [x.type, x.pick]));
    const key = `${d["CO1"]}${d["CO2"]}${d["CF"]}`;
    const table: Record<string, string> = {
      "CCC": "C", "CCF": "O", "COC": "O", "COF": "F", 
      "OCC": "O", "OCF": "F", "OOC": "O", "OOF": "F"
    };
    return table[key] || "O";
  }, []);

  // A-lines should NOT have module decisions - they use Phase B picks only
  // Only non-A-lines (module lines) will have module decisions from Phase C

  const addArchetypeAnswer = useCallback((questionId: string, choice: string) => {
    setState(prev => ({
      ...prev,
      archetypeAnswers: {
        ...prev.archetypeAnswers,
        [questionId]: choice
      }
    }));
  }, []);

  const setFinalArchetype = useCallback((archetype: string) => {
    setState(prev => ({ ...prev, finalArchetype: archetype }));
  }, []);

  return {
    state,
    byId,
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
    sifEngine,
    // Enhanced context methods
    getEnhancedReport: () => sifEngine.getEnhancedReport(),
    getOriginInsights: (face: string) => sifEngine.getOriginInsights(face)
  };
}
