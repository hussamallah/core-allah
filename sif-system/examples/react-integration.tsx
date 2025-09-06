/**
 * React Integration Example
 * 
 * This example shows how to integrate SIF into a React quiz application.
 */

import React, { useState, useCallback } from 'react';
import { 
  useSIFIntegration, 
  SIFResult, 
  SIFIntegrationState 
} from '../index';

// Example quiz question types
interface QuizQuestion {
  id: string;
  phase: 'B' | 'C';
  lineId: string;
  questionType: 'CO' | 'CF';
  question: string;
  options: {
    A: string;
    B: string;
  };
  anchoredFace?: string;
}

interface SeverityQuestion {
  id: string;
  lineId: string;
  question: string;
  options: {
    F0: string;
    F0_5: string;
    F1: string;
  };
}

// Example quiz data
const sampleQuestions: QuizQuestion[] = [
  {
    id: 'b1',
    phase: 'B',
    lineId: 'Control',
    questionType: 'CO',
    question: 'Do you prefer to take charge or follow others?',
    options: {
      A: 'Take charge',
      B: 'Follow others'
    }
  },
  {
    id: 'b2',
    phase: 'B',
    lineId: 'Control',
    questionType: 'CF',
    question: 'When facing conflict, do you confront or avoid?',
    options: {
      A: 'Confront',
      B: 'Avoid'
    }
  },
  {
    id: 'c1',
    phase: 'C',
    lineId: 'Pace',
    questionType: 'CO',
    question: 'How do you handle deadlines?',
    options: {
      A: 'Work steadily',
      B: 'Work in bursts'
    },
    anchoredFace: 'Pace:Visionary'
  },
  {
    id: 'c2',
    phase: 'C',
    lineId: 'Pace',
    questionType: 'CF',
    question: 'Do you prefer structure or flexibility?',
    options: {
      A: 'Structure',
      B: 'Flexibility'
    },
    anchoredFace: 'Pace:Navigator'
  }
];

const sampleSeverityQuestions: SeverityQuestion[] = [
  {
    id: 's1',
    lineId: 'Stress',
    question: 'How do you handle high-pressure situations?',
    options: {
      F0: 'Stay calm and focused',
      F0_5: 'Feel some stress but manage',
      F1: 'Feel overwhelmed and stressed'
    }
  }
];

// Main Quiz Component
export function SIFQuiz() {
  const {
    state,
    recordPhaseBAnswer,
    recordPhaseCAnswer,
    recordSeverityProbe,
    calculateSIF,
    resetSIF,
    getSummary
  } = useSIFIntegration();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<'B' | 'C' | 'D' | 'Complete'>('B');
  const [sifResult, setSifResult] = useState<SIFResult | null>(null);

  const handleAnswer = useCallback((question: QuizQuestion, choice: 'A' | 'B') => {
    if (question.phase === 'B') {
      recordPhaseBAnswer(question.lineId, question.questionType, choice);
    } else if (question.phase === 'C' && question.anchoredFace) {
      recordPhaseCAnswer(question.lineId, question.questionType, choice, question.anchoredFace);
    }

    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    
    // Check if we need to move to next phase
    if (question.phase === 'B' && currentQuestionIndex >= 1) {
      setPhase('C');
      setCurrentQuestionIndex(0);
    } else if (question.phase === 'C' && currentQuestionIndex >= 1) {
      setPhase('D');
    }
  }, [recordPhaseBAnswer, recordPhaseCAnswer, currentQuestionIndex]);

  const handleSeverityAnswer = useCallback((question: SeverityQuestion, severity: 'F0' | 'F0.5' | 'F1') => {
    recordSeverityProbe(question.lineId, severity);
    setPhase('Complete');
  }, [recordSeverityProbe]);

  const handleCalculateSIF = useCallback(() => {
    // In a real app, you'd determine primary family and face from quiz results
    const primaryFamily = 'Control';
    const primaryFace = 'Control:Rebel';
    
    const result = calculateSIF(primaryFamily, primaryFace);
    setSifResult(result);
  }, [calculateSIF]);

  const handleReset = useCallback(() => {
    resetSIF();
    setCurrentQuestionIndex(0);
    setPhase('B');
    setSifResult(null);
  }, [resetSIF]);

  const currentQuestion = phase === 'B' || phase === 'C' 
    ? sampleQuestions.find(q => q.phase === phase)
    : null;

  const currentSeverityQuestion = phase === 'D' 
    ? sampleSeverityQuestions[0]
    : null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SIF Quiz Example</h1>
      
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Phase: {phase}</span>
          <span>Question: {currentQuestionIndex + 1}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentQuestionIndex + 1) / (phase === 'B' ? 2 : phase === 'C' ? 2 : 1)) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Question Display */}
      {phase === 'B' || phase === 'C' ? (
        currentQuestion && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {currentQuestion.question}
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(currentQuestion, 'A')}
                className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <span className="font-medium">A:</span> {currentQuestion.options.A}
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion, 'B')}
                className="w-full p-4 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
              >
                <span className="font-medium">B:</span> {currentQuestion.options.B}
              </button>
            </div>
          </div>
        )
      ) : phase === 'D' ? (
        currentSeverityQuestion && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {currentSeverityQuestion.question}
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => handleSeverityAnswer(currentSeverityQuestion, 'F0')}
                className="w-full p-4 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
              >
                <span className="font-medium">F0:</span> {currentSeverityQuestion.options.F0}
              </button>
              <button
                onClick={() => handleSeverityAnswer(currentSeverityQuestion, 'F0.5')}
                className="w-full p-4 text-left bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors"
              >
                <span className="font-medium">F0.5:</span> {currentSeverityQuestion.options.F0_5}
              </button>
              <button
                onClick={() => handleSeverityAnswer(currentSeverityQuestion, 'F1')}
                className="w-full p-4 text-left bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                <span className="font-medium">F1:</span> {currentSeverityQuestion.options.F1}
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quiz Complete!</h2>
          <button
            onClick={handleCalculateSIF}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Calculate SIF
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset Quiz
          </button>
        </div>
      )}

      {/* SIF Result Display */}
      {sifResult && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">SIF Result</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Primary:</strong> {sifResult.primary.family} - {sifResult.primary.face}</p>
            <p><strong>Secondary (SIF):</strong> {sifResult.secondary.family} - {sifResult.secondary.face}</p>
            <p><strong>Prize:</strong> {sifResult.prize}</p>
            <p><strong>Badge:</strong> {sifResult.badge}</p>
            {Object.keys(sifResult.context.friction).length > 0 && (
              <p><strong>Friction Points:</strong> {JSON.stringify(sifResult.context.friction)}</p>
            )}
          </div>
        </div>
      )}

      {/* Debug Information */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          Debug Information
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(getSummary(), null, 2)}
        </pre>
      </details>
    </div>
  );
}

// Export for use in other components
export default SIFQuiz;
