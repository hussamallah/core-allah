import React, { useState, useEffect } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="card p-6 animate-fade-in-up">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-3 animate-fade-in-up" style={{ 
          animationDelay: '0.1s',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
          filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))'
        }}>
          Discover Your Core Profile
        </h1>
        <p className="text-brand-gray-200 text-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Select the three families that resonate with your sovereign essence. Each choice shapes your alignment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
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
              className={`rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 flex flex-col gap-3 select-none h-[160px] touch-target touch-safe animate-scale-in ${
                line.selectedA 
                  ? 'card-selected' 
                  : 'card-interactive'
              }`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
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
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    line.selectedA 
                      ? 'border-brand-gold-400 bg-brand-gray-800 text-brand-gold-400' 
                      : 'border-brand-gray-600 bg-brand-gray-900'
                  }`}>
                    {line.selectedA && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414 0l-4.243-4.243a1 1 0 0 1 1.414-1.414l3.536 3.536 9.193-9.193a1 1 0 0 1 1.414 0z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-sm font-bold truncate" style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
                      filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))'
                    }}>{line.id}</strong>
                  </div>
                </div>
                {/* Line Icon - moved to top right */}
                <div className={line.selectedA ? 'text-brand-gold-400' : 'text-brand-gold-600'}>
                  {getLineIcon(line.id)}
                </div>
              </div>
              
              {familyCard && (
                <div className="text-xs font-medium italic text-center leading-tight px-1 flex-1 flex items-center" style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
                  filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
                }}>
                  {familyCard.blurb}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <button
          onClick={onStartPhaseB}
          disabled={selectedCount !== 3}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 min-h-[48px] touch-target touch-safe ${
            selectedCount === 3
              ? 'btn-primary'
              : 'btn-secondary'
          }`}
        >
          {selectedCount === 3 ? 'Continue to Step 2' : `Select ${3 - selectedCount} more families`}
        </button>
      </div>
    </div>
  );
}