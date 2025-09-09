import React from 'react';
import { QuizEngine } from './QuizEngine';
import QuizWithLoading from './quiz/QuizWithLoading';
import { useQuizEngine } from '@/hooks/useQuizEngine';

export function QuizEngineWithLoading() {
  const { state } = useQuizEngine();

  return (
    <QuizWithLoading currentPhase={state.phase}>
      <QuizEngine />
    </QuizWithLoading>
  );
}
