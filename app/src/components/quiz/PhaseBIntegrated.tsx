import React from 'react';
import { QuizState } from '@/types/quiz';
import { PhaseB } from './PhaseB';
import { PhaseBEnhanced } from './PhaseBEnhanced';
import { phaseBIntegration } from '@/integration/phaseBIntegration';

interface PhaseBIntegratedProps {
  state: QuizState;
  onChoice: (lineId: string, choice: string) => void;
  onProceedToC: () => void;
  onAddUsedQuestion: (questionId: string) => void;
  onAddQuestionToHistory: (phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary', lineId: string, questionId: string, choice: string) => void;
  onRecordSIFAnswer: (phase: 'B' | 'C', family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace?: string) => void; // DEPRECATED
  onRecordSIFAnswerWithEffects: (question: any, choice: 'A' | 'B' | 'C', family: string) => void; // NEW
  onSeveritySelect?: (lineId: string, level: 'high' | 'mid' | 'low', score: 1.0 | 0.5 | 0.0) => void;
}

export function PhaseBIntegrated(props: PhaseBIntegratedProps) {
  const config = phaseBIntegration.getConfig();
  const status = phaseBIntegration.getStatus();

  // Log integration status for debugging
  React.useEffect(() => {
    console.log('🔍 Phase B Integration Status:', status);
  }, [status]);

  // Use enhanced version if enabled and features are supported
  if (config.useEnhancedQuestions && config.enableSimulatorFeatures && phaseBIntegration.isEnhancedAvailable()) {
    console.log('🚀 Using Enhanced Phase B');
    return <PhaseBEnhanced {...props} />;
  }

  // Fallback to legacy version
  console.log('📜 Using Legacy Phase B');
  return <PhaseB {...props} />;
}

// Export for easy migration
export { PhaseB as PhaseBLegacy } from './PhaseB';
export { PhaseBEnhanced } from './PhaseBEnhanced';
