import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QuizState, anchorFaceFor } from '@/types/quiz';
import { MODULE_QUESTIONS, SEVERITY_PROBE_QUESTIONS } from '@/data/questions';
import { UNIFIED_QUESTIONS_ENHANCED } from '@/data/questionsEnhanced';
import { quizRecorder } from '@/utils/QuizRecorder';
import { SemanticTagsDebug } from '../SemanticTagsDebug';
import unifiedQuestionsData from '../../../../unified_question_pool_v1.json';

interface PhaseCProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string, decisionType: 'CO1' | 'CO2' | 'CF') => void;
  onSeveritySelect: (lineId: string, severity: 'high' | 'mid', score: 1.0 | 0.5) => void;
  onProceedToD: () => void;
  stepDone: () => void;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswer: (phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => void; // DEPRECATED
  onRecordSIFAnswerWithEffects: (question: any, choice: 'A' | 'B' | 'C', family: string) => void; // NEW
  updateLine: (lineId: string, updates: Partial<any>) => void;
  setFamilyVerdicts: (verdicts: Array<{ family: string; type: 'F'; severity?: number }>) => void;
}

export function PhaseC({ state, onChoice, onSeveritySelect, onProceedToD, stepDone, onAddUsedQuestion, onAddQuestionToHistory, onRecordSIFAnswer, onRecordSIFAnswerWithEffects, updateLine, setFamilyVerdicts }: PhaseCProps) {
  const nonALines = state.lines.filter(l => !l.selectedA);
  const used = useMemo(() => new Set(state.usedQuestions), [state.usedQuestions]);
  
  const verdictsCalculated = useRef(false);
  
  // Track which lines have had severity assessed
  const [severityAssessed, setSeverityAssessed] = useState<Set<string>>(new Set());
  
  // Debug panel state
  const [showDebug, setShowDebug] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);

  // Find first line with <3 decisions (Phase C has CO1, CO2, CF questions)
  const pendingLine = nonALines.find(l => l.mod.decisions.length < 3);
  
  

  // When all done, proceed to Phase D (no verdict calculation yet)
  useEffect(() => {
    if (!pendingLine && !verdictsCalculated.current) {
      verdictsCalculated.current = true;
      
      
      // Proceed to Phase D after a brief delay
      const timer = setTimeout(() => {
        onProceedToD();
      }, 1700);
      return () => clearTimeout(timer);
    }
  }, [pendingLine, onProceedToD]);

  // Check for severity assessment first - show immediately when a line gets F verdict
  // But only if the line has completed all 3 decisions and hasn't had severity assessed yet
  const needSeverity = nonALines.find(l => {
    if (l.mod.decisions.length !== 3) return false;
    if (severityAssessed.has(l.id)) return false; // Already assessed
    const by = Object.fromEntries(l.mod.decisions.map(d => [d.type, d.pick]));
    const verdict = (() => {
      const key = `${by['CO1']}${by['CO2']}${by['CF1']}`;
      const table: Record<string, string> = {
        "CCC": "C", "CCF": "O", "COC": "O", "COF": "F", 
        "OCC": "O", "OCF": "F", "OOC": "O", "OOF": "F"
      };
      return table[key] || "O";
    })();
    return verdict === 'F';
  });

  // Debug: Log all F verdicts that need severity
  const allFVerdicts = nonALines.filter(l => {
    if (l.mod.decisions.length !== 3) return false;
    const by = Object.fromEntries(l.mod.decisions.map(d => [d.type, d.pick]));
    const verdict = (() => {
      const key = `${by['CO1']}${by['CO2']}${by['CF1']}`;
      const table: Record<string, string> = {
        "CCC": "C", "CCF": "O", "COC": "O", "COF": "F", 
        "OCC": "O", "OCF": "F", "OOC": "O", "OOF": "F"
      };
      return table[key] || "O";
    })();
    return verdict === 'F';
  });
  
  // Debug: Log ALL verdicts for all lines
  const allVerdicts = nonALines.map(l => {
    if (l.mod.decisions.length !== 3) return { id: l.id, verdict: 'incomplete', decisions: l.mod.decisions };
    const by = Object.fromEntries(l.mod.decisions.map(d => [d.type, d.pick]));
    const key = `${by['CO1']}${by['CO2']}${by['CF1']}`;
    const table: Record<string, string> = {
      "CCC": "C", "CCF": "O", "COC": "O", "COF": "F", 
      "OCC": "O", "OCF": "F", "OOC": "O", "OOF": "F"
    };
    const verdict = table[key] || "O";
    return { id: l.id, verdict, key, decisions: l.mod.decisions, by };
  });
  
  
  const allLinesComplete = nonALines.every(l => l.mod.decisions.length === 3);


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

      onSeveritySelect(needSeverity.id, level, score);
      onAddQuestionToHistory('C', needSeverity.id, severityQuestion.id, 
        level === 'high' ? 'F1' : 'F0.5');
      
      // Record severity assessment
      quizRecorder.recordSeverityAssessment(needSeverity.id, level, state.sifCounters);
      
      stepDone();
    };

    // Calculate progress for severity assessment
    const moduleCompleted = nonALines.reduce((sum, line) => sum + line.mod.decisions.length, 0);
    const totalModules = nonALines.length * 3; // Phase C has 3 rounds per family (CO1, CO2, CF)
    const severityNeeded = nonALines.filter(line => {
      const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
      return by['CF1'] === 'F';
    }).length;
    const totalSteps = totalModules + severityNeeded;

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
      </div>
    );
  }

  if (!pendingLine) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl font-medium">Processing...</div>
        </div>
      </div>
    );
  }

  // Add early return if we're stuck in a loop
  if (pendingLine.mod.decisions.length >= 3) {
    // Log error in useEffect to avoid console.log in render
    React.useEffect(() => {
      console.log('🚨 STUCK LOOP: Line has 3+ decisions but still pending:', pendingLine.id, pendingLine.mod.decisions.length);
    }, [pendingLine.id, pendingLine.mod.decisions.length]);
    
    return (
      <div className="bg-gray-900 rounded-xl p-4 min-h-[300px]">
        <div className="text-red-400 text-lg font-medium">Error: Line {pendingLine.id} has {pendingLine.mod.decisions.length} decisions but still pending. Please restart.</div>
      </div>
    );
  }

  // Phase C always follows strict CO1 → CO2 → CF1 pattern
  const k = pendingLine.mod.decisions.length; // 0,1,2 (Phase C has CO1, CO2, CF1 questions)
  const decisionType: 'CO1' | 'CO2' | 'CF1' = k === 0 ? 'CO1' : k === 1 ? 'CO2' : 'CF1';
  const type = decisionType === 'CF1' ? 'CF' : 'CO';
  const order = decisionType === 'CF1' ? 1 : (decisionType === 'CO1' ? 1 : 2);

  // Find available questions for this line, type, and order
  // Use unified questions with semantic tags
  const availableQuestions = unifiedQuestionsData.unified_questions.filter((q: any) => 
    q.family === pendingLine.id && 
    q.type === decisionType && // Use decisionType directly (CO1, CO2, CF1)
    !used.has(q.id)
  );


  if (availableQuestions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-red-400 text-xl font-medium">
          No question available for {pendingLine.id} {decisionType}. Fix your bank or restart.
        </div>
      </div>
    );
  }

  // Select first available question (deterministic)
  const question = availableQuestions[0];

  const handleChoice = (pick: 'C' | 'O' | 'F') => {
    if (question && !used.has(question.id)) {
      onAddUsedQuestion(question.id);
      onAddQuestionToHistory('C', pendingLine.id, question.id, pick);
      
      // NEW: Use effect-based recording with original question data
      const originalQuestion = UNIFIED_QUESTIONS_ENHANCED.find(q => q.id === question.id);
      if (originalQuestion && onRecordSIFAnswerWithEffects) {
        const choiceKey = pick === 'C' ? 'A' : pick === 'O' ? 'B' : 'C';
        onRecordSIFAnswerWithEffects(originalQuestion, choiceKey as 'A' | 'B' | 'C', pendingLine.id);
        console.log(`✅ Using new effect-based recording for ${pendingLine.id} ${pick}`);
      } else {
        // FALLBACK: Use old method if new method not available
        const choice = pick === 'C' ? 'A' : 'B';
        const questionType = type === 'CF' ? 'CF' : 'CO';
        const anchoredFace = anchorFaceFor(pendingLine.id, decisionType as 'CO1' | 'CO2' | 'CF' | 'TIE');
        onRecordSIFAnswer('C', pendingLine.id, questionType, choice, anchoredFace);
        console.log(`⚠️ Using deprecated recording for ${pendingLine.id} ${pick}`);
      }
      
      // Record the choice
      const choice = pick === 'C' ? 'A' : 'B';
      const questionType = type === 'CF' ? 'CF' : 'CO';
      const anchoredFace = anchorFaceFor(pendingLine.id, decisionType as 'CO1' | 'CO2' | 'CF' | 'TIE');
      quizRecorder.recordQuestionAnswer('C', pendingLine.id, question.id, pick, {
        decisionType,
        questionType,
        anchoredFace,
        sifChoice: choice
      });
    }
    onChoice(pendingLine.id, pick, decisionType);
    stepDone();
  };

  // Calculate progress for Phase C
  const moduleCompleted = nonALines.reduce((sum, line) => sum + line.mod.decisions.length, 0);
  const totalModules = nonALines.length * 3;
  const severityNeeded = nonALines.filter(line => {
    const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
    return by['CF1'] === 'F';
  }).length;
  const totalSteps = totalModules + severityNeeded;

  return (
    <div key={`phase-c-${pendingLine.id}-${k}-${type}-${order}`} className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
      {/* Debug Toggle */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-gray-400 text-sm">
          {decisionType} • Progress: {moduleCompleted}/{totalSteps}
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
          choice={selectedChoice} 
        />
      )}

      {/* Question Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 shadow-md mb-8">
        <div className="mb-4 text-center">
          <h2 className="text-white text-xl font-semibold">{pendingLine.id}</h2>
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
            <span className="text-base font-medium leading-relaxed" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
            }}>{question.options[0].label}</span>
          </div>
        </button>
        
        <button
          onClick={() => {
            setSelectedChoice('B');
            handleChoice(type === 'CO' ? 'O' : 'F');
          }}
          onMouseEnter={() => setSelectedChoice('B')}
          className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors">
              B
            </div>
            <span className="text-base font-medium leading-relaxed" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 8px rgba(255, 215, 0, 0.2)',
              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.3))'
            }}>{question.options[1].label}</span>
          </div>
        </button>
      </div>
    </div>
  );
}