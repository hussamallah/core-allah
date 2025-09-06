import React, { useEffect, useMemo } from 'react';
import { QuizState } from '@/types/quiz';
import { DUEL_QUESTIONS } from '@/data/questions';
import { quizRecorder } from '@/utils/QuizRecorder';
import { phaseBEngine } from '@/engine/PhaseB';

interface PhaseBProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string) => void;
  onProceedToC: () => void;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E', lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswer: (phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => void;
}

export function PhaseB({ state, onChoice, onProceedToC, onAddUsedQuestion, onAddQuestionToHistory, onRecordSIFAnswer }: PhaseBProps) {
  const selectedALines = state.lines.filter(l => l.selectedA);
  const remaining = selectedALines.filter(l => l.B.picks.length < 2);
  const progress = selectedALines.reduce((a, l) => a + l.B.picks.length, 0);
  

  const used = useMemo(() => new Set(state.usedQuestions), [state.usedQuestions]);


  // Auto-proceed when all duels are completed
  useEffect(() => {
    if (remaining.length === 0) {
      // Mark Phase B as complete and validate seedF invariant
      phaseBEngine.markComplete();
      phaseBEngine.validateInvariant();
      
      const timer = setTimeout(() => {
        onProceedToC();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [remaining.length, onProceedToC]);

  if (remaining.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-yellow-400 text-xl font-medium">Processing your choices...</div>
          <div className="text-gray-400 text-sm mt-2">Moving to Step 3</div>
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
  const availableQuestions = DUEL_QUESTIONS.filter(q => 
    q.line === line.id && 
    q.type === type && 
    q.order === order &&
    !used.has(q.id)
  );

  if (availableQuestions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-red-400 text-xl font-medium">
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
      {/* Question Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600 shadow-lg mb-6">
        <div className="mb-4">
          <h2 className="text-white text-xl font-semibold">{line.id}</h2>
        </div>
        
        <p className="text-gray-100 text-lg leading-relaxed mb-6">{question.prompt}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <button
          onClick={() => handleChoice('C')}
          className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-left hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm group-hover:bg-yellow-300 transition-colors">
              A
            </div>
            <span className="text-gray-100 text-base font-medium leading-relaxed">{question.options.A}</span>
          </div>
        </button>
        
        <button
          onClick={() => handleChoice(type === "CO" ? "O" : "F")}
          className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-left hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm group-hover:bg-yellow-300 transition-colors">
              B
            </div>
            <span className="text-gray-100 text-base font-medium leading-relaxed">{question.options.B}</span>
          </div>
        </button>
      </div>
    </div>
  );
}