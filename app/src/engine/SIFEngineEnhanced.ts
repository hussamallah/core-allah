import { SIFEngine } from './SIFEngine';

export class SIFEngineEnhanced extends SIFEngine {
  private semanticData: Map<string, any> = new Map();
  
  constructor() {
    super();
  }
  
  /**
   * Enhanced SIF recording with semantic tag analysis
   */
  recordAnswerWithEffectsEnhanced(question: any, choice: 'A' | 'B' | 'C', family: string): void {
    console.log(`📊 Enhanced SIF Recording: ${family} question ${question.id} choice ${choice}`);
    
    const option = question.options.find((opt: any) => opt.key === choice);
    if (!option) {
      console.error(`❌ No option found for choice ${choice} in question ${question.id}`);
      return;
    }
    
    const effects = option.effects || {};
    const behavior = option.behavior;
    const context = option.context;
    const sifSignals = option.sif_signals;
    const ilFactors = option.il_factors;
    const psychology = option.psychology;
    const relationships = option.relationships;
    
    // Store semantic data for analysis
    this.semanticData.set(`${question.id}-${choice}`, {
      behavior,
      context,
      sifSignals,
      ilFactors,
      psychology,
      relationships,
      timestamp: Date.now()
    });
    
    console.log(`  → Enhanced Tags:`, {
      behavior: behavior?.primary,
      energy: behavior?.energy,
      alignment: sifSignals?.alignment_strength,
      wobble: sifSignals?.wobble_factor,
      natural: ilFactors?.natural_instinct,
      motivation: psychology?.motivation,
      leadership: relationships?.leadership_style
    });
    
    // Record family-level effects with enhanced weighting
    if (effects.famC?.length > 0) {
      effects.famC.forEach((fam: string) => {
        const weight = sifSignals?.alignment_strength || 1.0;
        this.inc(this.counters.famC, fam, weight);
        console.log(`  → famC[${fam}] = ${this.counters.famC[fam]} (weighted: ${weight})`);
      });
    }
    
    if (effects.famO?.length > 0) {
      effects.famO.forEach((fam: string) => {
        const weight = sifSignals?.wobble_factor || 1.0;
        this.inc(this.counters.famO, fam, weight);
        console.log(`  → famO[${fam}] = ${this.counters.famO[fam]} (weighted: ${weight})`);
      });
    }
    
    if (effects.famF?.length > 0) {
      effects.famF.forEach((fam: string) => {
        const weight = sifSignals?.override_potential || 1.0;
        this.inc(this.counters.famF, fam, weight);
        console.log(`  → famF[${fam}] = ${this.counters.famF[fam]} (weighted: ${weight})`);
      });
    }
    
    // Record face-level effects with enhanced weighting
    if (effects.faceC?.length > 0) {
      effects.faceC.forEach((face: string) => {
        const weight = sifSignals?.face_credibility || 1.0;
        this.inc(this.counters.faceC, face, weight);
        console.log(`  → faceC[${face}] = ${this.counters.faceC[face]} (weighted: ${weight})`);
      });
    }
    
    if (effects.faceO?.length > 0) {
      effects.faceO.forEach((face: string) => {
        const weight = sifSignals?.face_credibility || 1.0;
        this.inc(this.counters.faceO, face, weight);
        console.log(`  → faceO[${face}] = ${this.counters.faceO[face]} (weighted: ${weight})`);
      });
    }
    
    if (effects.faceF?.length > 0) {
      effects.faceF.forEach((face: string) => {
        const weight = sifSignals?.face_credibility || 1.0;
        this.inc(this.counters.faceF, face, weight);
        console.log(`  → faceF[${face}] = ${this.counters.faceF[face]} (weighted: ${weight})`);
      });
    }
    
    // Record severity effects (Phase D only)
    if (effects.sevF?.length > 0) {
      effects.sevF.forEach((fam: string) => {
        const weight = sifSignals?.override_potential || 1.0;
        this.inc(this.counters.sevF, fam, weight);
        console.log(`  → sevF[${fam}] = ${this.counters.sevF[fam]} (weighted: ${weight})`);
      });
    }
    
    console.log(`📊 Enhanced SIF Counters after recording:`, this.counters);
  }
  
  /**
   * Calculate enhanced Installed Likelihood using semantic tags
   */
  calculateEnhancedInstalledLikelihood(face: string, family: string): number {
    // Calculate base IL using standard formula (simplified)
    const baseIL = 0.5; // Default base IL
    
    // Get semantic data for this face
    const faceData = Array.from(this.semanticData.values())
      .filter(data => data.behavior && data.ilFactors)
      .reduce((acc, data) => {
        acc.naturalInstinct += data.ilFactors.natural_instinct || 0;
        acc.situationalFit += data.ilFactors.situational_fit || 0;
        acc.socialExpectation += data.ilFactors.social_expectation || 0;
        acc.internalConsistency += data.ilFactors.internal_consistency || 0;
        acc.count++;
        return acc;
      }, { naturalInstinct: 0, situationalFit: 0, socialExpectation: 0, internalConsistency: 0, count: 0 });
    
    if (faceData.count === 0) return baseIL;
    
    // Calculate enhanced IL using semantic factors
    const avgNatural = faceData.naturalInstinct / faceData.count;
    const avgSituational = faceData.situationalFit / faceData.count;
    const avgSocial = faceData.socialExpectation / faceData.count;
    const avgConsistency = faceData.internalConsistency / faceData.count;
    
    const enhancedIL = (
      avgNatural * 0.3 +
      avgSituational * 0.25 +
      avgSocial * 0.25 +
      avgConsistency * 0.2
    );
    
    console.log(`🧠 Enhanced IL for ${face}:`, {
      base: baseIL,
      enhanced: enhancedIL,
      factors: {
        natural: avgNatural,
        situational: avgSituational,
        social: avgSocial,
        consistency: avgConsistency
      }
    });
    
    return Math.min(enhancedIL, 5.0); // Cap at 5.0
  }
  
