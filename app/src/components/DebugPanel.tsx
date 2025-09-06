/**
 * Debug Panel for QA Visibility
 * 
 * Contract: Show current state, verdicts, and purity for each line
 * Include final key string and computed values
 */

import React, { useState, useEffect } from 'react';
import { QuizState } from '@/types/quiz';

interface DebugPanelProps {
  state: QuizState;
  phaseBEngine?: any; // PhaseBEngine instance
  phaseCEngine?: any; // PhaseCEngine instance
  isVisible: boolean;
  onToggle: () => void;
}

export function DebugPanel({ state, phaseBEngine, phaseCEngine, isVisible, onToggle }: DebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  useEffect(() => {
    if (phaseBEngine || phaseCEngine) {
      const info = {
        phaseB: phaseBEngine?.getDebugInfo(),
        phaseC: phaseCEngine?.getDebugInfo(),
        quizState: {
          phase: state.phase,
          usedQuestions: state.usedQuestions.length,
          questionHistory: state.questionHistory.length,
          lines: state.lines.map(l => ({
            id: l.id,
            selectedA: l.selectedA,
            verdict: l.verdict,
            modDecisions: l.mod.decisions,
            bPicks: l.B.picks
          }))
        }
      };
      setDebugInfo(info);
    }
  }, [state, phaseBEngine, phaseCEngine]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg border border-gray-600 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Debug Panel</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Quiz State */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2">Quiz State</h4>
          <div className="bg-gray-800 p-2 rounded text-xs">
            <div>Phase: {state.phase}</div>
            <div>Used Questions: {state.usedQuestions.length}</div>
            <div>History: {state.questionHistory.length}</div>
          </div>
        </div>

        {/* Phase B Debug Info */}
        {debugInfo?.phaseB && (
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Phase B (A-lines)</h4>
            <div className="bg-gray-800 p-2 rounded text-xs">
              <div>Current Line: {debugInfo.phaseB.currentLine || 'None'}</div>
              <div>Completed: {debugInfo.phaseB.completedLines.join(', ') || 'None'}</div>
              <div className="mt-2">
                <div className="font-semibold">Line Picks:</div>
                {debugInfo.phaseB.linePicks.map((pick: any, index: number) => (
                  <div key={index} className="ml-2">
                    {pick.lineId}: {pick.pick1} → {pick.pick2} (Purity: {pick.purity?.toFixed(2) || 'N/A'})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase C Debug Info */}
        {debugInfo?.phaseC && (
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Phase C (Non-A lines)</h4>
            <div className="bg-gray-800 p-2 rounded text-xs">
              <div>Current Line: {debugInfo.phaseC.currentLine || 'None'}</div>
              <div>Completed: {debugInfo.phaseC.completedLines.join(', ') || 'None'}</div>
              <div>Pending Severity: {debugInfo.phaseC.pendingSeverity || 'None'}</div>
              <div className="mt-2">
                <div className="font-semibold">Line Decisions:</div>
                {debugInfo.phaseC.lineDecisions.map((decision: any, index: number) => (
                  <div key={index} className="ml-2">
                    {decision.lineId}: {decision.co1} + {decision.co2} + {decision.cf} 
                    → {decision.verdict || 'Pending'}
                    {decision.severity && ` (${decision.severity.level}: ${decision.severity.score})`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Line States */}
        <div>
          <h4 className="font-semibold text-yellow-400 mb-2">Line States</h4>
          <div className="bg-gray-800 p-2 rounded text-xs">
            {debugInfo?.quizState.lines.map((line: any, index: number) => (
              <div key={index} className="mb-2 border-b border-gray-700 pb-2 last:border-b-0">
                <div className="font-semibold">{line.id} {line.selectedA ? '(A-line)' : '(Non-A)'}</div>
                <div>Verdict: {line.verdict || 'Pending'}</div>
                {line.modDecisions.length > 0 && (
                  <div>Mod Decisions: {line.modDecisions.map((d: any) => `${d.type}=${d.pick}`).join(', ')}</div>
                )}
                {line.bPicks.length > 0 && (
                  <div>B Picks: {line.bPicks.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Performance</h4>
            <div className="bg-gray-800 p-2 rounded text-xs">
              <div>Avg Lookup: {performanceMetrics.averageLookupTime?.toFixed(2)}ms</div>
              <div>Memory: {(performanceMetrics.memoryUsage / 1024).toFixed(1)}KB</div>
              <div>Telemetry: {performanceMetrics.telemetryEvents}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}