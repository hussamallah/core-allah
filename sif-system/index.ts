/**
 * SIF (Secondary Identity Face) System - Main Export
 * 
 * This is the main entry point for the SIF system.
 * Import everything you need from this file.
 */

// Core SIF Engine
export { SIFEngine } from './SIFEngine';

// Types and Constants
export * from './types';

// Integration Utilities
export * from './integration';

// Re-export commonly used items for convenience
export type {
  SIFCounters,
  SIFResult,
  SIFIntegrationState,
  QuizLine,
  QuestionHistoryEntry,
  Family,
  QuestionType,
  Choice,
  Severity
} from './types';

export {
  FACE_TO_FAMILY,
  FAMILY_TO_FACES,
  PRIZE_MIRROR_MAP,
  FAMILY_TO_PRIZE,
  FACE_ANCHOR,
  FAMILIES,
  getPrizeMirror,
  anchorFaceFor,
  createFaceKey,
  parseFaceKey
} from './types';

export {
  createSIFState,
  initializeSIF,
  resetSIF,
  handlePhaseBAnswer,
  handlePhaseCAnswer,
  handleSeverityProbe,
  handlePhaseDSIFCalculation,
  calculatePrimaryFace,
  processPhaseBData,
  processPhaseCData,
  getSIFSummary,
  exportSIFData,
  importSIFData,
  useSIFIntegration
} from './integration';
