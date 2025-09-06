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
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E', lineId: string, questionId: string, choice: string) => void;
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
      }, 1000);
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
        <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
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
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="mb-6">
          <strong className="text-white text-2xl">{needSeverity.id}</strong>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600 mb-8">
          <p className="text-white mb-6 text-2xl leading-relaxed font-bold">{severityQuestion.prompt}</p>
          <div className="space-y-4">
            <div 
              onClick={() => handleSeverityChoice('high', 1.0)}
              className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">A:</strong> <span className="text-xl font-bold">{severityQuestion.options.A}</span>
            </div>
            <div 
              onClick={() => handleSeverityChoice('mid', 0.5)}
              className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">B:</strong> <span className="text-xl font-bold">{severityQuestion.options.B}</span>
            </div>
            {severityQuestion.options.C && (
              <div 
                onClick={() => handleSeverityChoice('low', 0.0)}
                className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <strong className="text-yellow-400 text-xl">C:</strong> <span className="text-xl font-bold">{severityQuestion.options.C}</span>
              </div>
            )}
          </div>
        </div>
        
      </div>
    );
  }

  if (!pendingLine) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-yellow-400 text-xl font-medium">Proceeding to Phase D…</div>
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
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
        <div className="text-red-400 text-xl font-medium">Error: Line {pendingLine.id} has {pendingLine.mod.decisions.length} decisions but still pending. Please restart.</div>
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
    <div key={`phase-c-${pendingLine.id}-${k}-${type}-${order}-${forceRefresh}`} className="bg-gray-900 rounded-xl p-8 min-h-[500px]">

      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <div className="mb-6">
          <strong className="text-white text-2xl">{pendingLine.id}</strong> — <span className="text-yellow-400 text-xl">{decisionType}</span>
        </div>

        <div className="mb-8">
          <p className="text-ivory mb-6 text-2xl leading-relaxed font-bold">{question.prompt}</p>
          <div className="space-y-4">
            <div 
              onClick={() => handleChoice('C')}
              className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">A:</strong> <span className="text-xl font-bold">{question.options.A}</span>
            </div>
            <div 
              onClick={() => handleChoice(type === 'CO' ? 'O' : 'F')}
              className="text-ivory p-4 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 hover:border-yellow-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <strong className="text-yellow-400 text-xl">B:</strong> <span className="text-xl font-bold">{question.options.B}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}