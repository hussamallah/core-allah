import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
}

export function ProgressBar({ progress, total }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round((progress / total) * 100)));
  const isComplete = progress >= total;

  return (
    <div className="w-full animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-brand-gray-300">Progress</span>
        <span className="text-sm font-medium text-brand-gray-300">{progress}/{total}</span>
      </div>
      
      {/* Chunked progress markers */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              i < progress
                ? isComplete 
                  ? 'bg-brand-gold-300 shadow-glow animate-pulse' 
                  : 'bg-brand-gold-400 shadow-brand'
                : 'bg-brand-gray-700 border border-brand-gray-600'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-brand-gray-800 w-full rounded-full overflow-hidden border border-brand-gray-600">
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            isComplete 
              ? 'bg-gradient-brand shadow-glow-lg animate-pulse-glow' 
              : 'bg-gradient-brand shadow-brand'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className={`text-sm mt-2 text-center transition-all duration-300 ${
        isComplete 
          ? 'text-brand-gold-300 font-semibold animate-pulse' 
          : 'text-brand-gray-400'
      }`}>
        {isComplete ? 'Complete!' : `${percentage}% complete`}
      </div>
    </div>
  );
}
