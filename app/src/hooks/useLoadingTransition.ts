import { useState, useCallback } from 'react';

export type LoadingPhase = 'home-to-a' | 'a-to-b' | 'b-to-c' | 'c-to-d' | 'd-to-e' | 'final-result';

interface UseLoadingTransitionReturn {
  isLoading: boolean;
  currentPhase: LoadingPhase | null;
  showLoading: (phase: LoadingPhase) => void;
  hideLoading: () => void;
}

export const useLoadingTransition = (): UseLoadingTransitionReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<LoadingPhase | null>(null);

  const showLoading = useCallback((phase: LoadingPhase) => {
    setCurrentPhase(phase);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setCurrentPhase(null);
  }, []);

  return {
    isLoading,
    currentPhase,
    showLoading,
    hideLoading
  };
};
