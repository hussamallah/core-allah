import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QuizState, anchorFaceFor } from '@/types/quiz';
import { MODULE_QUESTIONS, SEVERITY_PROBE_QUESTIONS } from '@/data/questions';
import { quizRecorder } from '@/utils/QuizRecorder';

interface PhaseCProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string, decisionType: 'CO1' | 'CO2' | 'CF') => void;
  onSeveritySelect: (lineId: string, severity: 'high' | 'mid' | 'low', score: 1.0 | 0.5 | 0.0) => void;
  onProceedToD: () => void;
  stepDone: () => void;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswer: (phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => void;
  updateLine: (lineId: string, updates: Partial<any>) => void;
  setFamilyVerdicts: (verdicts: Array<{ family: string; type: 'F'; severity?: number }>) => void;
}

export function PhaseC({ state, onChoice, onSeveritySelect, onProceedToD, stepDone, onAddUsedQuestion, onAddQuestionToHistory, onRecordSIFAnswer, updateLine, setFamilyVerdicts }: PhaseCProps) {
  const nonALines = state.lines.filter(l => !l.selectedA);
  const used = useMemo(() => new Set(state.usedQuestions), [state.usedQuestions]);
  const verdictsCalculated = useRef(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Track which lines have had severity assessed
  const [severityAssessed, setSeverityAssessed] = useState<Set<string>>(new Set());


  // Force refresh when state changes
  React.useEffect(() => {
    setForceRefresh(prev => prev + 1);
  }, [state.lines, state.usedQuestions]);

  // Find first line with <3 decisions (Phase C has CO1, CO2, CF questions)
  const pendingLine = nonALines.find(l => l.mod.decisions.length < 3);
  

  // When all done, proceed to Phase D (no verdict calculation yet)
  useEffect(() => {
    if (!pendingLine && !verdictsCalculated.current) {
      verdictsCalculated.current = true;
      
      console.log('🎯 PHASE C - All non-A lines completed, proceeding to Phase D');
      
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
      const key = `${by['CO1']}${by['CO2']}${by['CF']}`;
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
      const key = `${by['CO1']}${by['CO2']}${by['CF']}`;
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
    const key = `${by['CO1']}${by['CO2']}${by['CF']}`;
    const table: Record<string, string> = {
      "CCC": "C", "CCF": "O", "COC": "O", "COF": "F", 
      "OCC": "O", "OCF": "F", "OOC": "O", "OOF": "F"
    };
    const verdict = table[key] || "O";
    return { id: l.id, verdict, key, decisions: l.mod.decisions, by };
  });
  
  // Debug logging moved to useEffect
  React.useEffect(() => {
    console.log('🔍 F VERDICTS DEBUG:', {
      allFVerdicts: allFVerdicts.map(l => ({ 
        id: l.id, 
        decisions: l.mod.decisions,
        verdict: (() => {
          const by = Object.fromEntries(l.mod.decisions.map(d => [d.type, d.pick]));
          const key = `${by['CO1']}${by['CO2']}${by['CF']}`;
          const table: Record<string, string> = {
            "CCC": "C", "CCF": "O", "COC": "O", "COF": "F", 
            "OCC": "O", "OCF": "F", "OOC": "O", "OOF": "F"
          };
          return table[key] || "O";
        })()
      })),
      severityAssessed: Array.from(severityAssessed),
      needSeverity: needSeverity?.id || 'none',
      nonALinesCount: nonALines.length,
      nonALinesWith3Decisions: nonALines.filter(l => l.mod.decisions.length === 3).length
    });
  }, [allFVerdicts, severityAssessed, needSeverity, nonALines.length, pendingLine]);
  
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

    const handleSeverityChoice = (level: 'high' | 'mid' | 'low', score: 1.0 | 0.5 | 0.0) => {
      // Mark this line as having severity assessed
      setSeverityAssessed(prev => {
        const newSet = new Set(prev);
        newSet.add(needSeverity.id);
        return newSet;
      });

      onSeveritySelect(needSeverity.id, level, score);
      onAddQuestionToHistory('C', needSeverity.id, severityQuestion.id, 
        level === 'high' ? 'F1' : level === 'mid' ? 'F0.5' : 'F0');
      
      // Record severity assessment
      quizRecorder.recordSeverityAssessment(needSeverity.id, level, state.sifCounters);
      
      stepDone();
    };

    // Calculate progress for severity assessment
    const moduleCompleted = nonALines.reduce((sum, line) => sum + line.mod.decisions.length, 0);
    const totalModules = nonALines.length * 3; // Phase C has 3 rounds per family (CO1, CO2, CF)
    const severityNeeded = nonALines.filter(line => {
      const by = Object.fromEntries(line.mod.decisions.map(d => [d.type, d.pick]));
      return by['CF'] === 'F';
    }).length;
    const totalSteps = totalModules + severityNeeded;

    return (
      <div className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
        {/* Question Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 shadow-md mb-8">
        <div className="mb-4 text-center">
          <h2 className="text-white text-xl font-semibold">{needSeverity.id}</h2>
        </div>
          
          <p className="text-gray-100 text-lg leading-relaxed mb-4 text-center">{severityQuestion.prompt}</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <button
            onClick={() => handleSeverityChoice('high', 1.0)}
            className="w-full p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-400 text-black font-bold flex items-center justify-center text-sm group-hover:bg-orange-300 transition-colors">
                A
              </div>
              <span className="text-gray-100 text-sm font-medium leading-relaxed">{severityQuestion.options.A}</span>
            </div>
          </button>
          
          <button
            onClick={() => handleSeverityChoice('mid', 0.5)}
            className="w-full p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-400 text-black font-bold flex items-center justify-center text-sm group-hover:bg-orange-300 transition-colors">
                B
              </div>
              <span className="text-gray-100 text-sm font-medium leading-relaxed">{severityQuestion.options.B}</span>
            </div>
          </button>
          
          {severityQuestion.options.C && (
            <button
              onClick={() => handleSeverityChoice('low', 0.0)}
              className="w-full p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-orange-400 hover:shadow-lg hover:shadow-orange-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-400 text-black font-bold flex items-center justify-center text-sm group-hover:bg-orange-300 transition-colors">
                  C
                </div>
                <span className="text-gray-100 text-sm font-medium leading-relaxed">{severityQuestion.options.C}</span>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!pendingLine) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-red-500 text-xl font-medium">THE ENGINE IS READING...</div>
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

  // Phase C always follows strict CO1 → CO2 → CF pattern
  const k = pendingLine.mod.decisions.length; // 0,1,2 (Phase C has CO1, CO2, CF questions)
  const decisionType: 'CO1' | 'CO2' | 'CF' = k === 0 ? 'CO1' : k === 1 ? 'CO2' : 'CF';
  const type = decisionType === 'CF' ? 'CF' : 'CO';
  const order = decisionType === 'CF' ? 1 : (decisionType === 'CO1' ? 1 : 2);

  // Find available questions for this line, type, and order
  // For Phase C, we need to allow CF questions from Phase B to be reused
  const availableQuestions = MODULE_QUESTIONS.filter(q => 
    q.line === pendingLine.id && 
    q.type === type && 
    q.order === order &&
    // Allow CF questions to be reused from Phase B, but not CO questions
    (q.type === 'CF' || !used.has(q.id))
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
      
      // Record SIF face votes - simple mapping: C->A, O/F->B
      const choice = pick === 'C' ? 'A' : 'B';
      const questionType = type === 'CF' ? 'CF' : 'CO';
      
      // Get the real anchored face based on family and decision type
      const anchoredFace = anchorFaceFor(pendingLine.id, decisionType as 'CO1' | 'CO2' | 'CF' | 'TIE');
      
      onRecordSIFAnswer('C', pendingLine.id, questionType, choice, anchoredFace);
      
      // Record the choice
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
    return by['CF'] === 'F';
  }).length;
  const totalSteps = totalModules + severityNeeded;

  return (
    <div key={`phase-c-${pendingLine.id}-${k}-${type}-${order}-${forceRefresh}`} className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
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
          onClick={() => handleChoice('C')}
          className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors">
              A
            </div>
            <span className="text-gray-100 text-base font-medium leading-relaxed">{question.options.A}</span>
          </div>
        </button>
        
        <button
          onClick={() => handleChoice(type === 'CO' ? 'O' : 'F')}
          className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border-2 border-gray-600 text-center hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-base group-hover:bg-yellow-300 transition-colors">
              B
            </div>
            <span className="text-gray-100 text-base font-medium leading-relaxed">{question.options.B}</span>
          </div>
        </button>
      </div>
    </div>
  );
}