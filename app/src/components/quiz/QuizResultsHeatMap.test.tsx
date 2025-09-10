'use client'

import { QuizResultsHeatMap } from './QuizResultsHeatMap'
import { QuizState } from '@/types/quiz'

// Mock quiz state for testing
const mockQuizState: QuizState = {
  phase: 'summary',
  lines: [
    {
      id: 'Control',
      selectedA: true,
      B: { picks: ['C', 'C'] },
      C: { picks: [] }
    },
    {
      id: 'Pace', 
      selectedA: true,
      B: { picks: ['C', 'O'] },
      C: { picks: [] }
    },
    {
      id: 'Boundary',
      selectedA: false,
      B: { picks: [] },
      C: { picks: ['C', 'C', 'C'] }
    },
    {
      id: 'Truth',
      selectedA: false,
      B: { picks: [] },
      C: { picks: ['O', 'F', 'C'] }
    },
    {
      id: 'Recognition',
      selectedA: false,
      B: { picks: [] },
      C: { picks: ['F', 'F', 'F'] }
    },
    {
      id: 'Bonding',
      selectedA: false,
      B: { picks: [] },
      C: { picks: ['C', 'O', 'O'] }
    },
    {
      id: 'Stress',
      selectedA: false,
      B: { picks: [] },
      C: { picks: ['O', 'O', 'O'] }
    }
  ],
  sifResult: {
    primary: { family: 'Control', face: 'Control:Sovereign' },
    secondary: { family: 'Recognition', face: 'Recognition:Diplomat' },
    badge: 'C',
    context: {}
  },
  usedQuestions: [],
  questionHistory: []
}

export function QuizResultsHeatMapTest() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Heat Map Test</h1>
      <QuizResultsHeatMap quizState={mockQuizState} />
    </div>
  )
}
