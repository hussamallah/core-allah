import React from 'react';
import { ExtractSnapshot } from '@/types/Extract';
import { resolveSIFData, getFaceVsILAnalysisText } from '../../utils/sifDataResolverNew';
import { QuizState, SIFResult } from '@/types/quiz';

interface DiagnosticsPageProps {
  extract: ExtractSnapshot | null;
  state?: QuizState;
  sifResult?: SIFResult;
  sifEngine?: any;
}

export const DiagnosticsPage: React.FC<DiagnosticsPageProps> = ({ extract, state, sifResult, sifEngine }) => {
  if (!extract || !state || !sifResult) {
    return (
      <div className="no-data bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <p className="text-gray-400">No diagnostic data available. Complete the quiz to see engine diagnostics.</p>
      </div>
    );
  }

  // Resolve all SIF data from single source of truth
  const sifData = resolveSIFData(state, sifResult, sifEngine);

  return (
    <div className="diagnostics-page">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Engine Diagnostics</h2>
      
      {/* Session Metadata */}
      <SessionMetadata extract={extract} />
      
      {/* Identity Results */}
      <IdentityResults sifData={sifData} />
      
      {/* Face Presentation */}
      <FacePresentation sifData={sifData} />
      
      {/* Face vs IL Analysis */}
      <FaceVsILAnalysis sifData={sifData} />
      
      {/* Per-Line Details */}
      <PerLineDetails sifData={sifData} />
      
      {/* Severity Probes */}
      <SeverityProbes sifData={sifData} />
      
      {/* Legacy Results */}
      <LegacyResults sifData={sifData} />
      
      {/* Export Options */}
      <ExportOptions extract={extract} />
    </div>
  );
};

const SessionMetadata: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="session-metadata bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Session Information</h3>
    <div className="session-grid grid grid-cols-2 gap-4 text-sm">
      <div className="text-gray-300">
        <span className="text-gray-400">Session ID:</span> SR-2025-001
      </div>
      <div className="text-gray-300">
        <span className="text-gray-400">Engine Version:</span> SIF Canon v3
      </div>
        <div className="text-gray-300">
        <span className="text-gray-400">Timestamp:</span> {new Date().toISOString()}
        </div>
      <div className="text-gray-300">
        <span className="text-gray-400">Total Duration:</span> {extract.timestamps.totalDuration}ms
      </div>
    </div>
  </div>
);

const IdentityResults: React.FC<{ sifData: any }> = ({ sifData }) => {
  return (
    <div className="identity-results bg-gray-900 border border-yellow-400 rounded-2xl p-6 mb-4">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">Identity Results</h3>
      
      <div className="identity-grid grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="identity-item">
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Primary (Anchor)</h4>
            <div className="text-sm text-gray-300">
              <div className="font-semibold text-white">{sifData.primary.face}</div>
              <div className="text-gray-400 mt-1">Evidence-based chosen face</div>
            </div>
          </div>
          
          <div className="identity-item">
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Prize (Mirror target)</h4>
            <div className="text-sm text-gray-300">
              <div className="font-semibold text-white">{sifData.prize.face}</div>
              <div className="text-gray-400 mt-1">Exact mirror of Primary face</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="identity-item">
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Secondary (Installed)</h4>
            <div className="text-sm text-gray-300">
              <div className="font-semibold text-white">{sifData.secondary.face}</div>
              <div className="text-gray-400 mt-1">User's installed choice from Phase D</div>
      </div>
      </div>
      
          <div className="identity-item">
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Needed for Alignment</h4>
            <div className="text-sm text-gray-300">
              <div className="font-semibold text-white">{sifData.neededForAlignment.face}</div>
              <div className="text-gray-400 mt-1">Prize if Secondary ≠ Prize</div>
            </div>
          </div>
          </div>
        </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">Alignment Status:</span>
            <span className={`ml-2 font-semibold ${sifData.aligned ? 'text-green-400' : 'text-yellow-400'}`}>
              {sifData.aligned ? 'Aligned' : 'Not yet aligned'}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {sifData.aligned ? 'Secondary = Prize' : 'Secondary ≠ Prize'}
        </div>
      </div>
    </div>
  </div>
);
};

