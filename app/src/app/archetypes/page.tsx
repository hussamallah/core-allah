'use client'

import { useRouter } from 'next/navigation'
import { getAllArchetypeSlugs, getArchetypeBySlug } from '@/data/archetypePages'
import { PageFade } from '@/components/ui/MicroAnimationsKit'

export default function ArchetypesIndexPage() {
  const router = useRouter()
  const archetypeSlugs = getAllArchetypeSlugs()

  return (
    <PageFade>
      <div className="min-h-screen bg-brand-gray-950 text-brand-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-brand-gray-900 to-brand-gray-800 border-b border-brand-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push('/')}
                className="text-brand-gray-400 hover:text-brand-gray-100 transition-colors"
              >
                ← Back to Quiz
              </button>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-brand-amber-400">Archetype Chapters</h1>
                <p className="text-brand-gray-300 text-sm mt-1">Explore all 14 archetypes</p>
              </div>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archetypeSlugs.map((slug) => {
              const archetype = getArchetypeBySlug(slug)
              if (!archetype) return null

              return (
                <div
                  key={slug}
                  onClick={() => router.push(`/archetypes/${slug}`)}
                  className="bg-gradient-to-br from-brand-gray-800 to-brand-gray-900 rounded-xl p-6 border border-brand-gray-700 cursor-pointer hover:border-brand-amber-400 hover:shadow-lg hover:shadow-brand-amber-400/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-brand-amber-400 mb-2">
                      {archetype.name}
                    </h3>
                    <p className="text-brand-gray-300 text-sm mb-2">
                      {archetype.nickname} • {archetype.family}
                    </p>
                    <p className="text-brand-gray-400 text-xs mb-4">
                      {archetype.description}
                    </p>
                    <div className="flex justify-center">
                      <span className="px-3 py-1 bg-brand-amber-500/20 text-brand-amber-400 rounded-full text-xs font-medium">
                        {archetype.color}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-brand-amber-500 text-brand-gray-900 font-semibold rounded-lg hover:bg-brand-amber-400 transition-colors text-lg"
            >
              Take the Quiz
            </button>
          </div>
        </main>
      </div>
    </PageFade>
  )
}
