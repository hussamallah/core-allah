import React from 'react';
import { ExtractSnapshot } from '@/types/Extract';

interface DiagnosticsPageProps {
  extract: ExtractSnapshot | null;
}

export const DiagnosticsPage: React.FC<DiagnosticsPageProps> = ({ extract }) => {
  if (!extract) {
    return (
      <div className="no-data bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <p className="text-gray-400">No diagnostic data available. Complete the quiz to see engine diagnostics.</p>
      </div>
    );
  }

  return (
    <div className="diagnostics-page">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Engine Diagnostics</h2>
      
      {/* Version Info */}
      <VersionInfo extract={extract} />
      
      {/* Anchor Analysis */}
      <AnchorAnalysis extract={extract} />
      
      {/* Line Paths */}
      <LinePathsAnalysis extract={extract} />
      
      {/* IL Breakdown */}
      <ILBreakdownAnalysis extract={extract} />
      
      {/* Secondary Resolution */}
      <SecondaryResolutionAnalysis extract={extract} />
      
      {/* Prize Mirror Analysis */}
      <PrizeMirrorAnalysis extract={extract} />
      
      {/* Performance Metrics */}
      <PerformanceMetrics extract={extract} />
      
      {/* Export Options */}
      <ExportOptions extract={extract} />
    </div>
  );
};

const VersionInfo: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="version-info bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">System Information</h3>
    <div className="version-grid grid grid-cols-2 gap-4 text-sm">
      <div className="text-gray-300">
        <span className="text-gray-400">Canon Version:</span> {extract.canonVersion}
      </div>
      <div className="text-gray-300">
        <span className="text-gray-400">Verdict Table:</span> {extract.verdictTableVersion}
      </div>
      {extract.buildHash && (
        <div className="text-gray-300">
          <span className="text-gray-400">Build Hash:</span> {extract.buildHash}
        </div>
      )}
      <div className="text-gray-300">
        <span className="text-gray-400">Total Duration:</span> {extract.timestamps.totalDuration}ms
      </div>
    </div>
  </div>
);

const AnchorAnalysis: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="anchor-analysis bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Anchor Selection Analysis</h3>
    <div className="anchor-details space-y-3">
      <div className="primary-info text-sm">
        <span className="text-gray-400">Selected:</span> 
        <span className="text-white font-semibold ml-2">{extract.anchor.line} ({extract.anchor.archetype})</span>
      </div>
      <div className="selection-source text-sm">
        <span className="text-gray-400">Source:</span> 
        <span className="text-white font-semibold ml-2">{extract.anchor.source}</span>
      </div>
      
      {extract.anchor.tie && (
        <div className="tie-break-details bg-gray-800 rounded-lg p-3">
          <h4 className="text-base font-semibold text-yellow-400 mb-2">Tie-Break Resolution</h4>
          <div className="text-sm space-y-1">
            <div><span className="text-gray-400">Candidates:</span> {extract.anchor.tie.candidates.join(', ')}</div>
            <div><span className="text-gray-400">Selected:</span> {extract.anchor.tie.selected}</div>
            <div><span className="text-gray-400">Reason:</span> {extract.anchor.tie.reason}</div>
          </div>
        </div>
      )}
      
      <div className="why-primary bg-gray-800 rounded-lg p-3">
        <h4 className="text-base font-semibold text-yellow-400 mb-2">Why This Primary</h4>
        <ul className="text-sm space-y-1">
          {extract.whyPrimary.evidence.map((evidence, i) => (
            <li key={i} className="text-gray-300">• {evidence}</li>
          ))}
        </ul>
        <div className="text-sm mt-2">
          <span className="text-gray-400">Strength:</span> 
          <span className="text-white font-semibold ml-2">{extract.whyPrimary.strength.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
);