  /**
   * Get behavioral pattern analysis
   */
  getBehavioralPatterns(): Record<string, any> {
    const patterns: Record<string, any> = {};
    
    Array.from(this.semanticData.values()).forEach(data => {
      if (data.behavior) {
        const primary = data.behavior.primary;
        if (!patterns[primary]) {
          patterns[primary] = {
            count: 0,
            totalEnergy: 0,
            totalAlignment: 0,
            totalWobble: 0,
            motivations: new Set(),
            leadershipStyles: new Set()
          };
        }
        
        patterns[primary].count++;
        patterns[primary].totalEnergy += data.behavior.energy === 'high' ? 1 : data.behavior.energy === 'medium' ? 0.5 : 0;
        patterns[primary].totalAlignment += data.sifSignals?.alignment_strength || 0;
        patterns[primary].totalWobble += data.sifSignals?.wobble_factor || 0;
        
        if (data.psychology?.motivation) {
          patterns[primary].motivations.add(data.psychology.motivation);
        }
        if (data.relationships?.leadership_style) {
          patterns[primary].leadershipStyles.add(data.relationships.leadership_style);
        }
      }
    });
    
    // Calculate averages
    Object.keys(patterns).forEach(primary => {
      const pattern = patterns[primary];
      pattern.avgEnergy = pattern.totalEnergy / pattern.count;
      pattern.avgAlignment = pattern.totalAlignment / pattern.count;
      pattern.avgWobble = pattern.totalWobble / pattern.count;
      pattern.motivations = Array.from(pattern.motivations);
      pattern.leadershipStyles = Array.from(pattern.leadershipStyles);
    });
    
    return patterns;
  }
  
  /**
   * Get context analysis
   */
  getContextAnalysis(): Record<string, any> {
    const contexts: Record<string, any> = {};
    
    Array.from(this.semanticData.values()).forEach(data => {
      if (data.context) {
        const situation = data.context.situation;
        if (!contexts[situation]) {
          contexts[situation] = {
            count: 0,
            totalPressure: 0,
            totalUrgency: 0,
            socialDynamics: new Set(),
            powerDeltas: new Set()
          };
        }
        
        contexts[situation].count++;
        contexts[situation].totalPressure += data.context.pressure === 'high' ? 1 : data.context.pressure === 'medium' ? 0.5 : 0;
        contexts[situation].totalUrgency += data.context.time_urgency === 'immediate' ? 1 : data.context.time_urgency === 'moderate' ? 0.5 : 0;
        
        if (data.context.social_dynamic) {
          contexts[situation].socialDynamics.add(data.context.social_dynamic);
        }
        if (data.context.power_delta) {
          contexts[situation].powerDeltas.add(data.context.power_delta);
        }
      }
    });
    
    // Calculate averages
    Object.keys(contexts).forEach(situation => {
      const context = contexts[situation];
      context.avgPressure = context.totalPressure / context.count;
      context.avgUrgency = context.totalUrgency / context.count;
      context.socialDynamics = Array.from(context.socialDynamics);
      context.powerDeltas = Array.from(context.powerDeltas);
    });
    
    return contexts;
  }
  
  /**
   * Get psychological profile
   */
  getPsychologicalProfile(): Record<string, any> {
    const profile: Record<string, any> = {
      motivations: new Set(),
      fears: new Set(),
      strengths: new Set(),
      growthAreas: new Set(),
      leadershipStyles: new Set(),
      conflictStyles: new Set(),
      communicationStyles: new Set(),
      decisionMaking: new Set()
    };
    
    Array.from(this.semanticData.values()).forEach(data => {
      if (data.psychology) {
        if (data.psychology.motivation) profile.motivations.add(data.psychology.motivation);
        if (data.psychology.fear) profile.fears.add(data.psychology.fear);
        if (data.psychology.strength) profile.strengths.add(data.psychology.strength);
        if (data.psychology.growth_area) profile.growthAreas.add(data.psychology.growth_area);
      }
      
      if (data.relationships) {
        if (data.relationships.leadership_style) profile.leadershipStyles.add(data.relationships.leadership_style);
        if (data.relationships.conflict_style) profile.conflictStyles.add(data.relationships.conflict_style);
        if (data.relationships.communication_style) profile.communicationStyles.add(data.relationships.communication_style);
        if (data.relationships.decision_making) profile.decisionMaking.add(data.relationships.decision_making);
      }
    });
    
    // Convert sets to arrays
    Object.keys(profile).forEach(key => {
      profile[key] = Array.from(profile[key]);
    });
    
    return profile;
  }
  
  /**
   * Get enhanced SIF results with semantic analysis
   */
  getEnhancedSIFResults(): any {
    const baseResults = this.getSIFResults();
    const behavioralPatterns = this.getBehavioralPatterns();
    const contextAnalysis = this.getContextAnalysis();
    const psychologicalProfile = this.getPsychologicalProfile();
    
    return {
      ...baseResults,
      semanticAnalysis: {
        behavioralPatterns,
        contextAnalysis,
        psychologicalProfile,
        totalChoices: this.semanticData.size
      }
    };
  }
  
  /**
   * Clear semantic data
   */
  clearSemanticData(): void {
    this.semanticData.clear();
  }
}
