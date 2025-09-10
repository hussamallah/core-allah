import React from 'react';
import { DUEL_QUESTIONS, MODULE_QUESTIONS } from '@/data/questions';

interface SemanticTagsDebugProps {
  question?: any;
  choice?: 'A' | 'B';
}

export function SemanticTagsDebug({ question, choice }: SemanticTagsDebugProps) {
  if (!question || !choice) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-yellow-400 text-lg font-bold mb-2">🔍 Semantic Tags Debug</h3>
        <p className="text-gray-300 text-sm">Select a question and choice to see semantic tags</p>
      </div>
    );
  }

  // Get semantic tags for the choice from unified question structure
  const optionIndex = choice === 'A' ? 0 : 1;
  const option = question.options[optionIndex];
  
  if (!option) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-yellow-400 text-lg font-bold mb-2">🔍 Semantic Tags Debug</h3>
        <p className="text-red-400 text-sm">No option found for choice {choice}</p>
      </div>
    );
  }

  // Extract semantic tags from the option
  const tags = {
    behavior: option.behavior,
    context: option.context,
    sif_signals: option.sif_signals,
    il_factors: option.il_factors,
    psychology: option.psychology,
    relationships: option.relationships
  };
  
  if (!tags.behavior && !tags.context && !tags.sif_signals) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-yellow-400 text-lg font-bold mb-2">🔍 Semantic Tags Debug</h3>
        <p className="text-red-400 text-sm">No semantic tags found for {question.id} choice {choice}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-yellow-400 text-lg font-bold mb-3">🔍 Semantic Tags Debug</h3>
      <div className="text-gray-300 text-sm mb-2">
        <strong>Question:</strong> {question.id} | <strong>Choice:</strong> {choice}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Behavior Tags */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-blue-400 font-semibold mb-2">Behavior</h4>
          <div className="text-xs space-y-1">
            <div><strong>Primary:</strong> {tags.behavior?.primary || 'N/A'}</div>
            <div><strong>Secondary:</strong> {tags.behavior?.secondary || 'N/A'}</div>
            <div><strong>Energy:</strong> {tags.behavior?.energy || 'N/A'}</div>
            <div><strong>Approach:</strong> {tags.behavior?.approach || 'N/A'}</div>
          </div>
        </div>

        {/* Context Tags */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-green-400 font-semibold mb-2">Context</h4>
          <div className="text-xs space-y-1">
            <div><strong>Situation:</strong> {tags.context?.situation || 'N/A'}</div>
            <div><strong>Pressure:</strong> {tags.context?.pressure || 'N/A'}</div>
            <div><strong>Social Dynamic:</strong> {tags.context?.social_dynamic || 'N/A'}</div>
            <div><strong>Time Urgency:</strong> {tags.context?.time_urgency || 'N/A'}</div>
          </div>
        </div>

        {/* SIF Signals */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-purple-400 font-semibold mb-2">SIF Signals</h4>
          <div className="text-xs space-y-1">
            <div><strong>Alignment:</strong> {tags.sif_signals?.alignment_strength?.toFixed(2) || 'N/A'}</div>
            <div><strong>Wobble Factor:</strong> {tags.sif_signals?.wobble_factor?.toFixed(2) || 'N/A'}</div>
            <div><strong>Override Potential:</strong> {tags.sif_signals?.override_potential?.toFixed(2) || 'N/A'}</div>
            <div><strong>Face Credibility:</strong> {tags.sif_signals?.face_credibility?.toFixed(2) || 'N/A'}</div>
          </div>
        </div>

        {/* IL Factors */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-orange-400 font-semibold mb-2">IL Factors</h4>
          <div className="text-xs space-y-1">
            <div><strong>Natural Instinct:</strong> {tags.il_factors?.natural_instinct?.toFixed(2) || 'N/A'}</div>
            <div><strong>Situational Fit:</strong> {tags.il_factors?.situational_fit?.toFixed(2) || 'N/A'}</div>
            <div><strong>Social Expectation:</strong> {tags.il_factors?.social_expectation?.toFixed(2) || 'N/A'}</div>
            <div><strong>Internal Consistency:</strong> {tags.il_factors?.internal_consistency?.toFixed(2) || 'N/A'}</div>
          </div>
        </div>

        {/* Psychology Tags */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-pink-400 font-semibold mb-2">Psychology</h4>
          <div className="text-xs space-y-1">
            <div><strong>Motivation:</strong> {tags.psychology?.motivation || 'N/A'}</div>
            <div><strong>Fear:</strong> {tags.psychology?.fear || 'N/A'}</div>
            <div><strong>Strength:</strong> {tags.psychology?.strength || 'N/A'}</div>
            <div><strong>Growth Area:</strong> {tags.psychology?.growth_area || 'N/A'}</div>
          </div>
        </div>

        {/* Relationships Tags */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-cyan-400 font-semibold mb-2">Relationships</h4>
          <div className="text-xs space-y-1">
            <div><strong>Leadership Style:</strong> {tags.relationships?.leadership_style || 'N/A'}</div>
            <div><strong>Conflict Style:</strong> {tags.relationships?.conflict_style || 'N/A'}</div>
            <div><strong>Communication:</strong> {tags.relationships?.communication_style || 'N/A'}</div>
            <div><strong>Decision Making:</strong> {tags.relationships?.decision_making || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