const LinePathsAnalysis: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="line-paths-analysis bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Line Paths & Purity Analysis</h3>
    <div className="paths-grid grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(extract.linePaths).map(([family, path]) => (
        <div key={family} className="path-card bg-gray-800 rounded-lg p-3">
          <h4 className="text-base font-semibold text-yellow-400 mb-2">
            {family} ({path.kind === 'A' ? 'A-line' : 'Module'})
          </h4>
          
          <div className="path-details text-sm space-y-1 mb-3">
            <div><span className="text-gray-400">Decisions:</span> [{path.decisions.join(', ')}]</div>
            <div><span className="text-gray-400">Key:</span> {path.key}</div>
            <div><span className="text-gray-400">Verdict:</span> {path.verdict}</div>
            <div><span className="text-gray-400">Module Purity:</span> {path.modulePurity.toFixed(2)}</div>
          </div>
          
          <div className="counters text-sm space-y-1 mb-3">
            <div><span className="text-gray-400">C:</span> {path.counters.cCount}, 
                  <span className="text-gray-400"> O:</span> {path.counters.oCount}, 
                  <span className="text-gray-400"> F:</span> {path.counters.fCount}</div>
            <div><span className="text-gray-400">Early O:</span> {path.counters.earlyO ? 'Yes' : 'No'}</div>
            <div><span className="text-gray-400">Ended F:</span> {path.counters.endedF ? 'Yes' : 'No'}</div>
            {path.counters.seedF !== undefined && (
              <div><span className="text-gray-400">Seed F:</span> {path.counters.seedF ? 'Yes' : 'No'}</div>
            )}
          </div>
          
          {path.fProbe && (
            <div className="f-probe bg-gray-700 rounded p-2">
              <h5 className="text-sm font-semibold text-blue-400 mb-1">F-Probe Results</h5>
              <div className="text-xs space-y-1">
                <div><span className="text-gray-400">Run:</span> {path.fProbe.run ? 'Yes' : 'No'}</div>
                {path.fProbe.result && (
                  <>
                    <div><span className="text-gray-400">Result:</span> {path.fProbe.result}</div>
                    <div><span className="text-gray-400">Outcome:</span> {path.fProbe.outcomeText}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const ILBreakdownAnalysis: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="il-breakdown-analysis bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Installed Likelihood (IL) Breakdown</h3>
    <div className="il-grid grid grid-cols-1 md:grid-cols-2 gap-4">
      {extract.ilFaces.map(faceIL => (
        <div key={faceIL.face} className="il-card bg-gray-800 rounded-lg p-3">
          <h4 className="text-base font-semibold text-yellow-400 mb-2">{faceIL.face}</h4>
          <div className="il-score text-sm mb-2">
            <span className="text-gray-400">IL:</span> 
            <span className="text-white font-semibold ml-2">{faceIL.il.toFixed(2)}</span>
          </div>
          <div className="il-source text-sm mb-3">
            <span className="text-gray-400">Source:</span> 
            <span className="text-white font-semibold ml-2">{faceIL.source}</span>
          </div>
          
          <div className="breakdown-details bg-gray-700 rounded p-2">
            <h5 className="text-sm font-semibold text-blue-400 mb-2">Breakdown</h5>
            <div className="text-xs space-y-1">
              {faceIL.breakdown.cCount !== undefined && (
                <div><span className="text-gray-400">C Count:</span> {faceIL.breakdown.cCount}</div>
              )}
              {faceIL.breakdown.driftRatio !== undefined && (
                <div><span className="text-gray-400">Drift Ratio:</span> {faceIL.breakdown.driftRatio.toFixed(2)}</div>
              )}
              {faceIL.breakdown.endedF !== undefined && (
                <div><span className="text-gray-400">Ended F:</span> {faceIL.breakdown.endedF ? 'Yes' : 'No'}</div>
              )}
              {faceIL.breakdown.isCCC !== undefined && (
                <div><span className="text-gray-400">Is CCC:</span> {faceIL.breakdown.isCCC ? 'Yes' : 'No'}</div>
              )}
              {faceIL.breakdown.purityGap !== undefined && (
                <div><span className="text-gray-400">Purity Gap:</span> {faceIL.breakdown.purityGap.toFixed(2)}</div>
              )}
              
              <div className="bonuses mt-2 pt-2 border-t border-gray-600">
                <div><span className="text-gray-400">Sibling Bonus:</span> +{faceIL.breakdown.bonuses.sibling}</div>
                <div><span className="text-gray-400">Prize Bonus:</span> +{faceIL.breakdown.bonuses.prize}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SecondaryResolutionAnalysis: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="secondary-resolution-analysis bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Secondary Resolution Analysis</h3>
    
    <div className="shortlist-formation mb-4">
      <h4 className="text-base font-semibold text-yellow-400 mb-3">Shortlist Formation</h4>
      <div className="candidates-list space-y-2 mb-3">
        {extract.shortlistFormation.candidates.map(candidate => (
          <div key={candidate.face} className={`candidate p-2 rounded ${candidate.included ? 'bg-green-900/20 border border-green-500' : 'bg-gray-800 border border-gray-600'}`}>
            <div className="text-sm font-semibold">{candidate.face} (IL: {candidate.il.toFixed(2)})</div>
            <div className="text-xs text-gray-400">Family: {candidate.family}</div>
            <div className="text-xs text-gray-400">Reason: {candidate.reason}</div>
          </div>
        ))}
      </div>
      
      <div className="formation-details bg-gray-800 rounded p-3 text-sm">
        <div><span className="text-gray-400">Final Shortlist:</span> {extract.shortlistFormation.finalShortlist.join(', ')}</div>
        <div><span className="text-gray-400">Family Diversity:</span> {extract.shortlistFormation.familyDiversityCheck ? 'Yes' : 'No'}</div>
        <div><span className="text-gray-400">Pruned:</span> {extract.shortlistFormation.prunedCandidates.join(', ') || 'None'}</div>
      </div>
    </div>
    
    <div className="collision-analysis">
      <h4 className="text-base font-semibold text-yellow-400 mb-3">Collision Analysis</h4>
      <div className="bg-gray-800 rounded p-3 text-sm space-y-2">
        <div><span className="text-gray-400">Installed Choice:</span> {extract.secondary.installedChoice}</div>
        <div><span className="text-gray-400">Collision:</span> {extract.secondary.collision ? 'Yes' : 'No'}</div>
        {extract.secondary.collisionDetails && (
          <div className="collision-details bg-gray-700 rounded p-2 mt-2">
            <div><span className="text-gray-400">Anchor Face:</span> {extract.secondary.collisionDetails.anchorFace}</div>
            <div><span className="text-gray-400">Installed Face:</span> {extract.secondary.collisionDetails.installedFace}</div>
            <div><span className="text-gray-400">Downgraded To:</span> {extract.secondary.collisionDetails.downgradedTo}</div>
          </div>
        )}
        <div><span className="text-gray-400">Final Secondary:</span> {extract.secondary.resolved}</div>
      </div>
    </div>
  </div>
);

const PrizeMirrorAnalysis: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="prize-mirror-analysis bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Prize Mirror Analysis</h3>
    
    <div className="prize-details bg-gray-800 rounded p-3 text-sm space-y-2 mb-3">
      <div><span className="text-gray-400">Prize Face:</span> {extract.prize.prizeFace}</div>
      <div><span className="text-gray-400">Mirror Archetype:</span> {extract.prize.mirrorArchetype}</div>
      <div><span className="text-gray-400">Has Mirror Gain:</span> {extract.prize.hasMirrorGain ? 'Yes' : 'No'}</div>
      <div><span className="text-gray-400">Mirror Mismatch:</span> {extract.prize.mirrorMismatch ? 'Yes' : 'No'}</div>
      <div><span className="text-gray-400">Alignment Score:</span> {extract.prize.alignmentScore.toFixed(2)}</div>
    </div>
    
    {extract.prize.suggestedHabits.length > 0 && (
      <div className="suggested-habits bg-gray-800 rounded p-3">
        <h4 className="text-base font-semibold text-yellow-400 mb-2">Suggested Habits</h4>
        <ul className="text-sm space-y-1">
          {extract.prize.suggestedHabits.map((habit, i) => (
            <li key={i} className="text-gray-300">• {habit}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const PerformanceMetrics: React.FC<{ extract: ExtractSnapshot }> = ({ extract }) => (
  <div className="performance-metrics bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">Performance Metrics</h3>
    
    <div className="phase-timings">
      <h4 className="text-base font-semibold text-yellow-400 mb-3">Phase Timings</h4>
      <div className="timing-grid grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">Phase A</div>
          <div className="text-white font-semibold">{extract.timestamps.phaseA}ms</div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">Phase B</div>
          <div className="text-white font-semibold">{extract.timestamps.phaseB}ms</div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">Phase C</div>
          <div className="text-white font-semibold">{extract.timestamps.phaseC}ms</div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">Phase D</div>
          <div className="text-white font-semibold">{extract.timestamps.phaseD}ms</div>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <div className="text-gray-400">Phase E</div>
          <div className="text-white font-semibold">{extract.timestamps.phaseE}ms</div>
        </div>
        <div className="bg-gray-800 rounded p-2 border border-yellow-400">
          <div className="text-gray-400">Total</div>
          <div className="text-yellow-400 font-semibold">{extract.timestamps.totalDuration}ms</div>
        </div>
      </div>
    </div>
  </div>
);

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
