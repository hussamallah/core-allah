/**
 * Prize/Mirror/Secondary rendering rules
 * PATCHSET v2025-09-06 — "Do What The Site Says"
 */

export interface PrizeMirrorResult {
  prizeRole: string;
  mirrorArchetype: string;
  secondaryFace: string;
  hasMirrorGain: boolean;
  resultCard: {
    header: string;
    section1: string;
    section2: string;
    section3: string;
    footer: string;
  };
}

export class PrizeMirrorEngine {
  // Prize role mapping
  private readonly PRIZE_ROLES: Record<string, string> = {
    'Control': 'Authority',
    'Pace': 'Timekeeper',
    'Boundary': 'Gatekeeper',
    'Truth': 'Decider',
    'Recognition': 'Witness',
    'Bonding': 'Anchor',
    'Stress': 'Igniter'
  };

  // Mirror archetype mapping (gender-opposite pattern)
  private readonly MIRROR_ARCHETYPES: Record<string, string> = {
    'Control': 'Bonding',
    'Pace': 'Stress',
    'Boundary': 'Recognition',
    'Truth': 'Pace',
    'Recognition': 'Boundary',
    'Bonding': 'Control',
    'Stress': 'Pace'
  };

  /**
   * Calculate Prize/Mirror/Secondary result
   */
  calculateResult(anchor: string, finalArchetype: string, secondaryFace?: string): PrizeMirrorResult {
    const prizeRole = this.PRIZE_ROLES[anchor] || 'Unknown';
    const mirrorArchetype = this.MIRROR_ARCHETYPES[anchor] || 'Unknown';
    const secondary = secondaryFace || 'Unknown';
    const hasMirrorGain = secondary === mirrorArchetype;

    const resultCard = this.buildResultCard(anchor, finalArchetype, prizeRole, mirrorArchetype, secondary, hasMirrorGain);

    return {
      prizeRole,
      mirrorArchetype,
      secondaryFace: secondary,
      hasMirrorGain,
      resultCard
    };
  }

  /**
   * Build result card according to canon
   */
  private buildResultCard(
    anchor: string,
    finalArchetype: string,
    prizeRole: string,
    mirrorArchetype: string,
    secondary: string,
    hasMirrorGain: boolean
  ): PrizeMirrorResult['resultCard'] {
    return {
      header: `${anchor} → ${finalArchetype} | Prize = ${prizeRole}`,
      
      section1: `${prizeRole} as stable role; ${finalArchetype} as style; 1 action anchor.`,
      
      section2: `${mirrorArchetype} install (opposite-gender); 1 corrective contrast; 1 action.`,
      
      section3: hasMirrorGain 
        ? `Mirror detected (${secondary} = ${mirrorArchetype}) → gain.`
        : `Secondary current (${secondary}) - no gain unless equals Mirror.`,
      
      footer: 'Prize = stable. Mirror installs. Secondary colors; equals Mirror → gain.'
    };
  }

  /**
   * Get prize role for a family
   */
  getPrizeRole(family: string): string {
    return this.PRIZE_ROLES[family] || 'Unknown';
  }

  /**
   * Get mirror archetype for a family
   */
  getMirrorArchetype(family: string): string {
    return this.MIRROR_ARCHETYPES[family] || 'Unknown';
  }

  /**
   * Check if secondary equals mirror for gain
   */
  hasMirrorGain(secondary: string, mirror: string): boolean {
    return secondary === mirror;
  }
}

// Singleton instance
export const prizeMirrorEngine = new PrizeMirrorEngine();
