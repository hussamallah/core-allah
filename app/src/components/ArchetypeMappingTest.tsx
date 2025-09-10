'use client'

import { getAllArchetypeSlugs, getArchetypeBySlug } from '@/data/archetypePages'

export function ArchetypeMappingTest() {
  const testFaces = [
    'Control:Sovereign',
    'Control:Rebel', 
    'Pace:Visionary',
    'Pace:Navigator',
    'Boundary:Equalizer',
    'Boundary:Guardian',
    'Truth:Seeker',
    'Truth:Architect',
    'Recognition:Spotlight',
    'Recognition:Diplomat',
    'Bonding:Partner',
    'Bonding:Provider',
    'Stress:Catalyst',
    'Stress:Artisan'
  ]

  const getArchetypeSlug = (face: string): string => {
    const archetype = face.split(':')[1];
    return archetype.toLowerCase();
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-yellow-400 mb-4">Archetype Mapping Test</h3>
      <div className="space-y-2 text-sm">
        {testFaces.map((face) => {
          const slug = getArchetypeSlug(face);
          const archetype = getArchetypeBySlug(slug);
          const exists = !!archetype;
          
          return (
            <div key={face} className={`flex items-center gap-2 ${exists ? 'text-green-400' : 'text-red-400'}`}>
              <span className="font-mono">{face}</span>
              <span>→</span>
              <span className="font-mono">/archetypes/{slug}</span>
              <span>{exists ? '✅' : '❌'}</span>
              {exists && <span className="text-gray-400">({archetype.name})</span>}
            </div>
          );
        })}
      </div>
    </div>
  )
}
