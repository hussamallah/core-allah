import React from 'react';

interface EnhancedSIFReportProps {
  enhancedReport: any;
  originInsights: any;
}

export function EnhancedSIFReport({ enhancedReport, originInsights }: EnhancedSIFReportProps) {
  if (!enhancedReport) {
    return <div className="text-gray-400">No enhanced report available</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Enhanced SIF Analysis</h3>
      
      {/* Anchor Section */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Anchor (Evidence-Based)</h4>
        <div className="text-gray-300">
          <div className="font-medium">{enhancedReport.anchor?.face}</div>
          <div className="text-sm text-gray-400">{enhancedReport.anchor?.reason}</div>
        </div>
      </div>

      {/* Secondary Section */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Secondary (Preference-Based)</h4>
        <div className="text-gray-300">
          <div className="font-medium">{enhancedReport.secondary?.face}</div>
          <div className="text-sm text-gray-400">
            Preference Strength: {(enhancedReport.secondary?.preference_strength * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Origin Analysis */}
      {originInsights && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-2">Origin Analysis</h4>
          <div className="space-y-2 text-gray-300">
            <div>
              <span className="font-medium">Installation Context:</span> {originInsights.origin_analysis?.installation_context}
            </div>
            <div>
              <span className="font-medium">Power Dynamic:</span> {originInsights.origin_analysis?.power_dynamic}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {originInsights.context_summary}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-900 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-2">Summary</h4>
        <div className="text-gray-300 text-sm">
          {enhancedReport.summary}
        </div>
      </div>
    </div>
  );
}
