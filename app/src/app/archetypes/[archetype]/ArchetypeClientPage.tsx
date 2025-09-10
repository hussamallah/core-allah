'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArchetypePageData } from '@/data/archetypePages'
import { PageFade } from '@/components/ui/MicroAnimationsKit'
import { QuizResultsHeatMap } from '@/components/quiz/QuizResultsHeatMap'
import { QuizState } from '@/types/quiz'

interface ArchetypeClientPageProps {
  data: ArchetypePageData
  quizData?: QuizState
}

export function ArchetypeClientPage({ data, quizData }: ArchetypeClientPageProps) {
  const router = useRouter()
  const [storedQuizData, setStoredQuizData] = useState<QuizState | null>(null)

  // Load quiz data from localStorage on client side
  useEffect(() => {
    try {
      const stored = localStorage.getItem('quizResults')
      if (stored) {
        const parsedData = JSON.parse(stored) as QuizState
        setStoredQuizData(parsedData)
        console.log('📊 Loaded quiz data from localStorage for heat map')
      }
    } catch (error) {
      console.warn('⚠️ Could not load quiz data from localStorage:', error)
    }
  }, [])

  // Use stored quiz data if available, otherwise use passed quizData
  const displayQuizData = storedQuizData || quizData

  // Color mapping for archetypes
  const getArchetypeColors = (color: string) => {
    const colorMap: Record<string, any> = {
      'Gold': {
        primary: 'from-yellow-400 to-yellow-600',
        secondary: 'from-yellow-500/20 to-yellow-600/10',
        accent: 'text-yellow-400',
        border: 'border-yellow-500/30',
        bg: 'bg-yellow-500/10',
        button: 'from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500',
        shadow: 'shadow-yellow-500/20'
      },
      'Red': {
        primary: 'from-red-400 to-red-600',
        secondary: 'from-red-500/20 to-red-600/10',
        accent: 'text-red-400',
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        button: 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500',
        shadow: 'shadow-red-500/20'
      },
      'Purple': {
        primary: 'from-purple-400 to-purple-600',
        secondary: 'from-purple-500/20 to-purple-600/10',
        accent: 'text-purple-400',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        button: 'from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500',
        shadow: 'shadow-purple-500/20'
      },
      'Teal': {
        primary: 'from-teal-400 to-teal-600',
        secondary: 'from-teal-500/20 to-teal-600/10',
        accent: 'text-teal-400',
        border: 'border-teal-500/30',
        bg: 'bg-teal-500/10',
        button: 'from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500',
        shadow: 'shadow-teal-500/20'
      },
      'Green': {
        primary: 'from-green-400 to-green-600',
        secondary: 'from-green-500/20 to-green-600/10',
        accent: 'text-green-400',
        border: 'border-green-500/30',
        bg: 'bg-green-500/10',
        button: 'from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
        shadow: 'shadow-green-500/20'
      },
      'Light Blue': {
        primary: 'from-sky-400 to-sky-600',
        secondary: 'from-sky-500/20 to-sky-600/10',
        accent: 'text-sky-400',
        border: 'border-sky-500/30',
        bg: 'bg-sky-500/10',
        button: 'from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500',
        shadow: 'shadow-sky-500/20'
      },
      'Blue': {
        primary: 'from-blue-400 to-blue-600',
        secondary: 'from-blue-500/20 to-blue-600/10',
        accent: 'text-blue-400',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        button: 'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500',
        shadow: 'shadow-blue-500/20'
      },
      'Yellow': {
        primary: 'from-yellow-300 to-yellow-500',
        secondary: 'from-yellow-400/20 to-yellow-500/10',
        accent: 'text-yellow-300',
        border: 'border-yellow-400/30',
        bg: 'bg-yellow-400/10',
        button: 'from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400',
        shadow: 'shadow-yellow-400/20'
      },
      'Violet': {
        primary: 'from-violet-400 to-violet-600',
        secondary: 'from-violet-500/20 to-violet-600/10',
        accent: 'text-violet-400',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
        button: 'from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500',
        shadow: 'shadow-violet-500/20'
      },
      'Amber': {
        primary: 'from-amber-400 to-amber-600',
        secondary: 'from-amber-500/20 to-amber-600/10',
        accent: 'text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        button: 'from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500',
        shadow: 'shadow-amber-500/20'
      },
      'Pink': {
        primary: 'from-pink-400 to-pink-600',
        secondary: 'from-pink-500/20 to-pink-600/10',
        accent: 'text-pink-400',
        border: 'border-pink-500/30',
        bg: 'bg-pink-500/10',
        button: 'from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500',
        shadow: 'shadow-pink-500/20'
      },
      'Aqua': {
        primary: 'from-cyan-400 to-cyan-600',
        secondary: 'from-cyan-500/20 to-cyan-600/10',
        accent: 'text-cyan-400',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        button: 'from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500',
        shadow: 'shadow-cyan-500/20'
      },
      'Orange': {
        primary: 'from-orange-400 to-orange-600',
        secondary: 'from-orange-500/20 to-orange-600/10',
        accent: 'text-orange-400',
        border: 'border-orange-500/30',
        bg: 'bg-orange-500/10',
        button: 'from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500',
        shadow: 'shadow-orange-500/20'
      },
      'Sapphire': {
        primary: 'from-indigo-400 to-indigo-600',
        secondary: 'from-indigo-500/20 to-indigo-600/10',
        accent: 'text-indigo-400',
        border: 'border-indigo-500/30',
        bg: 'bg-indigo-500/10',
        button: 'from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500',
        shadow: 'shadow-indigo-500/20'
      }
    }
    
    return colorMap[color] || colorMap['Gold'] // Default to Gold if color not found
  }

  const colors = getArchetypeColors(data.color)

  return (
    <PageFade>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Summary
              </button>
              
              <button
                onClick={() => router.push('/archetypes')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="text-center">
              <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${colors.primary} mb-4`}>
                <h1 className="text-4xl font-bold text-white mb-2">{data.name}</h1>
                <p className="text-lg text-white/90">{data.nickname}</p>
                <p className="text-sm text-white/70">{data.family} Family</p>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium`}>
                {data.color} Archetype
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* Overview Section */}
          <section className="mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className={`text-2xl font-bold ${colors.accent} mb-6`}>Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{data.content.overview}</p>
              <div className={`p-6 rounded-xl bg-gradient-to-r ${colors.primary} bg-opacity-20 border border-white/20`}>
                <p className={`text-lg italic ${colors.accent} font-medium`}>"{data.description}"</p>
              </div>
            </div>
          </section>

          {/* Quiz Results Heat Map */}
          {displayQuizData && (
            <section className="mb-16">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className={`text-2xl font-bold ${colors.accent} mb-6`}>Your 7-Line Results</h3>
                <QuizResultsHeatMap quizState={displayQuizData} />
              </div>
            </section>
          )}

          {/* Strengths & Challenges Grid */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Strengths */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-green-400 mb-6">Strengths</h3>
                <ul className="space-y-4">
                  {data.content.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-green-400 text-sm font-bold">✓</span>
                      </div>
                      <span className="text-gray-300 leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-red-400 mb-6">Challenges</h3>
                <ul className="space-y-4">
                  {data.content.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-red-400 text-sm font-bold">⚠</span>
                      </div>
                      <span className="text-gray-300 leading-relaxed">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Growth Areas */}
          <section className="mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className={`text-2xl font-bold ${colors.accent} mb-6`}>Growth Areas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {data.content.growthAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${colors.primary} bg-opacity-20 flex items-center justify-center mt-0.5 flex-shrink-0`}>
                      <span className={`${colors.accent} text-sm font-bold`}>→</span>
                    </div>
                    <span className="text-gray-300 leading-relaxed">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Relationships */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Works Well With */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-blue-400 mb-6">Works Well With</h3>
                <div className="flex flex-wrap gap-3">
                  {data.content.relationships.worksWellWith.map((archetype, index) => (
                    <span key={index} className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                      {archetype}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conflicts With */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-orange-400 mb-6">May Conflict With</h3>
                <div className="flex flex-wrap gap-3">
                  {data.content.relationships.conflictsWith.map((archetype, index) => (
                    <span key={index} className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
                      {archetype}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Career Paths */}
          <section className="mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className={`text-2xl font-bold ${colors.accent} mb-6`}>Career Paths</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {data.content.careerPaths.map((path, index) => (
                  <div key={index} className={`p-6 bg-gradient-to-r ${colors.primary} bg-opacity-10 rounded-xl border border-white/20 hover:bg-opacity-20 transition-all duration-200`}>
                    <span className="text-gray-300 font-medium">{path}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Daily Practices */}
          <section className="mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-purple-400 mb-6">Daily Practices</h3>
              <div className="space-y-4">
                {data.content.dailyPractices.map((practice, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5 flex-shrink-0 border border-purple-500/30">
                      <span className="text-purple-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-300 leading-relaxed">{practice}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quotes */}
          <section className="mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className={`text-2xl font-bold ${colors.accent} mb-6`}>Inspiration</h3>
              <div className="space-y-6">
                {data.content.quotes.map((quote, index) => (
                  <blockquote key={index} className={`text-gray-300 italic text-lg leading-relaxed border-l-4 ${colors.accent.replace('text-', 'border-')} pl-6 py-4 bg-white/5 rounded-r-xl`}>
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="text-center">
            <button
              onClick={() => router.push('/')}
              className={`px-8 py-4 bg-gradient-to-r ${colors.button} text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 text-lg shadow-lg`}
            >
              Take the Quiz Again
            </button>
          </section>
        </main>
      </div>
    </PageFade>
  )
}
