import React from 'react';
import { QuizLine } from '@/types/quiz';

interface SeveritySelectorProps {
  line: QuizLine;
  onSelect: (severity: 'high' | 'mid' | 'low', score: 1.0 | 0.5 | 0.0) => void;
}

export function SeveritySelector({ line, onSelect }: SeveritySelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <strong className="text-gray-900">{line.id}</strong> — Severity for F
      </div>
      <p className="text-gray-600 mb-4">
        Pick severity: <code className="bg-gray-100 px-1 rounded text-sm">F1</code> (high),{' '}
        <code className="bg-gray-100 px-1 rounded text-sm">F0.5</code> (mid),{' '}
        <code className="bg-gray-100 px-1 rounded text-sm">F0</code> (low).
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => onSelect('high', 1.0)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          F1 (high)
        </button>
        <button
          onClick={() => onSelect('mid', 0.5)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          F0.5 (mid)
        </button>
        <button
          onClick={() => onSelect('low', 0.0)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          F0 (low)
        </button>
      </div>
    </div>
  );
}
