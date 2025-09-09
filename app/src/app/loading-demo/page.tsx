'use client';

import React, { useState } from 'react';
import LoadingScreen from '@/components/quiz/LoadingScreen';
import { LoadingPhase } from '@/hooks/useLoadingTransition';

export default function LoadingDemo() {
  const [currentPhase, setCurrentPhase] = useState<LoadingPhase | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const phases: LoadingPhase[] = [
    'home-to-a',
    'a-to-b', 
    'b-to-c',
    'c-to-d',
    'd-to-e',
    'final-result'
  ];

  const showLoading = (phase: LoadingPhase) => {
    setCurrentPhase(phase);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setCurrentPhase(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Loading Screen Demo
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {phases.map((phase) => (
            <button
              key={phase}
              onClick={() => showLoading(phase)}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              {phase.replace('-', ' → ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="text-center text-gray-400">
          <p>Click any button above to see the loading screen for that phase transition.</p>
          <p className="text-sm mt-2">All screens show for 10 seconds. Double-click to skip.</p>
        </div>
      </div>

      {isLoading && currentPhase && (
        <LoadingScreen
          phase={currentPhase}
          onComplete={hideLoading}
          duration={10000}
        />
      )}
    </div>
  );
}
