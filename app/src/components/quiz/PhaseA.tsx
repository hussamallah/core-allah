import React from 'react';
import { QuizState } from '@/types/quiz';
import { quizRecorder } from '@/utils/QuizRecorder';
import { FAMILY_CARDS } from '@/data/questions';
import { Crown, Timer, Fence, Scale, Sun, Users, Flame } from 'lucide-react';

interface PhaseAProps {
  state: QuizState;
  onLineToggle: (lineId: string) => void;
  onStartPhaseB: () => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
}

export function PhaseA({ state, onLineToggle, onStartPhaseB, onAddQuestionToHistory }: PhaseAProps) {
  const selectedCount = state.lines.filter(l => l.selectedA).length;
  

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-white mb-2">Discover Your Core Profile</h1>
        <p className="text-gray-200 text-base">Select the three families that resonate with your sovereign essence. Each choice shapes your alignment.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 mb-5">
        {state.lines.map((line, index) => {
          const familyCard = FAMILY_CARDS.find(card => card.family === line.id);
          
          // Define Lucide React icons for each line
          const getLineIcon = (lineId: string) => {
            switch (lineId) {
              case 'Control':
                return <Crown className="w-8 h-8" />;
              case 'Pace':
                return <Timer className="w-8 h-8" />;
              case 'Boundary':
                return <Fence className="w-8 h-8" />;
              case 'Truth':
                return <Scale className="w-8 h-8" />;
              case 'Recognition':
                return <Sun className="w-8 h-8" />;
              case 'Bonding':
                return <Users className="w-8 h-8" />;
              case 'Stress':
                return <Flame className="w-8 h-8" />;
              default:
                return <div className="w-8 h-8 border-2 border-current rounded"></div>;
            }
          };
          
          return (
            <div 
              key={line.id} 
              className={`rounded-lg p-3 border-2 cursor-pointer transition-all duration-200 flex flex-col gap-2 select-none h-[140px] ${
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
                    <strong className="text-yellow-400 text-base">{line.id}</strong>
                  </div>
                </div>
                {/* Line Icon - moved to top right */}
                <div className={line.selectedA ? 'text-yellow-400' : 'text-yellow-600'}>
                  {getLineIcon(line.id)}
                </div>
              </div>
              
              {familyCard && (
                <div className="text-gray-200 text-base font-medium italic text-center leading-relaxed px-2">
                  {familyCard.blurb}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onStartPhaseB}
          disabled={selectedCount !== 3}
          className={`px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 min-h-[48px] ${
            selectedCount === 3
              ? 'bg-gradient-to-r from-yellow-300 to-orange-400 text-black border-none hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-600'
          }`}
        >
          {selectedCount === 3 ? 'Continue to Step 2' : `Select ${3 - selectedCount} more families`}
        </button>
      </div>
    </div>
  );
}