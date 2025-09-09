import React, { useEffect, useState } from 'react';
import { QuizState } from '@/types/quiz';
import { phaseEEngine, LineResult } from '@/engine/PhaseE';
import { getArchetypeQuestionsForFamily, getArchetypesForFamily } from '@/data/questions';
import { quizRecorder } from '@/utils/QuizRecorder';

type Family = 'Control' | 'Pace' | 'Boundary' | 'Truth' | 'Recognition' | 'Bonding' | 'Stress';

interface PhaseEProps {
  state: QuizState;
  sifResult?: any;
  sifEngine?: any;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onProceedToArchetype?: (payload: {
    selectedLine: Family;
    anchorSource: "E:Purity" | "E:TieBreak" | "E:SelfInstalled";
  }) => void;
  onArchetypeSelect?: (archetype: string) => void;
  onAnchorSelect?: (anchor: string) => void;
}

type PhaseEStatus = 'IDLE' | 'PROCESSING' | 'COMMITTED';

export function PhaseE({ state, sifResult, sifEngine, onAddQuestionToHistory, onProceedToArchetype, onArchetypeSelect, onAnchorSelect }: PhaseEProps) {
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
      console.log('🎯 PHASE E - SIF Result:', sifResult);
      console.log('🎯 PHASE E - SIF Engine:', sifEngine);
      
      const newState = phaseEEngine.enterPhaseE(lineResults, sifResult, sifEngine);
      setPhaseEState(newState);
      setHasEntered(true);

      console.log('🎯 PHASE E - Phase E State:', newState);

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
  }, [hasEntered, lineResults, sifResult, sifEngine, onAnchorSelect, status]);

  // Handle tie-break selection with improved mobile touch handling
  const handleTieBreakSelection = (selectedLine: string, event?: React.MouseEvent | React.TouchEvent) => {
    // Prevent double-tap and rapid clicking on mobile
    if (status !== 'IDLE') {
      console.warn("[PhaseE] Already committed, ignoring selection");
      return;
    }

    // Prevent event bubbling and default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('🎯 PHASE E - Tie-break selection:', selectedLine);
    setStatus('PROCESSING');
    
    // Add visual feedback immediately
    const targetElement = event?.currentTarget as HTMLElement;
    if (targetElement) {
      targetElement.style.transform = 'scale(0.95)';
      targetElement.style.transition = 'transform 0.1s ease-out';
      setTimeout(() => {
        targetElement.style.transform = 'scale(1)';
      }, 100);
    }
    
    phaseEEngine.selectAnchor(selectedLine);
    const newState = phaseEEngine.getState();
    setPhaseEState(newState);
    
    // Determine source type
    const isPurityCandidate = phaseEState.purityCandidates.includes(selectedLine);
    const isSelfInstalledCandidate = phaseEState.selfInstalledCandidates.includes(selectedLine);
    
    let anchorSource: "E:Purity" | "E:TieBreak" | "E:SelfInstalled" = "E:TieBreak";
    if (isPurityCandidate) {
      anchorSource = "E:Purity";
    } else if (isSelfInstalledCandidate) {
      anchorSource = "E:SelfInstalled";
    }
    
    // Update global anchor state immediately for progress bar
    if (onAnchorSelect) {
      onAnchorSelect(selectedLine);
    }
    
    // Record in question history
    onAddQuestionToHistory('E', selectedLine, 'tie-break-question', 'selected');
    
    // Show archetype selection with a slight delay for better UX
    setTimeout(() => {
      setStatus('COMMITTED');
      setShowArchetypeSelection(true);
    }, 200);

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
              className="card-interactive p-6 touch-target touch-safe"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-gold-400 text-brand-gray-950 rounded-full flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div className="flex-1">
                  <div className="text-brand-gray-100 text-xl font-bold mb-2">
                    {currentQuestion.options.A}
                  </div>
                  <div className="text-brand-gold-400 text-lg font-semibold">
                    → {currentQuestion.map.A}
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => handleArchetypeChoice('B')}
              className="card-interactive p-6 touch-target touch-safe"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-gold-400 text-brand-gray-950 rounded-full flex items-center justify-center font-bold text-lg">
                  B
                </div>
                <div className="flex-1">
                  <div className="text-brand-gray-100 text-xl font-bold mb-2">
                    {currentQuestion.options.B}
                  </div>
                  <div className="text-brand-gold-400 text-lg font-semibold">
                    → {currentQuestion.map.B}
                  </div>
                </div>
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
        
        {/* Purity Candidates Section */}
        {phaseEState.purityCandidates.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-sm font-bold mr-3">EVIDENCE</span>
              Purity-Based Candidates
            </h3>
            <div className="space-y-4">
              {phaseEState.purityCandidates.map(line => (
                <button
                  key={line}
                  onClick={(e) => handleTieBreakSelection(line, e)}
                  onTouchEnd={(e) => handleTieBreakSelection(line, e)}
                  disabled={status !== 'IDLE'}
                  className={`w-full p-6 border rounded-xl transition-all duration-300 text-left touch-target touch-safe ${
                    status === 'IDLE' 
                      ? 'card-interactive border-brand-gold-400 hover:border-brand-gold-300 hover:shadow-glow' 
                      : 'bg-brand-gray-900 border-brand-gray-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-brand-gray-100 text-xl mb-2">{line}</div>
                      <div className="text-brand-gold-400 text-sm font-bold uppercase tracking-wider">
                        {line === 'Control' && 'I SET THE CALL. AUTHORITY.'}
                        {line === 'Pace' && 'I SET THE TEMPO. DIRECTION.'}
                        {line === 'Boundary' && 'I HOLD THE LINE. GATEKEEPER.'}
                        {line === 'Truth' && 'I NAME REALITY. CLARITY.'}
                        {line === 'Recognition' && 'I MAKE IT SEEN. SPOTLIGHT.'}
                        {line === 'Bonding' && 'I KEEP PEOPLE STEADY. SUPPORT.'}
                        {line === 'Stress' && 'I TURN PRESSURE INTO MOTION. RESPONSE.'}
                      </div>
                    </div>
                    <div className="text-brand-gold-400 text-sm font-semibold">Evidence-Based</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Self-Installed Candidates Section */}
        {phaseEState.selfInstalledCandidates.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
              <span className="bg-blue-400 text-gray-900 px-2 py-1 rounded text-sm font-bold mr-3">PREFERENCE</span>
              Self-Installed Candidates
            </h3>
            <div className="space-y-4">
              {phaseEState.selfInstalledCandidates.map(line => (
                <button
                  key={line}
                  onClick={(e) => handleTieBreakSelection(line, e)}
                  onTouchEnd={(e) => handleTieBreakSelection(line, e)}
                  disabled={status !== 'IDLE'}
                  className={`w-full p-6 border rounded-xl transition-all duration-300 text-left touch-target touch-safe ${
                    status === 'IDLE' 
                      ? 'card-interactive border-brand-accent-blue hover:border-brand-accent-blue/80 hover:shadow-lg hover:shadow-brand-accent-blue/20' 
                      : 'bg-brand-gray-900 border-brand-gray-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-brand-gray-100 text-xl mb-2">{line}</div>
                      <div className="text-brand-accent-blue text-sm font-bold uppercase tracking-wider">
                        {line === 'Control' && 'I SET THE CALL. AUTHORITY.'}
                        {line === 'Pace' && 'I SET THE TEMPO. DIRECTION.'}
                        {line === 'Boundary' && 'I HOLD THE LINE. GATEKEEPER.'}
                        {line === 'Truth' && 'I NAME REALITY. CLARITY.'}
                        {line === 'Recognition' && 'I MAKE IT SEEN. SPOTLIGHT.'}
                        {line === 'Bonding' && 'I KEEP PEOPLE STEADY. SUPPORT.'}
                        {line === 'Stress' && 'I TURN PRESSURE INTO MOTION. RESPONSE.'}
                      </div>
                    </div>
                    <div className="text-brand-accent-blue text-sm font-semibold">Your Preference</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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