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
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-yellow-400 text-xl font-medium">Proceeding to Phase C...</div>
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
    <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">

      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <div className="mb-6">
          <strong className="text-white text-2xl">{line.id}</strong> — <span className="text-yellow-400 text-xl">Round {round}</span>
        </div>
        
        <div className="mb-8">
          <p className="text-ivory mb-6 text-2xl leading-relaxed font-bold">{question.prompt}</p>
          <div className="space-y-4">
            <div 
              onClick={() => handleChoice('C')}
              className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">Choose C:</strong> <span className="text-xl font-bold">{question.options.A}</span>
            </div>
            <div 
              onClick={() => handleChoice(type === "CO" ? "O" : "F")}
              className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">Choose {type === "CO" ? "O" : "F"}:</strong> <span className="text-xl font-bold">{question.options.B}</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}