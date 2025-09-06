import React, { useEffect, useState, useRef } from 'react';
import { QuizState } from '@/types/quiz';
import { phaseDEngine } from '@/engine/PhaseD';
import { quizRecorder } from '@/utils/QuizRecorder';
import { SIFEngine } from '@/engine/SIFEngine';

interface PhaseDProps {
  state: QuizState;
  onSIFCalculate: (primaryFamily: string, primaryFace: string, prizeFace?: string) => any;
  onRecordAllSIFData: (quizData: any, primaryFamily: string, primaryFace: string) => void;
  onProceedToE: () => void;
  onSetSIFShortlist: (shortlist: string[]) => void;
  onSetInstalledChoice: (choice: string) => void;
}

export default function PhaseD({ 
  state, 
  onSIFCalculate, 
  onRecordAllSIFData, 
  onProceedToE,
  onSetSIFShortlist,
  onSetInstalledChoice 
}: PhaseDProps) {
  const [hasComputed, setHasComputed] = useState(false);
  const [shortlist, setShortlist] = useState<string[] | null>(null);
  const [installedStatements, setInstalledStatements] = useState<Array<{
    faceId: string;
    statement: string;
    label: string;
    family: string;
    cues: string[];
  }> | null>(null);
  const [installed, setInstalled] = useState<string | null>(null);
  const [sifEngine] = useState(() => new SIFEngine());
  const didCommit = useRef(false);

  // Phase D: Compute verdicts and build install shortlist
  useEffect(() => {
    if (didCommit.current) {
      console.log('🎯 PHASE D - Already committed, skipping');
      return;
    }

    console.log('🎯 PHASE D - Computing verdicts with deterministic table');
    console.log('🎯 PHASE D - State lines:', state.lines.map(l => ({ id: l.id, selectedA: l.selectedA, picks: l.B?.picks, decisions: l.mod?.decisions })));
    
    const verdicts = phaseDEngine.computeVerdicts(state.lines);
    console.log('🎯 PHASE D - Verdicts computed:', verdicts);
    
    // Note: Verdicts are computed for display purposes only
    // They should NOT be automatically recorded as user interactions
    // Only record when user actually makes choices that trigger verdict calculations
    
    console.log('🎯 PHASE D - Verdicts computed for display (not recorded as user interactions)');
    
    // Build install shortlist
    // Get A-line faces (selected A lines)
    const a26Faces: string[] = state.lines
      .filter(line => line.selectedA)
      .map(line => `${line.id}:${line.B?.picks?.[0] || 'Unknown'}`);
    
    // Get module top families (non-A lines)
    const moduleTopFamilies: string[] = state.lines
      .filter(line => !line.selectedA)
      .map(line => line.id);
    
    console.log('PHASE D - A26 faces:', a26Faces);
    console.log('PHASE D - Module top families:', moduleTopFamilies);
    
    const installShortlist = sifEngine.buildPhaseDInstallShortlist(state, a26Faces, moduleTopFamilies);
    setShortlist(installShortlist);
    onSetSIFShortlist(installShortlist);
    
    // Generate installed statements for better UX
    const statements = sifEngine.getInstalledStatements(installShortlist);
    setInstalledStatements(statements);
    
    setHasComputed(true);
    didCommit.current = true;
  }, []); // Empty dependency array - only run once on mount

  const handleInstallChoice = (faceId: string) => {
    console.log('PHASE D - USER INSTALLED PICK:', faceId);
    setInstalled(faceId);
    onSetInstalledChoice(faceId);
    
    // Record the install choice to QuizRecorder
    quizRecorder.recordQuestionAnswer('D', 'install', 'install-choice', faceId, {
      choice: faceId,
      shortlist: shortlist || []
    });
  };

  const handleProceed = () => {
    console.log('🎯 PHASE D - Proceeding to Phase E');
    onProceedToE();
  };

  if (!hasComputed) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-2xl font-bold mb-4">Phase D — Computing Verdicts</div>
          <div className="text-gray-200 text-lg mb-6">Using deterministic verdict table...</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!installedStatements || installedStatements.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-2xl font-bold mb-4">Phase D — Error</div>
          <div className="text-gray-200 text-lg mb-6">No install options available</div>
          <button
            onClick={handleProceed}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-8 min-h-[500px]">
      <div className="text-center mb-8">
        <div className="text-gray-200 text-lg mb-6">
          Which role do you actually get installed into most often by people and context?
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {installedStatements.map(statement => (
          <button
            key={statement.faceId}
            className={`rounded-xl p-6 border-2 transition-all text-left ${
              installed === statement.faceId 
                ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400' 
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800'
            }`}
            onClick={() => handleInstallChoice(statement.faceId)}
          >
            <div className="text-white text-lg font-medium mb-2">
              {statement.statement.replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button
          disabled={!installed}
          onClick={handleProceed}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            installed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue to Phase E
        </button>
      </div>
    </div>
  );
}