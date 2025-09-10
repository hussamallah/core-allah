import { getArchetypeBySlug, getAllArchetypeSlugs } from '@/data/archetypePages'
import { ArchetypePageData } from '@/data/archetypePages'
import { ArchetypeClientPage } from './ArchetypeClientPage'

interface ArchetypePageProps {
  params: Promise<{
    archetype: string
  }>
}

export default async function ArchetypePage({ params }: ArchetypePageProps) {
  const resolvedParams = await params
  const archetypeData = getArchetypeBySlug(resolvedParams.archetype)

  if (!archetypeData) {
    return (
      <div className="min-h-screen bg-brand-gray-950 text-brand-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-amber-400 mb-4">Archetype Not Found</h1>
          <p className="text-brand-gray-300 mb-6">The archetype you're looking for doesn't exist.</p>
          <a
            href="/"
            className="px-6 py-3 bg-brand-amber-500 text-brand-gray-900 font-semibold rounded-lg hover:bg-brand-amber-400 transition-colors inline-block"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return <ArchetypeClientPage data={archetypeData} />
}

// Generate static params for all archetypes
export async function generateStaticParams() {
  const slugs = getAllArchetypeSlugs()
  return slugs.map((slug) => ({
    archetype: slug,
  }))
}

