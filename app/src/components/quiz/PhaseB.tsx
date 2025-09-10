import React, { useEffect, useMemo, useState } from 'react';
import { QuizState } from '@/types/quiz';
import { DUEL_QUESTIONS } from '@/data/questions';
import { quizRecorder } from '@/utils/QuizRecorder';
import { phaseBEngine } from '@/engine/PhaseB';
import { SemanticTagsDebug } from '../SemanticTagsDebug';
import unifiedQuestionsData from '../../../../unified_question_pool_v1.json';

interface PhaseBProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string) => void;
  onProceedToC: () => void;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswer: (phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => void;
}

export function PhaseB({ state, onChoice, onProceedToC, onAddUsedQuestion, onAddQuestionToHistory, onRecordSIFAnswer }: PhaseBProps) {
  const selectedALines = state.lines.filter(l => l.selectedA);
  const remaining = selectedALines.filter(l => l.B.picks.length < 2);
  const progress = selectedALines.reduce((a, l) => a + l.B.picks.length, 0);
  
  // State for debug panel
  const [showDebug, setShowDebug] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);

  const used = useMemo(() => new Set(state.usedQuestions), [state.usedQuestions]);


  // Auto-proceed when all duels are completed
  useEffect(() => {
    if (remaining.length === 0) {
      // Mark Phase B as complete and validate seedF invariant
      phaseBEngine.markComplete();
      phaseBEngine.validateInvariant();
      
      const timer = setTimeout(() => {
        onProceedToC();
      }, 1700);
      return () => clearTimeout(timer);
    }
  }, [remaining.length, onProceedToC]);

  if (remaining.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-medium">Processing...</div>
        </div>
      </div>
    );
  }

  const line = remaining[0];
  const round = line.B.picks.length + 1;
  const firstWasO = line.B.picks[0] === "O";
  
  // Determine type and order based on round and previous picks
  const type = round === 1 ? "CO" : (firstWasO ? "CF" : "CO");
  
  // Simplified order logic:
  // Round 1: CO questions with order 1
  // Round 2: 
  //   - If first was "O" (CF): Use order 1 (all families have CF order 1)
  //   - If first was "C" (CO): Use order 2
  let order;
  if (round === 1) {
    order = 1; // CO questions with order 1
  } else if (firstWasO) {
    order = 1; // CF questions always use order 1
  } else {
    order = 2; // CO questions with order 2
  }

  // Find available questions for this line, type, and order
  // Use unified questions with semantic tags
  // Map CO/CF to CO1/CO2/CF1 based on round and type
  let questionType;
  if (type === "CO") {
    questionType = round === 1 ? "CO1" : "CO2";
  } else {
    questionType = "CF1"; // CF questions always use CF1
  }
  
  const availableQuestions = unifiedQuestionsData.unified_questions.filter((q: any) => 
    q.family === line.id && 
    q.type === questionType &&
    !used.has(q.id)
  );

  if (availableQuestions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 min-h-[300px]">
        <div className="text-red-400 text-lg font-medium">
          No question available for {line.id} {type} Round {round}. Fix your bank or restart.
        </div>
      </div>
    );
  }

  // Select first available question (deterministic)
  const question = availableQuestions[0];

  const handleChoice = (pick: 'C' | 'O' | 'F') => {
    if (question && !used.has(question.id)) {
      onAddUsedQuestion(question.id);
      onAddQuestionToHistory('B', line.id, question.id, pick);
      
      // Record SIF answer - simple mapping: C->A, O/F->B
      const questionType = question.type as 'CO' | 'CF';
      const choice = pick === 'C' ? 'A' : 'B';
      onRecordSIFAnswer('B', line.id, questionType, choice);
      
      // Record the choice with Phase B engine
      phaseBEngine.recordPick(line.id, pick, round);
      
      // Record the choice
      quizRecorder.recordQuestionAnswer('B', line.id, question.id, pick, {
        round,
        type: questionType,
        sifChoice: choice
      });
    }
    onChoice(line.id, pick);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
      {/* Debug Toggle */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-gray-400 text-sm">
          Round {round} of 2 • Progress: {progress}/4
        </div>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded"
        >
          {showDebug ? 'Hide' : 'Show'} Semantic Tags
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <SemanticTagsDebug 
          question={question} 
          choice={selectedChoice || undefined} 
        />
      )}

      {/* Question Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 shadow-md mb-8">
        <div className="mb-4 text-center">
          <h2 className="text-white text-xl font-semibold">{line.id}</h2>
        </div>
        
        <p className="text-gray-100 text-lg leading-relaxed mb-4 text-center">{question.prompt}</p>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedChoice('A');
            handleChoice('C');
          }}
          onMouseEnter={() => setSelectedChoice('A')}
          className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors">
              A
            </div>
            <span className="text-gray-100 text-base font-medium leading-relaxed">{question.options[0].label}</span>
          </div>
        </button>
        
        <button
          onClick={() => {
            setSelectedChoice('B');
            handleChoice(type === "CO" ? "O" : "F");
          }}
          onMouseEnter={() => setSelectedChoice('B')}
          className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors">
              B
            </div>
            <span className="text-gray-100 text-base font-medium leading-relaxed">{question.options[1].label}</span>
          </div>
        </button>
      </div>
    </div>
  );
}