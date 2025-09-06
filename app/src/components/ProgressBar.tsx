import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
}

export function ProgressBar({ progress, total }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round((progress / total) * 100)));
  const isComplete = progress >= total;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-300">Progress</span>
        <span className="text-sm font-medium text-gray-300">{progress}/{total}</span>
      </div>
      
      {/* Chunked progress markers */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < progress
                ? isComplete 
                  ? 'bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.8)]' 
                  : 'bg-yellow-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                : 'bg-gray-700 border border-gray-600'
            }`}
          />
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-800 w-full rounded-full overflow-hidden border border-gray-600">
        <div 
          className={`h-full transition-all duration-500 ease-out ${
            isComplete 
              ? 'bg-gradient-to-r from-yellow-300 to-yellow-200 shadow-[0_0_15px_rgba(253,224,71,0.8)]' 
              : 'bg-gradient-to-r from-yellow-300 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className={`text-sm mt-2 text-center ${isComplete ? 'text-yellow-300 font-semibold' : 'text-gray-400'}`}>
        {isComplete ? 'Complete!' : `${percentage}% complete`}
      </div>
    </div>
  );
}
