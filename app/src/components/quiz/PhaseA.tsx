import React from 'react';
import { QuizState } from '@/types/quiz';
import { quizRecorder } from '@/utils/QuizRecorder';
import { FAMILY_CARDS } from '@/data/questions';

interface PhaseAProps {
  state: QuizState;
  onLineToggle: (lineId: string) => void;
  onStartPhaseB: () => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E', lineId: string, questionId: string, choice: string) => void;
}

export function PhaseA({ state, onLineToggle, onStartPhaseB, onAddQuestionToHistory }: PhaseAProps) {
  const selectedCount = state.lines.filter(l => l.selectedA).length;
  

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <p className="text-gray-200 text-lg mb-4 font-medium">Select the three lines that resonate with your sovereign essence. Each choice shapes your alignment.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {state.lines.map((line, index) => {
          const familyCard = FAMILY_CARDS.find(card => card.family === line.id);
          return (
            <div 
              key={line.id} 
              className={`rounded-xl p-3 border-2 cursor-pointer transition-all duration-200 flex flex-col gap-2 select-none ${
                line.selectedA 
                  ? 'bg-gradient-to-b from-yellow-900/20 to-orange-900/20 border-yellow-400 shadow-lg shadow-yellow-400/25 transform -translate-y-0.5' 
                  : 'bg-gradient-to-b from-gray-800 to-gray-700 border-gray-600 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/10'
              }`}
              onClick={() => {
                onLineToggle(line.id);
                if (!line.selectedA) {
                  // Adding a line selection to history
                  onAddQuestionToHistory('A', line.id, `family-${line.id}`, 'selected');
                  // Record line selection
                  quizRecorder.recordLineSelection('A', line.id);
                }
              }}
              role="button"
              aria-pressed={line.selectedA}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    line.selectedA 
                      ? 'border-yellow-400 bg-gray-800 text-yellow-400' 
                      : 'border-gray-600 bg-gray-900'
                  }`}>
                    {line.selectedA && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414 0l-4.243-4.243a1 1 0 0 1 1.414-1.414l3.536 3.536 9.193-9.193a1 1 0 0 1 1.414 0z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <strong className="text-white">{line.id}</strong>
                  </div>
                </div>
              </div>
              {familyCard && (
                <div className="text-gray-200 text-sm font-medium italic">
                  {familyCard.blurb}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onStartPhaseB}
          disabled={selectedCount !== 3}
          className={`px-6 py-3 rounded-lg font-bold text-base transition-all duration-300 ${
            selectedCount === 3
              ? 'bg-gradient-to-r from-yellow-300 to-orange-400 text-black border-none hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-600'
          }`}
        >
          Begin The Alignment
        </button>
      </div>
    </div>
  );
}