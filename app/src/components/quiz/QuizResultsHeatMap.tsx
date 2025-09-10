'use client'

import { QuizState } from '@/types/quiz'

interface QuizResultsHeatMapProps {
  quizState: QuizState
  className?: string
}

export function QuizResultsHeatMap({ quizState, className = '' }: QuizResultsHeatMapProps) {
  // Safety checks
  if (!quizState) {
    return <div className="text-red-400 p-4">No quiz data available</div>
  }

  const { lines, sifResult } = quizState
  
  if (!lines || !Array.isArray(lines)) {
    return <div className="text-red-400 p-4">Invalid quiz data structure</div>
  }

  if (!sifResult) {
    return <div className="text-red-400 p-4">No SIF results available</div>
  }

  const { primary, secondary } = sifResult

  // Get the 7 families in order
  const families = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress']
  
  // Calculate line results
  const lineResults = families.map(family => {
    const line = lines.find(l => l.id === family)
    if (!line) return null

    // Get A-line picks if this line was selected as A-line
    const aLinePicks = line.selectedA ? (line.B?.picks || []) : []
    
    // Get module picks if this line was not selected as A-line
    const modulePicks = !line.selectedA ? (line.C?.picks || []) : []
    
    // Ensure we have valid arrays
    const validALinePicks = Array.isArray(aLinePicks) ? aLinePicks : []
    const validModulePicks = Array.isArray(modulePicks) ? modulePicks : []
    
    // Calculate verdict
    let verdict = 'N/A'
    
    if (line.selectedA && validALinePicks.length >= 2) {
      // A-line verdict: if both picks are C, verdict is C; otherwise O
      const pick1 = validALinePicks[0]
      const pick2 = validALinePicks[1]
      verdict = (pick1 === 'C' && pick2 === 'C') ? 'C' : 'O'
    } else if (!line.selectedA && validModulePicks.length >= 3) {
      // Module verdict: count C picks
      const cCount = validModulePicks.filter(pick => pick === 'C').length
      verdict = cCount >= 2 ? 'C' : cCount === 1 ? 'O' : 'F'
    }

    // Check if this is the primary or secondary
    const isPrimary = primary?.family === family
    const isSecondary = secondary?.family === family

    return {
      family,
      verdict,
      isPrimary,
      isSecondary,
      face: isPrimary ? primary?.face : isSecondary ? secondary?.face : null
    }
  }).filter(Boolean)

  // Color mapping for verdicts
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'C':
        return 'bg-green-500'
      case 'O':
        return 'bg-yellow-500'
      case 'F':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lineResults.map((result, index) => {
          if (!result) return null
          
          return (
            <div
              key={result.family}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                result.isPrimary
                  ? 'border-amber-500 bg-amber-500/10'
                  : result.isSecondary
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-gray-600 bg-gray-800/50'
              }`}
            >
              {/* Family Name with Color */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded ${getVerdictColor(result.verdict)}`}></div>
                <h4 className="text-lg font-bold text-white">{result.family}</h4>
                {result.isPrimary && (
                  <span className="text-xs text-amber-400 font-semibold bg-amber-500/20 px-2 py-1 rounded-full">PRIMARY</span>
                )}
                {result.isSecondary && (
                  <span className="text-xs text-teal-400 font-semibold bg-teal-500/20 px-2 py-1 rounded-full">SECONDARY</span>
                )}
              </div>

              {/* Space for text content */}
              <div className="space-y-2 text-sm text-gray-300">
                <p>This is where detailed text about {result.family} would go.</p>
                <p>You can add lots of content here explaining the results and what they mean for this family line.</p>
                <p>More detailed analysis and insights can be provided in this space.</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
