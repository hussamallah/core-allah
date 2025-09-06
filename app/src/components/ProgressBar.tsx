import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
}

export function ProgressBar({ progress, total }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round((progress / total) * 100)));
  const isComplete = progress >= total;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Progress</span>
        <span className="text-sm font-medium text-gray-300">{progress}/{total}</span>
      </div>
      <div className="h-3 bg-gray-800 w-full rounded-full overflow-hidden border border-gray-600">
        <div 
          className={`h-full transition-all duration-300 ease-out ${
            isComplete 
              ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
              : 'bg-gradient-to-r from-yellow-300 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {percentage}% complete
      </div>
    </div>
  );
}
