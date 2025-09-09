import React, { useState, useCallback } from 'react';
import { QuizState } from '@/types/quiz';
import { MODULE_QUESTIONS_ENHANCED } from '@/data/questionsEnhanced';

interface PhaseCEnhancedWithTagsProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string) => void;
  onSeveritySelect: (lineId: string, severity: string) => void;
  onProceedToD: () => void;
  stepDone: boolean;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: string, lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswerWithEffects: (question: any, choice: string, family: string) => void;
  updateLine: (lineId: string, updates: Partial<any>) => void;
  setFamilyVerdicts: (verdicts: Record<string, string>) => void;
}

export function PhaseCEnhancedWithTags({ 
  state, 
  onChoice, 
  onSeveritySelect, 
  onProceedToD, 
  stepDone, 
  onAddUsedQuestion, 
  onAddQuestionToHistory,
  onRecordSIFAnswerWithEffects,
  updateLine, 
  setFamilyVerdicts 
}: PhaseCEnhancedWithTagsProps) {
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  
  // Get current non-A line
  const selectedALines = state.lines.filter(line => line.selectedA);
  const nonALines = state.lines.filter(line => !selectedALines.some(aLine => aLine.id === line.id));
  const currentLine = nonALines[currentQuestionIndex];
  
  if (!currentLine) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Phase C Complete</h2>
        <button
          onClick={onProceedToD}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Proceed to Phase D
        </button>
      </div>
    );
  }
  
  // Get available questions for current line
  const availableQuestions = MODULE_QUESTIONS_ENHANCED.filter(q => 
    q.line === currentLine.id && 
    !usedQuestions.has(q.id)
  );
  
  if (availableQuestions.length === 0) {
    return (
      <div className="text-red-400 text-xl font-medium">
        No question available for {currentLine.id}. Check question bank integration.
      </div>
    );
  }
  
  const question = availableQuestions[0];
  const round = Math.floor(currentQuestionIndex / 3) + 1;
  const type = question.type;
  
  const handleChoice = useCallback((pick: 'C' | 'O' | 'F') => {
    if (question && !usedQuestions.has(question.id)) {
      setUsedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.add(question.id);
        return newSet;
      });
      onAddUsedQuestion(question.id);
      onAddQuestionToHistory('C', currentLine.id, question.id, pick);
      
      // Extract enhanced tag data
      const optionKey = pick === 'C' ? 'A' : 'B';
      const behavior = question.semantic_tags?.behavior?.[optionKey];
      const context = question.semantic_tags?.context?.[optionKey];
      const sifSignals = question.semantic_tags?.sif_signals?.[optionKey];
      const ilFactors = question.semantic_tags?.il_factors?.[optionKey];
      const psychology = question.semantic_tags?.psychology?.[optionKey];
      const relationships = question.semantic_tags?.relationships?.[optionKey];
      
      // Log semantic analysis
      console.log('🎯 Phase C Enhanced Choice Analysis:', {
        line: currentLine.id,
        face: question.face,
        question: question.id,
        choice: pick,
        behavior: behavior?.primary,
        energy: behavior?.energy,
        alignment: sifSignals?.alignment_strength,
        wobble: sifSignals?.wobble_factor,
        natural: ilFactors?.natural_instinct,
        situational: ilFactors?.situational_fit,
        motivation: psychology?.motivation,
        leadership: relationships?.leadership_style,
        context: context?.situation,
        pressure: context?.pressure
      });
      
      // Record with enhanced tags
      onRecordSIFAnswerWithEffects(question, pick === 'C' ? 'A' : 'B', currentLine.id);
      
      onChoice(currentLine.id, pick);
      
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [question, usedQuestions, currentLine.id, onAddUsedQuestion, onAddQuestionToHistory, onRecordSIFAnswerWithEffects, onChoice]);
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
      {/* Enhanced Question Card with Context */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 shadow-md mb-8">
        <div className="mb-4 text-center">
          <h2 className="text-white text-xl font-semibold">{currentLine.id}</h2>
          <div className="text-gray-400 text-sm mt-1">Module Decision • {question.face}</div>
          
          {/* Enhanced Context Display */}
          {question?.semantic_tags && (
            <div className="mt-2 text-xs text-gray-500">
              {question.semantic_tags.context?.A && (
                <span className="mr-2">
                  Context: {question.semantic_tags.context.A.situation} • {question.semantic_tags.context.A.pressure} pressure
                </span>
              )}
            </div>
          )}
        </div>
        
        <p className="text-gray-100 text-lg leading-relaxed mb-4 text-center">{question.prompt}</p>
      </div>

      {/* Enhanced Options with Semantic Tags */}
      <div className="space-y-4">
        {[
          { key: 'A', label: question.options.A, pick: 'C' },
          { key: 'B', label: question.options.B, pick: question.type === 'CO' ? 'O' : 'F' }
        ].map((option, index) => {
          const pickLabel = option.pick === 'C' ? 'Align' : option.pick === 'O' ? 'Wobble' : 'Override';
          const choiceKey = option.pick === 'C' ? 'C' : option.pick === 'O' ? 'O' : 'F';
          
          return (
            <button
              key={option.key}
              onClick={() => handleChoice(choiceKey)}
              className={`w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group ${option.pick.toLowerCase()}-choice`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors ${
                  option.pick === 'C' ? 'bg-green-400 text-black' :
                  option.pick === 'O' ? 'bg-yellow-400 text-black' :
                  'bg-red-400 text-black'
                }`}>
                  {option.key}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-gray-100 text-base font-medium leading-relaxed">
                    {option.label}
                  </div>
                  
                  {/* Enhanced Tag Display */}
                  {question.semantic_tags?.behavior?.[option.key as 'A' | 'B'] && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                        {question.semantic_tags.behavior[option.key as 'A' | 'B'].primary}
                      </span>
                      <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                        {question.semantic_tags.behavior[option.key as 'A' | 'B'].energy}
                      </span>
                      {question.semantic_tags.psychology?.[option.key as 'A' | 'B']?.motivation && (
                        <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                          {question.semantic_tags.psychology[option.key as 'A' | 'B'].motivation}
                        </span>
                      )}
                      {question.semantic_tags.relationships?.[option.key as 'A' | 'B']?.leadership_style && (
                        <span className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                          {question.semantic_tags.relationships[option.key as 'A' | 'B'].leadership_style}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* IL Factor Indicators */}
                  {question.semantic_tags?.il_factors?.[option.key as 'A' | 'B'] && (
                    <div className="mt-1 text-xs text-gray-400">
                      Natural: {(question.semantic_tags.il_factors[option.key as 'A' | 'B'].natural_instinct * 100).toFixed(0)}% • 
                      Situational: {(question.semantic_tags.il_factors[option.key as 'A' | 'B'].situational_fit * 100).toFixed(0)}% • 
                      Social: {(question.semantic_tags.il_factors[option.key as 'A' | 'B'].social_expectation * 100).toFixed(0)}%
                    </div>
                  )}
                  
                  {/* SIF Signal Indicators */}
                  {question.semantic_tags?.sif_signals?.[option.key as 'A' | 'B'] && (
                    <div className="mt-1 text-xs text-gray-400">
                      Alignment: {(question.semantic_tags.sif_signals[option.key as 'A' | 'B'].alignment_strength * 100).toFixed(0)}% • 
                      Wobble: {(question.semantic_tags.sif_signals[option.key as 'A' | 'B'].wobble_factor * 100).toFixed(0)}% • 
                      Override: {(question.semantic_tags.sif_signals[option.key as 'A' | 'B'].override_potential * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-6 text-center">
        <div className="text-gray-400 text-sm">
          Question {currentQuestionIndex + 1} of {nonALines.length * 3}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / (nonALines.length * 3)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
