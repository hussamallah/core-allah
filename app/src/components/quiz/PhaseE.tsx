import React, { useEffect, useState } from 'react';
import { QuizState } from '@/types/quiz';
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

export function PhaseE({ state, sifResult, sifEngine, onAddQuestionToHistory, onProceedToArchetype, onArchetypeSelect, onAnchorSelect }: PhaseEProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B'>>({});
  const [hasStarted, setHasStarted] = useState(false);

  // Get A-lines (selected in Phase A)
  const aLines = state.lines.filter(line => line.selectedA);
  
  // Start Phase E
  useEffect(() => {
    if (!hasStarted) {
      console.log('🎯 PHASE E - Starting with A-lines:', aLines.map(l => l.id));
      setHasStarted(true);
    }
  }, [hasStarted, aLines]);

  // Get current line and question
  const currentLine = aLines[currentLineIndex];
  const currentQuestion = currentLine ? getArchetypeQuestionsForFamily(currentLine.id)[0] : null;

  // Handle answer selection
  const handleAnswer = (choice: 'A' | 'B') => {
    if (!currentLine || !currentQuestion) return;
    
    console.log('🎯 PHASE E - Answer selected:', { line: currentLine.id, choice });
    
    // Store answer
    const newAnswers = { ...answers, [currentLine.id]: choice };
    setAnswers(newAnswers);
    
    // Add to question history
    onAddQuestionToHistory('E', currentLine.id, currentQuestion.id, choice);
    
    // Record the choice to QuizRecorder
    quizRecorder.recordQuestionAnswer('E', currentLine.id, currentQuestion.id, choice, {
      archetype: currentQuestion.map[choice],
      lineIndex: currentLineIndex
    });
    
    // Move to next line or complete phase
    if (currentLineIndex < aLines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      // All lines completed, proceed to archetype selection
      console.log('🎯 PHASE E - All lines completed, proceeding to archetype');
      
      // Determine final archetype from answers
      const finalArchetype = determineFinalArchetype(newAnswers);
      
      if (onArchetypeSelect) {
        onArchetypeSelect(finalArchetype);
      }
      
      // Proceed to Summary
      if (onProceedToArchetype) {
        onProceedToArchetype({ 
          selectedLine: currentLine.id as Family, 
        anchorSource: "E:Purity" 
      });
      }
    }
  };
  
  // Determine final archetype from answers
  const determineFinalArchetype = (answers: Record<string, 'A' | 'B'>) => {
    // For now, use the first line's answer as the final archetype
    // In a more complex system, you might aggregate answers from all lines
    const firstLine = aLines[0];
    if (firstLine && answers[firstLine.id]) {
      const question = getArchetypeQuestionsForFamily(firstLine.id)[0];
      return question.map[answers[firstLine.id]];
    }
    return 'Rebel'; // Default fallback
  };

  // Show loading if no current line
  if (!currentLine || !currentQuestion) {
      return (
        <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
          <div className="text-center">
          <div className="text-yellow-400 text-xl font-bold mb-3">Phase E — Processing</div>
          <div className="text-gray-200 text-base mb-4">Preparing questions...</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
          </div>
        </div>
      );
    }
    
  // Show question for current line
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-center mb-8">
        <div className="text-gray-200 text-lg mb-6">Line: {currentLine.id}</div>
        <div className="text-gray-400 text-sm">
          Question {currentLineIndex + 1} of {aLines.length}
        </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600 mb-8">
          <p className="text-white mb-6 text-2xl leading-relaxed font-bold">
            {currentQuestion.prompt}
          </p>
          
          <div className="space-y-4">
            <div 
            onClick={() => handleAnswer('A')}
              className="card-interactive p-6 touch-target touch-safe"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-gold-400 text-brand-gray-950 rounded-full flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold mb-2 uppercase" style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
                    filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
                  }}>
                    {currentQuestion.options.A}
                  </div>
                  <div className="text-brand-gold-400 text-lg font-semibold">
                    → {currentQuestion.map.A}
                  </div>
                </div>
              </div>
            </div>
            
            <div 
            onClick={() => handleAnswer('B')}
              className="card-interactive p-6 touch-target touch-safe"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-gold-400 text-brand-gray-950 rounded-full flex items-center justify-center font-bold text-lg">
                  B
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold mb-2 uppercase" style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
                    filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
                  }}>
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
      </div>
    );

}