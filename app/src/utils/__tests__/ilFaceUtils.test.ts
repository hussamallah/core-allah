import { enhanceILScores, getFaceMetadata, getStrengthLevel, formatILScoreDisplay } from '../ilFaceUtils';

describe('ilFaceUtils', () => {
  describe('getFaceMetadata', () => {
    it('should return correct metadata for valid face ID', () => {
      const metadata = getFaceMetadata('Control:Sovereign');
      expect(metadata).toEqual({
        id: 'Control:Sovereign',
        family: 'Control',
        name: 'Sovereign',
        nickname: 'Commander',
        description: 'Seen as the authority who sets the line and directs others to move with clarity.'
      });
    });

    it('should return null for invalid face ID', () => {
      const metadata = getFaceMetadata('Invalid:Face');
      expect(metadata).toBeNull();
    });
  });

  describe('getStrengthLevel', () => {
    it('should return high for scores >= 2.0', () => {
      const strength = getStrengthLevel(2.5);
      expect(strength.label).toBe('high');
      expect(strength.color).toBe('text-green-400');
    });

    it('should return medium for scores 1.0-1.9', () => {
      const strength = getStrengthLevel(1.5);
      expect(strength.label).toBe('medium');
      expect(strength.color).toBe('text-yellow-400');
    });

    it('should return low for scores < 1.0', () => {
      const strength = getStrengthLevel(0.5);
      expect(strength.label).toBe('low');
      expect(strength.color).toBe('text-red-400');
    });
  });

  describe('enhanceILScores', () => {
    it('should enhance IL scores with metadata and strength', () => {
      const ilScores = {
        'Control:Sovereign': 2.1,
        'Pace:Visionary': 1.5,
        'Stress:Catalyst': 0.8
      };

      const enhanced = enhanceILScores(ilScores);
      
      expect(enhanced).toHaveLength(3);
      expect(enhanced[0].face).toBe('Control:Sovereign');
      expect(enhanced[0].score).toBe(2.1);
      expect(enhanced[0].nickname).toBe('Commander');
      expect(enhanced[0].strength).toBe('high');
      expect(enhanced[0].strengthColor).toBe('text-green-400');
    });

    it('should sort scores in descending order', () => {
      const ilScores = {
        'Stress:Catalyst': 0.8,
        'Control:Sovereign': 2.1,
        'Pace:Visionary': 1.5
      };

      const enhanced = enhanceILScores(ilScores);
      
      expect(enhanced[0].score).toBe(2.1);
      expect(enhanced[1].score).toBe(1.5);
      expect(enhanced[2].score).toBe(0.8);
    });
  });

  describe('formatILScoreDisplay', () => {
    it('should format score display correctly', () => {
      const scoreData = {
        face: 'Bonding:Provider',
        score: 1.93,
        family: 'Bonding',
        name: 'Provider',
        nickname: 'Caretaker',
        description: 'Trusted as the one who carries burdens and meets needs to keep others steady.',
        strength: 'medium',
        strengthColor: 'text-yellow-400',
        strengthDescription: 'Moderate expectation for this role'
      };

      const formatted = formatILScoreDisplay(scoreData);
      expect(formatted).toBe('Bonding · Provider — Caretaker (medium, 1.93)');
    });
  });
});
