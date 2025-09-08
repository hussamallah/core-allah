import ilFaceReference from '@/data/ilFaceReference.json';
import ilStrengthThresholds from '@/data/ilStrengthThresholds.json';

export interface ILFaceData {
  id: string;
  family: string;
  name: string;
  nickname: string;
  description: string;
}

export interface ILStrengthThreshold {
  min?: number;
  max?: number;
  label: string;
  color: string;
  description: string;
}

export interface ILScoreWithMetadata {
  face: string;
  score: number;
  family: string;
  name: string;
  nickname: string;
  description: string;
  strength: string;
  strengthColor: string;
  strengthDescription: string;
}

/**
 * Get face metadata by face ID
 */
export function getFaceMetadata(faceId: string): ILFaceData | null {
  return ilFaceReference.find(face => face.id === faceId) || null;
}

/**
 * Determine strength level based on score
 */
export function getStrengthLevel(score: number): ILStrengthThreshold {
  if (score >= ilStrengthThresholds.high.min) {
    return ilStrengthThresholds.high;
  } else if (score >= ilStrengthThresholds.medium.min && score <= ilStrengthThresholds.medium.max) {
    return ilStrengthThresholds.medium;
  } else {
    return ilStrengthThresholds.low;
  }
}

/**
 * Enhance IL scores with face metadata and strength information
 */
export function enhanceILScores(ilScores: Record<string, number>): ILScoreWithMetadata[] {
  return Object.entries(ilScores)
    .map(([face, score]) => {
      const metadata = getFaceMetadata(face);
      const strength = getStrengthLevel(score);
      
      return {
        face,
        score,
        family: metadata?.family || face.split(':')[0],
        name: metadata?.name || face.split(':')[1],
        nickname: metadata?.nickname || 'Unknown',
        description: metadata?.description || 'No description available',
        strength: strength.label,
        strengthColor: strength.color,
        strengthDescription: strength.description
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Format IL score display string
 */
export function formatILScoreDisplay(scoreData: ILScoreWithMetadata): string {
  return `${scoreData.family} · ${scoreData.name} — ${scoreData.nickname} (${scoreData.strength}, ${scoreData.score.toFixed(2)})`;
}

/**
 * Get all face metadata
 */
export function getAllFaceMetadata(): ILFaceData[] {
  return ilFaceReference;
}

/**
 * Get strength thresholds configuration
 */
export function getStrengthThresholds(): Record<string, ILStrengthThreshold> {
  return ilStrengthThresholds;
}
