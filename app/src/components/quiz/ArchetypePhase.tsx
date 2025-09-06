import React, { useState, useMemo } from 'react';
import { QuizState } from '@/types/quiz';
import { getArchetypeQuestionsForFamily, getArchetypesForFamily } from '@/data/questions';
import { quizRecorder } from '@/utils/QuizRecorder';

interface ArchetypePhaseProps {
  state: QuizState;
  onArchetypeSelect: (archetype: string) => void;
  onAddQuestionToHistory: (phase: 'Archetype', lineId: string, questionId: string, choice: string) => void;
}

export function ArchetypePhase({ state, onArchetypeSelect, onAddQuestionToHistory }: ArchetypePhaseProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Log SIF state at start of Archetype Phase
  React.useEffect(() => {
    console.log('🎯 ARCHETYPE PHASE - SIF State:', {
      sifCounters: state.sifCounters,
      sifResult: state.sifResult,
      anchor: state.anchor,
      finalArchetype: state.finalArchetype
    });
  }, [state.sifCounters, state.sifResult, state.anchor, state.finalArchetype]);
  
  if (!state.anchor) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-red-400 text-xl">No anchor line found. Cannot proceed to archetype phase.</div>
      </div>
    );
  }

  const archetypeQuestions = getArchetypeQuestionsForFamily(state.anchor);
  const archetypes = getArchetypesForFamily(state.anchor);
  
  if (archetypeQuestions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-red-400 text-xl">No archetype questions found for {state.anchor}.</div>
      </div>
    );
  }

  const currentQuestion = archetypeQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === archetypeQuestions.length - 1;

  const handleChoice = (choice: 'A' | 'B') => {
    const archetype = currentQuestion.map[choice];
    
    // Add to question history
    if (state.anchor) {
      onAddQuestionToHistory('Archetype', state.anchor, currentQuestion.id, choice);
      
      // Record the choice to QuizRecorder
      quizRecorder.recordQuestionAnswer('Archetype', state.anchor, currentQuestion.id, choice, {
        archetype: currentQuestion.map[choice],
        questionIndex: currentQuestionIndex
      });
    }
    
    // Update archetype answers
    const newAnswers = { ...state.archetypeAnswers, [currentQuestion.id]: choice };
    
    if (isLastQuestion) {
      // Calculate final archetype based on all answers
      const archetypeCounts = archetypes.reduce((acc, archetype) => {
        acc[archetype] = 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Count archetype selections
      Object.entries(newAnswers).forEach(([questionId, choice]) => {
        const question = archetypeQuestions.find(q => q.id === questionId);
        if (question) {
          const archetype = question.map[choice as 'A' | 'B'];
          archetypeCounts[archetype]++;
        }
      });
      
      // Find the archetype with most selections
      const finalArchetype = Object.entries(archetypeCounts)
        .sort(([,a], [,b]) => b - a)[0][0];
      
      onArchetypeSelect(finalArchetype);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
      
      
      <div className="mb-6">
        <div className="text-yellow-400 text-sm mb-2">Choose between:</div>
        <div className="flex gap-4 text-white">
          {archetypes.map(archetype => (
            <span key={archetype} className="px-3 py-1 bg-gray-700 rounded-lg border border-gray-600">
              {archetype}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600 mb-8">
        <p className="text-ivory mb-6 text-2xl leading-relaxed font-bold">
          {currentQuestion.prompt}
        </p>
        
        <div className="space-y-4">
          <div 
            onClick={() => handleChoice('A')}
            className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <strong className="text-yellow-400 text-xl">A:</strong> 
            <span className="text-xl font-bold ml-2">{currentQuestion.options.A}</span>
            <div className="text-sm text-gray-400 mt-1">
              → {currentQuestion.map.A}
            </div>
          </div>
          
          <div 
            onClick={() => handleChoice('B')}
            className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <strong className="text-yellow-400 text-xl">B:</strong> 
            <span className="text-xl font-bold ml-2">{currentQuestion.options.B}</span>
            <div className="text-sm text-gray-400 mt-1">
              → {currentQuestion.map.B}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
