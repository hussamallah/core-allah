import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { QuizState } from '@/types/quiz';
import { DUEL_QUESTIONS_ENHANCED } from '@/data/questionsEnhanced';
import { UNIFIED_QUESTIONS_ENHANCED } from '@/data/questionsEnhanced';
import { SEVERITY_PROBE_QUESTIONS } from '@/data/questions';
import { quizRecorder } from '@/utils/QuizRecorder';
import { phaseBEngine } from '@/engine/PhaseB';
import { SemanticTagsDebug } from '../SemanticTagsDebug';
import unifiedQuestionsData from '../../../../unified_question_pool_v1.json';

interface PhaseBEnhancedProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string) => void;
  onProceedToC: () => void;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswer: (phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => void; // DEPRECATED
  onRecordSIFAnswerWithEffects: (question: any, choice: 'A' | 'B' | 'C', family: string) => void; // NEW
  onSeveritySelect?: (lineId: string, level: 'high' | 'mid', score: 1.0 | 0.5) => void;
}

export function PhaseBEnhanced({ 
  state, 
  onChoice, 
  onProceedToC, 
  onAddUsedQuestion, 
  onAddQuestionToHistory, 
  onRecordSIFAnswer, // DEPRECATED
  onRecordSIFAnswerWithEffects, // NEW
  onSeveritySelect 
}: PhaseBEnhancedProps) {
  const selectedALines = state.lines.filter(l => l.selectedA);
  const remaining = selectedALines.filter(l => l.B.picks.length < 2);
  const progress = selectedALines.reduce((a, l) => a + l.B.picks.length, 0);
  const totalSteps = selectedALines.length * 2;
  
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);
  
  // Debug panel state
  const [showDebug, setShowDebug] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  
  // Track which A-lines have had severity assessed
  const [severityAssessed, setSeverityAssessed] = useState<Set<string>>(new Set());

  const used = useMemo(() => new Set(state.usedQuestions), [state.usedQuestions]);

  // Check for severity assessment first - show immediately when an A-line gets F verdict
  // But only if the line has completed all 2 duels and hasn't had severity assessed yet
  const needSeverity = selectedALines.find(l => {
    if (l.B.picks.length !== 2) return false;
    if (severityAssessed.has(l.id)) return false; // Already assessed
    
    // Check if this A-line has an F verdict (needs severity probe)
    const by = Object.fromEntries(l.B.picks.map((pick, index) => [`Round${index + 1}`, pick]));
    const key = `${by.Round1}${by.Round2}`;
    const verdict = (() => {
      // Phase B verdict table: CO, CF, OO, OF
      const table: Record<string, string> = {
        "CC": "C", "CO": "O", "CF": "F",
        "OC": "O", "OO": "O", "OF": "F", 
        "FC": "F", "FO": "F", "FF": "F"
      };
      return table[key] || "O";
    })();
    
    return verdict === 'F';
  });

  // Enhanced keyboard shortcuts
  useEffect(() => {
    if (!keyboardEnabled) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleChoice('C');
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        const line = remaining[0];
        if (line) {
          const round = line.B.picks.length + 1;
          const firstWasO = line.B.picks[0] === "O";
          const type = round === 1 ? "CO" : (firstWasO ? "CF" : "CO");
          handleChoice(type === "CO" ? "O" : "F");
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [remaining, keyboardEnabled]);

  // Auto-proceed when all duels are completed
  useEffect(() => {
    if (remaining.length === 0) {
      phaseBEngine.markComplete();
      phaseBEngine.validateInvariant();
      
      const timer = setTimeout(() => {
        onProceedToC();
      }, 1200); // Faster transition
      return () => clearTimeout(timer);
    }
  }, [remaining.length, onProceedToC]);

  // Clear auto-advance timer on cleanup
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  const handleChoice = useCallback((pick: 'C' | 'O' | 'F') => {
    const line = remaining[0];
    if (!line) return;

    const round = line.B.picks.length + 1;
    const firstWasO = line.B.picks[0] === "O";
    const type = round === 1 ? "CO" : (firstWasO ? "CF" : "CO");
    let order;
    if (round === 1) {
      order = 1;
    } else if (firstWasO) {
      order = 1;
    } else {
      order = 2;
    }

    const availableQuestions = DUEL_QUESTIONS_ENHANCED.filter(q => 
      q.line === line.id && 
      q.type === type && 
      q.order === order &&
      !used.has(q.id)
    );

    const question = availableQuestions[0];
    if (question && !used.has(question.id)) {
      onAddUsedQuestion(question.id);
      onAddQuestionToHistory('B', line.id, question.id, pick);
      
      // NEW: Use effect-based recording with original question data
      const originalQuestion = UNIFIED_QUESTIONS_ENHANCED.find(q => q.id === question.id);
      if (originalQuestion && onRecordSIFAnswerWithEffects) {
        const choiceKey = pick === 'C' ? 'A' : pick === 'O' ? 'B' : 'C';
        onRecordSIFAnswerWithEffects(originalQuestion, choiceKey as 'A' | 'B' | 'C', line.id);
        console.log(`✅ Using new effect-based recording for ${line.id} ${pick}`);
      } else {
        // FALLBACK: Use old method if new method not available
        const questionType = question.type as 'CO' | 'CF';
        const choice = pick === 'C' ? 'A' : 'B';
        onRecordSIFAnswer('B', line.id, questionType, choice);
        console.log(`⚠️ Using deprecated recording for ${line.id} ${pick}`);
      }
      
      phaseBEngine.recordPick(line.id, pick, round);
      
      // Enhanced recording with simulator data
      const questionType = question.type as 'CO' | 'CF';
      const choice = pick === 'C' ? 'A' : 'B';
      quizRecorder.recordQuestionAnswer('B', line.id, question.id, pick, {
        round,
        type: questionType,
        sifChoice: choice,
        enhanced: {
          c_flavor: question.enhanced?.c_flavor,
          o_subtype: question.enhanced?.o_subtype,
          f_flavor: question.enhanced?.f_flavor,
          timeContext: question.enhanced?.timeContext,
          socialDynamics: question.enhanced?.socialDynamics,
          responseTime: Date.now() // Track response timing
        }
      });

      // Auto-advance with delay if enabled
      if (question.enhanced?.autoAdvance && remaining.length > 1) {
        const timer = setTimeout(() => {
          // Timer will be cleared by next question or phase transition
        }, 500);
        setAutoAdvanceTimer(timer);
      }
    }
    
    onChoice(line.id, pick);
  }, [remaining, used, onChoice, onAddUsedQuestion, onAddQuestionToHistory, onRecordSIFAnswer, autoAdvanceTimer]);

  // Show severity probe if needed
  if (needSeverity) {
    const severityQuestion = SEVERITY_PROBE_QUESTIONS.find(q => q.line === needSeverity.id);
    
    if (!severityQuestion) {
      return (
        <div className="bg-gray-900 rounded-xl p-4 min-h-[300px]">
          <div className="text-red-400 text-xl font-medium">Missing severity question for {needSeverity.id}.</div>
        </div>
      );
    }

    const handleSeverityChoice = (level: 'high' | 'mid', score: 1.0 | 0.5) => {
      // Mark this line as having severity assessed
      setSeverityAssessed(prev => {
        const newSet = new Set(prev);
        newSet.add(needSeverity.id);
        return newSet;
      });

      if (onSeveritySelect) {
        onSeveritySelect(needSeverity.id, level, score);
      }
      onAddQuestionToHistory('B', needSeverity.id, severityQuestion.id, 
        level === 'high' ? 'F1' : 'F0.5');
      
      // Record severity assessment
      quizRecorder.recordSeverityAssessment(needSeverity.id, level, state.sifCounters);
    };

    return (
      <div className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
        {/* Question Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 shadow-md mb-8">
          <div className="mb-4 text-center">
            <h2 className="text-white text-xl font-semibold">{needSeverity.id}</h2>
          </div>
          
          <p className="text-gray-100 text-lg leading-relaxed mb-4 text-center uppercase">{severityQuestion.prompt}</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <button
            onClick={() => handleSeverityChoice('high', 1.0)}
            className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors">
                A
              </div>
              <span className="text-base font-medium leading-relaxed flex-1 text-left" style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
                filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
              }}>
                {severityQuestion.options.A}
              </span>
            </div>
          </button>

          <button
            onClick={() => handleSeverityChoice('mid', 0.5)}
            className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors">
                B
              </div>
              <span className="text-base font-medium leading-relaxed flex-1 text-left" style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
                filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
              }}>
                {severityQuestion.options.B}
              </span>
            </div>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          Severity assessment for {needSeverity.id}
        </div>
      </div>
    );
  }

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
  const type = round === 1 ? "CO" : (firstWasO ? "CF" : "CO");
  
  let order;
  if (round === 1) {
    order = 1;
  } else if (firstWasO) {
    order = 1;
  } else {
    order = 2;
  }

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

  const question = availableQuestions[0];

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

      {/* Enhanced Options with Keyboard Shortcuts */}
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
            <span className="text-base font-medium leading-relaxed flex-1 text-left" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
            }}>
              {question.options[0].label}
            </span>
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
            <span className="text-base font-medium leading-relaxed flex-1 text-left" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
            }}>
              {question.options[1].label}
            </span>
          </div>
        </button>
      </div>

      {/* Enhanced Controls */}
      <div className="mt-6 flex justify-between items-center text-xs text-gray-400">
        <div className="flex gap-4">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="hover:text-yellow-400 transition-colors"
          >
            {showMetrics ? 'Hide' : 'Show'} Metrics
          </button>
          <button
            onClick={() => setKeyboardEnabled(!keyboardEnabled)}
            className="hover:text-yellow-400 transition-colors"
          >
            Keyboard: {keyboardEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <div>
          Question ID: {question.id}
        </div>
      </div>
    </div>
  );
}
