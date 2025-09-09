import React, { useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import { useLoadingTransition, LoadingPhase } from '@/hooks/useLoadingTransition';

interface QuizWithLoadingProps {
  children: React.ReactNode;
  currentPhase: string;
  onPhaseChange?: (phase: string) => void;
}

const QuizWithLoading: React.FC<QuizWithLoadingProps> = ({ 
  children, 
  currentPhase, 
  onPhaseChange 
}) => {
  const { isLoading, currentPhase: loadingPhase, showLoading, hideLoading } = useLoadingTransition();

  // Map quiz phases to loading phases
  const getLoadingPhase = (phase: string): LoadingPhase | null => {
    switch (phase) {
      case 'A':
        return 'home-to-a';
      case 'B':
        return 'a-to-b';
      case 'C':
        return 'b-to-c';
      case 'D':
        return 'c-to-d';
      case 'E':
        return 'd-to-e';
      case 'summary':
        return 'final-result';
      default:
        return null;
    }
  };

  // Show loading screen when phase changes
  useEffect(() => {
    const loadingPhase = getLoadingPhase(currentPhase);
    if (loadingPhase) {
      showLoading(loadingPhase);
    }
  }, [currentPhase, showLoading]);

  const handleLoadingComplete = () => {
    hideLoading();
    onPhaseChange?.(currentPhase);
  };

  return (
    <>
      {children}
      {isLoading && loadingPhase && (
        <LoadingScreen
          phase={loadingPhase}
          onComplete={handleLoadingComplete}
          duration={3000}
        />
      )}
    </>
  );
};

export default QuizWithLoading;
