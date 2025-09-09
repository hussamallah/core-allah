/**
 * Example Phase B component using the new effect-based SIF recording
 * This demonstrates how to use recordSIFAnswerWithEffects instead of the old method
 */

import React, { useMemo } from 'react';
import { QuizState } from '@/types/quiz';
import { getUnifiedQuestionsByType } from '@/data/questions';
import { validateSIFMapping } from '@/utils/sifValidation';

interface PhaseBWithEffectsProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string) => void;
  onProceedToC: () => void;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswerWithEffects: (question: any, choice: 'A' | 'B' | 'C', family: string) => void; // NEW
  onRecordSIFAnswer: (phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => void; // DEPRECATED
}

export function PhaseBWithEffects({ 
  state, 
  onChoice, 
  onProceedToC, 
  onAddUsedQuestion, 
  onAddQuestionToHistory,
  onRecordSIFAnswerWithEffects, // NEW
  onRecordSIFAnswer // DEPRECATED
}: PhaseBWithEffectsProps) {
  
  const selectedALines = useMemo(() => 
    state.lines.filter(line => line.selectedA), [state.lines]
  );

  const usedQuestions = useMemo(() => 
    new Set(state.usedQuestions), [state.usedQuestions]
  );

  // Find the next line that needs a question
  const pendingLine = selectedALines.find(line => 
    !line.B || line.B.picks.length < 2
  );

  if (!pendingLine) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Phase B Complete</h2>
        <p className="text-gray-300 mb-4">All A-lines have completed their duels.</p>
        <button 
          onClick={onProceedToC}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Proceed to Phase C
        </button>
      </div>
    );
  }

  const round = (pendingLine.B?.picks.length || 0) + 1;
  const firstWasO = pendingLine.B?.picks[0] === "O";
  const questionType = round === 1 ? "CO1" : (firstWasO ? "CF1" : "CO2");

  // Get questions from unified pool
  const availableQuestions = getUnifiedQuestionsByType(questionType as 'CO1' | 'CO2' | 'CF1' | 'Severity1')
    .filter(q => 
      q.family === pendingLine.id && 
      !usedQuestions.has(q.id)
    );

  if (availableQuestions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 min-h-[300px]">
        <div className="text-red-400 text-lg font-medium">
          No question available for {pendingLine.id} {questionType} Round {round}. 
          Check question bank integration.
        </div>
      </div>
    );
  }

  const question = availableQuestions[0];

  const handleChoice = (pick: 'C' | 'O' | 'F') => {
    if (question && !usedQuestions.has(question.id)) {
      // Validate the choice before recording
      const validation = validateSIFMapping(question, pick === 'C' ? 'A' : pick === 'O' ? 'B' : 'C');
      if (!validation.isValid) {
        console.error('❌ Invalid SIF mapping:', validation.errors);
        return;
      }

      onAddUsedQuestion(question.id);
      onAddQuestionToHistory('B', pendingLine.id, question.id, pick);
      
      // NEW: Use effect-based recording
      const choiceKey = pick === 'C' ? 'A' : pick === 'O' ? 'B' : 'C';
      onRecordSIFAnswerWithEffects(question, choiceKey as 'A' | 'B' | 'C', pendingLine.id);
      
      console.log(`✅ Recorded ${pick} choice for ${pendingLine.id} using new effect-based mapping`);
    }
    
    onChoice(pendingLine.id, pick);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Phase B: Duels</h2>
        <p className="text-gray-300">
          Line: <span className="text-blue-400 font-medium">{pendingLine.id}</span> | 
          Round: <span className="text-blue-400 font-medium">{round}</span> | 
          Type: <span className="text-blue-400 font-medium">{questionType}</span>
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Question:</h3>
        <p className="text-gray-200 text-lg leading-relaxed mb-6">
          {question.prompt}
        </p>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => {
          const pickLabel = option.pick === 'C' ? 'Align' : option.pick === 'O' ? 'Wobble' : 'Needs Brake';
          const pickColor = option.pick === 'C' ? 'text-green-400' : option.pick === 'O' ? 'text-yellow-400' : 'text-red-400';
          
          return (
            <button
              key={option.key}
              onClick={() => handleChoice(option.pick as 'C' | 'O' | 'F')}
              className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-medium">{option.key}:</span>
                    <span className={`text-sm font-medium ${pickColor}`}>
                      {pickLabel}
                    </span>
                  </div>
                  <p className="text-gray-200">{option.label}</p>
                </div>
              </div>
              
              {/* Show effects for debugging */}
              <div className="mt-2 text-xs text-gray-400">
                <div>Effects: {JSON.stringify(option.effects, null, 2)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">SIF Mapping Info:</h4>
        <p className="text-xs text-gray-400">
          ✅ Using new effect-based recording<br/>
          ✅ O/F choices credit external faces<br/>
          ✅ C choices credit same-family faces
        </p>
      </div>
    </div>
  );
}