const FacePresentation: React.FC<{ sifData: any }> = ({ sifData }) => {
  return (
    <div className="face-presentation bg-gray-900 border border-purple-500 rounded-2xl p-4 mb-4">
      <h3 className="text-lg font-bold text-purple-400 mb-3">Face Presentation</h3>
      
      <div className="presentation-grid grid grid-cols-2 gap-4">
        <div className="presentation-item">
          <h4 className="text-base font-semibold text-yellow-400 mb-2">Face Pattern</h4>
          <div className="text-sm text-gray-300">
            <div className="font-semibold text-white">{sifData.facePattern}</div>
          </div>
          </div>
          
        <div className="presentation-item">
          <h4 className="text-base font-semibold text-yellow-400 mb-2">Face Color Token</h4>
          <div className="text-sm text-gray-300">
            <div className="font-semibold text-white" style={{ color: sifData.colorToken || '#ffffff' }}>
              {sifData.colorToken}
              </div>
            </div>
        </div>
    </div>
  </div>
);
};

const FaceVsILAnalysis: React.FC<{ sifData: any }> = ({ sifData }) => {
  return (
    <div className="face-vs-il-analysis bg-gray-900 border border-purple-500 rounded-2xl p-4 mb-4">
      <h3 className="text-lg font-bold text-purple-400 mb-3">Face vs IL Analysis</h3>
      <div className="text-sm text-gray-300 mb-4">
        <p className="text-gray-400">Comparing your inner strength (Face) with outer expectations (IL):</p>
          </div>
          
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-2 text-gray-300">Face</th>
              <th className="text-left p-2 text-gray-300">Face Score</th>
              <th className="text-left p-2 text-gray-300">IL Score</th>
              <th className="text-left p-2 text-gray-300">Analysis</th>
            </tr>
          </thead>
          <tbody>
            {sifData.faceVsIL.map((item: any, index: number) => {
              const analysisColorMap: Record<string, string> = {
                'Match': 'text-green-400',
                'High IL, low Face': 'text-blue-400',
                'Low IL, high Face': 'text-orange-400',
                'Low Both': 'text-gray-400'
              };
              const analysisColor = analysisColorMap[item.label] || 'text-gray-400';
              
              return (
                <tr key={item.face} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-2 text-gray-200 font-medium">{item.face}</td>
                  <td className="p-2 text-gray-300 font-mono">{item.faceScore.toFixed(2)}</td>
                  <td className="p-2 text-gray-300 font-mono">{item.ilScore.toFixed(2)}</td>
                  <td className="p-2">
                    <div className={`${analysisColor} font-medium text-xs mb-1`}>
                      {item.label}
              </div>
                    <div className="text-gray-400 text-xs leading-relaxed">
                      {getFaceVsILAnalysisText(item.label)}
            </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
    </div>
  </div>
);
};

const PerLineDetails: React.FC<{ sifData: any }> = ({ sifData }) => {
  return (
    <div className="per-line-details bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
      <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Per-Line Details</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono min-w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-2">#</th>
              <th className="text-left py-3 px-2">Line</th>
              <th className="text-left py-3 px-2">A-line</th>
              <th className="text-left py-3 px-2">Phase B picks</th>
              <th className="text-left py-3 px-2">Module decisions</th>
              <th className="text-right py-3 px-2">Purity</th>
              <th className="text-right py-3 px-2">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {sifData.perLine.map((line: any, index: number) => (
              <tr key={line.family} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-3 px-2 font-medium text-gray-400">{index + 1}</td>
                <td className="py-3 px-2 font-medium">{line.family}</td>
                <td className="py-3 px-2">
                  {line.isALine ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 border border-green-400 text-green-400 bg-transparent rounded-full text-xs">
                      A-line
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  {line.isALine && line.phaseB ? (
                    <div className="flex gap-1 flex-wrap">
                      {line.phaseB.map((pick: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
                          {pick}
                        </span>
                      ))}
          </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  {!line.isALine && line.module ? (
                    <div className="flex gap-1 flex-wrap">
                      {line.module.map((pick: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 border border-yellow-400 text-yellow-400 bg-transparent rounded-full text-xs">
                          {pick}
                        </span>
        ))}
      </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="text-right py-3 px-2 font-mono">
                  {line.purity.toFixed(1)}
                </td>
                <td className="text-right py-3 px-2 font-mono">
                  {line.verdict}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SeverityProbes: React.FC<{ sifData: any }> = ({ sifData }) => {
  const severityProbes = sifData.severityProbes;
  
  if (severityProbes.length === 0) {
    return null;
  }
  
  return (
    <div className="severity-probes bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
      <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Severity Probes</h3>
      
      <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-yellow-400 mb-2">What Severity Probes Test:</p>
          <p className="mb-2">High-pressure situations that stress the weak line.</p>
          <div className="space-y-1 text-xs">
            <p><span className="text-green-400">Option A (C pick):</span> Shows you can still act through the line → <span className="text-yellow-400">severity light F</span> (bend, not collapse)</p>
            <p><span className="text-red-400">Option B (F pick):</span> Shows the line fails under pressure → <span className="text-red-400">severity deep F</span> (collapsed)</p>
          </div>
          <div className="mt-3 p-2 bg-gray-700 rounded border border-gray-600">
            <p className="font-semibold text-purple-400 mb-1">Foreign Archetype Creep:</p>
            <p className="text-xs">When a line fails, it reveals which <em>foreign archetype</em> takes over. Mild failures show supportive nearby archetypes; severe failures show hijacking archetypes that deny, block, or sever the line.</p>
          </div>
      </div>
    </div>
    
      <div className="space-y-4">
        {severityProbes.map((probe: any) => (
          <div key={probe.family} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{probe.family} — F verdict</h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                probe.resolved === 'Light F' 
                  ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' 
                  : 'bg-red-800 text-red-200 border border-red-600'
              }`}>
                Resolved: {probe.resolved}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              <div className="mb-1">
                <span className="text-yellow-400 font-semibold">Severity Assessment:</span> {probe.resolved === 'Light F' ? 'Light F (bend, not collapse)' : 'Deep F (collapsed)'}
              </div>
              <div className="mb-1">
                <span className="text-purple-400 font-semibold">Foreign Creep:</span> {probe.foreignCreep}
              </div>
              <div className="mb-2">
                <span className="text-gray-400">Description:</span> {probe.description}
              </div>
              <div className="mb-2">
                <span className="text-gray-400">Outcome:</span> {probe.resolved === 'Light F' ? 'Transient collapse. Context mis-sync.' : 'Structural collapse. Core crack in the line.'}
              </div>
              <div>
                <span className="text-gray-400">Action:</span> {probe.action}
              </div>
            </div>
  </div>
        ))}
      </div>
  </div>
);
};

const LegacyResults: React.FC<{ sifData: any }> = ({ sifData }) => {
  return (
    <div className="legacy-results bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
      <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Legacy Results</h3>
      
      <div className="legacy-grid grid grid-cols-2 gap-4">
        <div className="legacy-item">
          <h4 className="text-base font-semibold text-yellow-400 mb-2">7 Lines Code</h4>
          <div className="text-sm text-gray-300">
            <div className="font-mono text-white">{sifData.prizeChain}</div>
            <div className="text-gray-400 mt-1">Seven-line snapshot: C = clean, O = offset, F = fail under pressure</div>
        </div>
        </div>
        
        <div className="legacy-item">
          <h4 className="text-base font-semibold text-yellow-400 mb-2">Engine Version</h4>
          <div className="text-sm text-gray-300">
            <div className="font-semibold text-white">SIF Canon v3</div>
            <div className="text-gray-400 mt-1">Canon version used for this session</div>
        </div>
      </div>
    </div>
  </div>
);
};

const ExportOptions: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => {
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(extract, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sif-diagnostics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(extract, null, 2));
      alert('Diagnostic data copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="export-options bg-gray-900 border border-gray-700 rounded-2xl p-4">
      <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Export Options</h3>
      
      <div className="export-buttons flex gap-3">
        <button 
          onClick={exportAsJSON}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Export as JSON
        </button>
        <button 
          onClick={copyToClipboard}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
};
