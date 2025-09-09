/**
 * SIF Context Enhancer
 * 
 * Adds context-aware analysis to existing IL calculations without changing core logic.
 * Preserves all existing math while adding origin insights.
 */

import { getEnhancedTagsForQuestion } from '@/data/questions';

// Context tag types
export type Locus = "external" | "internal" | "mixed";
export type Installer = "authority" | "peer" | "client" | "crowd" | "self" | "none";
export type Visibility = "public" | "private";
export type Stakes = "safety" | "time" | "credit" | "cohesion" | "quality" | "none";
export type PowerDelta = "you_above" | "you_below" | "equal" | "none";

export interface ContextTags {
  locus: Locus;
  installer: Installer;
  visibility: Visibility;
  stakes: Stakes;
  power_delta: PowerDelta;
}

export interface OriginAnalysis {
  is_self_driven: boolean;
  is_externally_installed: boolean;
  installation_context: string;
  power_dynamic: string;
}

export class SIFContextEnhancer {
  private contextHistory: Map<string, ContextTags[]> = new Map();

  /**
   * Track context for a choice to build origin analysis
   */
  public trackChoiceContext(questionId: string, choice: 'A' | 'B', face: string) {
    const tags = getEnhancedTagsForQuestion(questionId, choice);
    if (!tags?.context) return;

    // Handle both option-level and question-level context structures
    const contextTags: ContextTags = {
      locus: (tags.context as any).locus as Locus || 'internal',
      installer: (tags.context as any).installer as Installer || 'self',
      visibility: (tags.context as any).visibility as Visibility || 'private',
      stakes: (tags.context as any).stakes as Stakes || 'quality',
      power_delta: (tags.context as any).power_delta as PowerDelta || 'equal'
    };

    if (!this.contextHistory.has(face)) {
      this.contextHistory.set(face, []);
    }
    this.contextHistory.get(face)!.push(contextTags);

    console.log(`📊 Tracked context for ${face}:`, contextTags);
  }

  /**
   * Analyze installation origin for a face based on its choice history
   */
  public analyzeOrigin(face: string): OriginAnalysis {
    const contexts = this.contextHistory.get(face) || [];
    
    if (contexts.length === 0) {
      return {
        is_self_driven: false,
        is_externally_installed: false,
        installation_context: "No context data available",
        power_dynamic: "Unknown"
      };
    }

    // Analyze patterns across all contexts for this face
    const selfDrivenCount = contexts.filter(c => 
      c.locus === "internal" || 
      c.installer === "self" ||
      c.power_delta === "you_above"
    ).length;

    const externalCount = contexts.filter(c => 
      c.locus === "external" && 
      c.installer !== "self" &&
      c.power_delta !== "you_above"
    ).length;

    const isSelfDriven = selfDrivenCount > externalCount;
    const isExternallyInstalled = externalCount > selfDrivenCount;

    // Generate context description
    const mostCommonStakes = this.getMostCommonValue(contexts, 'stakes');
    const mostCommonInstaller = this.getMostCommonValue(contexts, 'installer');
    const mostCommonVisibility = this.getMostCommonValue(contexts, 'visibility');

    let installationContext = "";
    if (isSelfDriven) {
      installationContext = `Self-driven choices in ${mostCommonStakes} contexts`;
    } else if (isExternallyInstalled) {
      const installer = mostCommonInstaller === "authority" ? "authority figures" :
                       mostCommonInstaller === "peer" ? "peers" :
                       mostCommonInstaller === "client" ? "clients" : "crowd pressure";
      installationContext = `Installed by ${installer} in ${mostCommonVisibility} ${mostCommonStakes} contexts`;
    } else {
      installationContext = `Mixed origin in ${mostCommonStakes} contexts`;
    }

    // Generate power dynamic description
    const mostCommonPower = this.getMostCommonValue(contexts, 'power_delta');
    let powerDynamic = "";
    if (mostCommonPower === "you_above") {
      powerDynamic = "You typically lead these choices";
    } else if (mostCommonPower === "you_below") {
      powerDynamic = "Others typically influence these choices";
    } else {
      powerDynamic = "Equal influence in these choices";
    }

    return {
      is_self_driven: isSelfDriven,
      is_externally_installed: isExternallyInstalled,
      installation_context: installationContext,
      power_dynamic: powerDynamic
    };
  }

  /**
   * Get origin insights for a face (for reporting)
   */
  public getOriginInsights(face: string): {
    preference_strength: number;
    origin_analysis: OriginAnalysis;
    context_summary: string;
  } {
    const originAnalysis = this.analyzeOrigin(face);
    
    // Calculate preference strength based on context patterns
    const contexts = this.contextHistory.get(face) || [];
    const preferenceStrength = contexts.length > 0 ? 
      Math.min(1.0, contexts.length / 3) : 0.5; // More choices = stronger preference

    let contextSummary = "";
    if (originAnalysis.is_self_driven) {
      contextSummary = "This face appears to be a self-driven preference rather than external installation.";
    } else if (originAnalysis.is_externally_installed) {
      contextSummary = "This face appears to be externally installed rather than a natural preference.";
    } else {
      contextSummary = "This face shows mixed patterns of self-driven and externally influenced choices.";
    }

    return {
      preference_strength: preferenceStrength,
      origin_analysis: originAnalysis,
      context_summary: contextSummary
    };
  }

  /**
   * Generate enhanced report combining SIF and IL insights
   */
  public generateEnhancedReport(sifResult: any): {
    anchor: { face: string; reason: string };
    secondary: { 
      face: string; 
      preference_strength: number;
      origin_insights: any;
    };
    summary: string;
  } {
    const secondaryFace = sifResult.secondary?.face || "Unknown";
    const secondaryInsights = this.getOriginInsights(secondaryFace);

    return {
      anchor: {
        face: sifResult.anchor?.face || "Unknown",
        reason: "Evidence-based selection from purity scores"
      },
      secondary: {
        face: secondaryFace,
        preference_strength: secondaryInsights.preference_strength,
        origin_insights: secondaryInsights
      },
      summary: `Your Anchor is ${sifResult.anchor?.face} (purity-based). You often prefer ${secondaryFace} as Secondary. ${secondaryInsights.context_summary}`
    };
  }

  /**
   * Helper to get most common value from context array
   */
  private getMostCommonValue(contexts: ContextTags[], key: keyof ContextTags): string {
    const counts: Record<string, number> = {};
    contexts.forEach(context => {
      const value = context[key] as string;
      counts[value] = (counts[value] || 0) + 1;
    });
    
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }

  /**
   * Clear context history (for new quiz sessions)
   */
  public clearContextHistory(): void {
    this.contextHistory.clear();
  }
}
