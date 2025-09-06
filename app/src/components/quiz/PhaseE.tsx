import React, { useEffect, useState } from 'react';
import { QuizState } from '@/types/quiz';
import { phaseEEngine, LineResult } from '@/engine/PhaseE';
import { getArchetypeQuestionsForFamily, getArchetypesForFamily } from '@/data/questions';
import { quizRecorder } from '@/utils/QuizRecorder';

type Family = 'Control' | 'Pace' | 'Boundary' | 'Truth' | 'Recognition' | 'Bonding' | 'Stress';

interface PhaseEProps {
  state: QuizState;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onProceedToArchetype?: (payload: {
    selectedLine: Family;
    anchorSource: "E:Purity" | "E:TieBreak";
  }) => void;
  onArchetypeSelect?: (archetype: string) => void;
  onAnchorSelect?: (anchor: string) => void;
}

type PhaseEStatus = 'IDLE' | 'PROCESSING' | 'COMMITTED';

export function PhaseE({ state, onAddQuestionToHistory, onProceedToArchetype, onArchetypeSelect, onAnchorSelect }: PhaseEProps) {
  const [phaseEState, setPhaseEState] = useState(phaseEEngine.getState());
  const [hasEntered, setHasEntered] = useState(false);
  const [status, setStatus] = useState<PhaseEStatus>('IDLE');
  const [showArchetypeSelection, setShowArchetypeSelection] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [archetypeAnswers, setArchetypeAnswers] = useState<Record<string, 'A' | 'B'>>({});

  // Safe default with noop guard to prevent type errors during HMR
  const proceed = onProceedToArchetype ?? (() => {
    console.warn("[PhaseE] onProceedToArchetype missing; no-op");
  });

  // Calculate purity for all lines
  const calculatePurity = (line: any) => {
    if (line.selectedA) {
      // A-lines: use face purity (C_evidence from Phase B)
      return line.B.C_evidence;
    } else {
      // Non-A lines: use canonical purity formula
      // purity = 1.0*(CO=C) + 1.6*(CF=C) - 1.0*(CO=O) - 1.6*(CF=F)
      const decisions = line.mod.decisions;
      let purity = 0;
      
      decisions.forEach((decision: any) => {
        if (decision.type === 'CO1' || decision.type === 'CO2') {
          if (decision.pick === 'C') purity += 1.0;
          else if (decision.pick === 'O') purity -= 1.0;
        } else if (decision.type === 'CF') {
          if (decision.pick === 'C') purity += 1.6;
          else if (decision.pick === 'F') purity -= 1.6;
        }
      });
      
      return purity;
    }
  };

  // Convert lines to LineResult format
  const lineResults: LineResult[] = state.lines.map(line => ({
    line: line.id,
    isALine: line.selectedA,
    facePurity: line.selectedA ? line.B.C_evidence : 0,
    modulePurity: line.selectedA ? 0 : calculatePurity(line)
  }));

  // Enter Phase E once
  useEffect(() => {
    if (!hasEntered) {
      console.log('🎯 PHASE E - Entering Phase E');
      const newState = phaseEEngine.enterPhaseE(lineResults);
      setPhaseEState(newState);
      setHasEntered(true);

      // Auto-select if single candidate - show archetype selection
      if (newState.anchor && status === 'IDLE') {
        console.log('🎯 PHASE E - Auto-selecting anchor:', newState.anchor);
        
        // Update global anchor state immediately for progress bar
        if (onAnchorSelect) {
          onAnchorSelect(newState.anchor);
        }
        
        setStatus('COMMITTED');
        setShowArchetypeSelection(true);
      }
    }
  }, [hasEntered, lineResults, proceed, status]);

  // Handle tie-break selection
  const handleTieBreakSelection = (selectedLine: string) => {
    if (status !== 'IDLE') {
      console.warn("[PhaseE] Already committed, ignoring selection");
      return;
    }

    console.log('🎯 PHASE E - Tie-break selection:', selectedLine);
    setStatus('PROCESSING');
    
    phaseEEngine.selectAnchor(selectedLine);
    const newState = phaseEEngine.getState();
    setPhaseEState(newState);
    
    // Update global anchor state immediately for progress bar
    if (onAnchorSelect) {
      onAnchorSelect(selectedLine);
    }
    
    // Record in question history
    onAddQuestionToHistory('E', selectedLine, 'tie-break-question', 'selected');
    
    // Show archetype selection
    setStatus('COMMITTED');
    setShowArchetypeSelection(true);

    // Debug helper for development
    if (typeof window !== 'undefined') {
      (window as any).__lastPhaseE = { 
        candidates: phaseEState.candidates, 
        selectedLine, 
        at: Date.now() 
      };
    }
  };

  // Prize role mapping
  const PRIZE_ROLES: Record<string, string> = {
    'Control': 'Authority',
    'Pace': 'Timekeeper', 
    'Boundary': 'Gatekeeper',
    'Truth': 'Decider',
    'Recognition': 'Witness',
    'Bonding': 'Anchor',
    'Stress': 'Igniter'
  };

  // Archetype selection logic with best-of-3 system
  const handleArchetypeChoice = (choice: 'A' | 'B') => {
    if (!phaseEState.anchor) return;
    
    const archetypeQuestions = getArchetypeQuestionsForFamily(phaseEState.anchor);
    const currentQuestion = archetypeQuestions[currentQuestionIndex];
    const archetype = currentQuestion.map[choice];
    
    console.log('🎯 PHASE E - Archetype choice:', {
      question: currentQuestion.prompt,
      choice,
      archetype
    });
    
    // Store answer
    const newAnswers = { ...archetypeAnswers, [currentQuestion.id]: choice };
    setArchetypeAnswers(newAnswers);
    
    // Add to question history
    onAddQuestionToHistory('E', phaseEState.anchor, currentQuestion.id, choice);
    
    // Record the choice to QuizRecorder
    quizRecorder.recordQuestionAnswer('E', phaseEState.anchor, currentQuestion.id, choice, {
      archetype: currentQuestion.map[choice],
      questionIndex: currentQuestionIndex
    });
    
    // Count current archetype selections to check for early win
    const archetypes = getArchetypesForFamily(phaseEState.anchor);
    const archetypeCounts = archetypes.reduce((acc, archetype) => {
      acc[archetype] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Count archetype selections
    Object.entries(newAnswers).forEach(([questionId, choice]) => {
      const question = archetypeQuestions.find(q => q.id === questionId);
      if (question) {
        const archetype = question.map[choice];
        archetypeCounts[archetype]++;
      }
    });
    
    // Check for early win (2 wins for any archetype)
    const maxWins = Math.max(...Object.values(archetypeCounts));
    const totalQuestionsAnswered = Object.keys(newAnswers).length;
    
    if (maxWins >= 2) {
      // Early win! Determine final archetype
      const finalArchetype = Object.entries(archetypeCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      console.log('🎯 PHASE E - Early win! Final archetype determined:', finalArchetype);
      
      // Call the archetype select callback
      if (onArchetypeSelect) {
        onArchetypeSelect(finalArchetype);
      }
      
      // Proceed to Summary
      proceed({ 
        selectedLine: phaseEState.anchor as Family, 
        anchorSource: "E:Purity" 
      });
    } else if (totalQuestionsAnswered < archetypeQuestions.length) {
      // No early win yet, move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, determine final archetype (tiebreaker scenario)
      const finalArchetype = Object.entries(archetypeCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      console.log('🎯 PHASE E - Final archetype determined after all questions:', finalArchetype);
      
      // Call the archetype select callback
      if (onArchetypeSelect) {
        onArchetypeSelect(finalArchetype);
      }
      
      // Proceed to Summary
      proceed({ 
        selectedLine: phaseEState.anchor as Family, 
        anchorSource: "E:Purity" 
      });
    }
  };

  // Show archetype selection if anchor is selected
  if (phaseEState.anchor && showArchetypeSelection) {
    const archetypeQuestions = getArchetypeQuestionsForFamily(phaseEState.anchor);
    const archetypes = getArchetypesForFamily(phaseEState.anchor);
    const currentQuestion = archetypeQuestions[currentQuestionIndex];
    
    if (!currentQuestion) {
      return (
        <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl">No archetype questions found for {phaseEState.anchor}.</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-center mb-8">
          <div className="text-gray-200 text-lg mb-6">Family: {phaseEState.anchor}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600 mb-8">
          <p className="text-white mb-6 text-2xl leading-relaxed font-bold">
            {currentQuestion.prompt}
          </p>
          
          <div className="space-y-4">
            <div 
              onClick={() => handleArchetypeChoice('A')}
              className="text-white p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">A:</strong> 
              <span className="text-xl font-bold ml-2">{currentQuestion.options.A}</span>
              <div className="text-lg text-yellow-400 mt-1">
                → {currentQuestion.map.A}
              </div>
            </div>
            
            <div 
              onClick={() => handleArchetypeChoice('B')}
              className="text-white p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">B:</strong> 
              <span className="text-xl font-bold ml-2">{currentQuestion.options.B}</span>
              <div className="text-lg text-yellow-400 mt-1">
                → {currentQuestion.map.B}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-400 text-sm">
            Question {currentQuestionIndex + 1} of {archetypeQuestions.length}
          </div>
        </div>
      </div>
    );
  }

  // If anchor already selected but not showing archetype selection, show loading
  if (phaseEState.anchor && !showArchetypeSelection) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-bold mb-4">PRIMARY SELECTED: {phaseEState.anchor}</div>
          <div className="text-red-500 text-lg mb-6">PROCESSING...</div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show tie-break question if needed
  if (phaseEEngine.needsTieBreak()) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <p className="text-ivory text-xl mb-8 font-medium">
          When it actually lands on you, which line do you trust to carry your week?
        </p>
        
        <div className="space-y-4">
          {phaseEState.candidates.map(line => (
            <button
              key={line}
              onClick={() => handleTieBreakSelection(line)}
              disabled={status !== 'IDLE'}
              className={`w-full p-6 border rounded-lg transition-all duration-300 text-left ${
                status === 'IDLE' 
                  ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/10' 
                  : 'bg-gray-900 border-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-ivory text-xl mb-2">{line}</div>
                  <div className="text-yellow-400 text-sm font-bold uppercase tracking-wider">
                    {line === 'Control' && 'I SET THE CALL. AUTHORITY.'}
                    {line === 'Pace' && 'I SET THE TEMPO. DIRECTION.'}
                    {line === 'Boundary' && 'I HOLD THE LINE. GATEKEEPER.'}
                    {line === 'Truth' && 'I NAME REALITY. CLARITY.'}
                    {line === 'Recognition' && 'I MAKE IT SEEN. SPOTLIGHT.'}
                    {line === 'Bonding' && 'I KEEP PEOPLE STEADY. SUPPORT.'}
                    {line === 'Stress' && 'I TURN PRESSURE INTO MOTION. RESPONSE.'}
                  </div>
                </div>
                <div className="text-yellow-400 text-sm font-semibold">Lock Anchor</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Fallback: should not reach here
  return (
    <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-2xl font-bold mb-4">PROCESSING...</div>
        <div className="text-gray-200 text-lg">DETERMINING ANCHOR SELECTION</div>
      </div>
    </div>
  );
}