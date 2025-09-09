/**
 * SIF (Secondary Identity Face) Engine
 * 
 * Handles counting signals during quiz phases and calculating SIF in Phase D
 * Follows the SIF specification: count during run, decide at Phase D
 */

import { SIFCounters, SIFResult, FACE_TO_FAMILY, FAMILY_TO_FACES, FAMILY_TO_PRIZE, PRIZE_MIRROR_MAP, getPrizeMirror } from '@/types/quiz';
import { PhaseDEngine } from './PhaseD';
import { SIFContextEnhancer } from './SIFContextEnhancer';

export class SIFEngine {
  public counters: SIFCounters;
  private didRecordAll: boolean = false;
  private didRecordPhaseD: boolean = false;
  private snapshot: any = null;
  private opportunities: Record<string, number> = {}; // Track opportunities per face
  private calculatedILScores: Record<string, number> = {}; // Store calculated IL scores
  public phaseDEngine: PhaseDEngine; // Make Phase D engine accessible
  private contextEnhancer: SIFContextEnhancer; // Context-aware analysis
  
  // SIF user installs tracking for internal candidates
  private sifUserInstalls: Record<string, number> = {}; // Track user installs per face
  private sifLastPick: string | null = null; // Most recent user pick
  private originEvents: Record<string, { internal: number; external: number; mixed: number }> = {}; // Track origin events per face

  // Family-to-archetype mapping for face determination
  private readonly FAMILY_FACES: Record<string, [string, string]> = {
    Control: ["Control:Sovereign", "Control:Rebel"],
    Pace: ["Pace:Visionary", "Pace:Navigator"],
    Boundary: ["Boundary:Equalizer", "Boundary:Guardian"],
    Truth: ["Truth:Seeker", "Truth:Architect"],
    Recognition: ["Recognition:Spotlight", "Recognition:Diplomat"],
    Bonding: ["Bonding:Partner", "Bonding:Provider"],
    Stress: ["Stress:Catalyst", "Stress:Artisan"]
  };

  // Face-to-installed-statement mapping for Phase D UX
  private readonly FACE_INSTALLED_STATEMENTS: Record<string, {
    statement: string;
    label: string;
    family: string;
    cues: string[];
  }> = {
    "Control:Sovereign": {
      statement: "People expect me to **take charge and set the agenda**.",
      label: "Sovereign",
      family: "Control",
      cues: ["Sets direction", "Decides quickly"]
    },
    "Control:Rebel": {
      statement: "People expect me to **challenge the plan or push back**.",
      label: "Rebel", 
      family: "Control",
      cues: ["Questions authority", "Breaks stuck patterns"]
    },
    "Pace:Navigator": {
      statement: "People lean on me to **map the path and keep us on track**.",
      label: "Navigator",
      family: "Pace", 
      cues: ["Plans milestones", "Manages momentum"]
    },
    "Pace:Visionary": {
      statement: "People look to me to **imagine what's next and inspire direction**.",
      label: "Visionary",
      family: "Pace",
      cues: ["Big picture", "Sets tempo with ideas"]
    },
    "Boundary:Equalizer": {
      statement: "People call me in to **make things fair and balance trade-offs**.",
      label: "Equalizer",
      family: "Boundary",
      cues: ["Referees decisions", "Ensures equity"]
    },
    "Boundary:Guardian": {
      statement: "People rely on me to **protect the group and enforce guardrails**.",
      label: "Guardian",
      family: "Boundary",
      cues: ["Safety first", "Holds the line"]
    },
    "Truth:Architect": {
      statement: "People tap me to **design the structure or system**.",
      label: "Architect",
      family: "Truth",
      cues: ["Models & frameworks", "Clarity of logic"]
    },
    "Truth:Seeker": {
      statement: "People ask me to **dig for the real facts and question assumptions**.",
      label: "Seeker",
      family: "Truth",
      cues: ["Investigates", "Probing questions"]
    },
    "Recognition:Spotlight": {
      statement: "People put me **out front to represent or present**.",
      label: "Spotlight",
      family: "Recognition",
      cues: ["Spokesperson", "Visible ownership"]
    },
    "Recognition:Diplomat": {
      statement: "People ask me to **smooth relationships and keep harmony**.",
      label: "Diplomat",
      family: "Recognition",
      cues: ["Bridges groups", "Reads the room"]
    },
    "Bonding:Partner": {
      statement: "People come to me for **emotional support and connection**.",
      label: "Partner",
      family: "Bonding",
      cues: ["Morale & empathy", "Keeps people engaged"]
    },
    "Bonding:Provider": {
      statement: "People expect me to **handle practical care and logistics**.",
      label: "Provider",
      family: "Bonding",
      cues: ["Gets resources in place", "Looks after needs"]
    },
    "Stress:Artisan": {
      statement: "People ask me to **fix things hands-on right now**.",
      label: "Artisan",
      family: "Stress",
      cues: ["Jumps in", "Tactical problem-solving"]
    },
    "Stress:Catalyst": {
      statement: "People push me to **create urgency and drive hard outcomes**.",
      label: "Catalyst",
      family: "Stress",
      cues: ["Turns up the heat", "Forces movement"]
    }
  };

  constructor() {
    this.counters = {
      famC: {},
      famO: {},
      famF: {},
      sevF: {},
      faceC: {},
      faceO: {},
      faceF: {}
    };
    this.phaseDEngine = new PhaseDEngine();
    this.contextEnhancer = new SIFContextEnhancer();
  }

  // Helper to safely increment counters
  public inc(obj: Record<string, number>, key: string, by = 1): void {
    obj[key] = (typeof obj[key] === "number" ? obj[key] : 0) + by;
  }

  /**
   * Initialize counters for all families and faces
   */
  initializeCounters(): void {
    const families = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
    const faces = Object.keys(FACE_TO_FAMILY);

    families.forEach(family => {
      this.counters.famC[family] = 0;
      this.counters.famO[family] = 0;
      this.counters.famF[family] = 0;
      this.counters.sevF[family] = 0;
    });

    faces.forEach(face => {
      this.counters.faceC[face] = 0;
      this.counters.faceO[face] = 0;
      this.counters.faceF[face] = 0;
    });
  }

  /**
   * Determine face from B-path (Phase B)
   * @param family - The family name (e.g., "Control")
   * @param bPath - Array of verdicts from Phase B (e.g., ["C", "O"])
   * @returns The determined face ID (e.g., "Control:Sovereign")
   */
  private determineFaceFromBPath(family: string, bPath: ("C"|"O"|"F")[]): string {
    const [faceC, faceO] = this.FAMILY_FACES[family] || [`${family}:Unknown1`, `${family}:Unknown2`];
    const cCount = bPath.filter(v => v === "C").length;
    const oCount = bPath.filter(v => v === "O").length;
    
    // More C's = first archetype, more O's = second archetype
    if (cCount > oCount) return faceC;
    if (oCount > cCount) return faceO;
    
    // Tie: use first question as tie-breaker
    return bPath[0] === "O" ? faceO : faceC;
  }

  /**
   * Determine face from module decisions (Phase C)
   * @param family - The family name (e.g., "Control")
   * @param decisions - Array of module decisions from Phase C
   * @returns The determined face ID (e.g., "Control:Sovereign")
   */
  private determineFaceFromModuleDecisions(family: string, decisions: any[]): string {
    const [faceC, faceO] = this.FAMILY_FACES[family] || [`${family}:Unknown1`, `${family}:Unknown2`];
    
    let cCount = 0;
    let oCount = 0;
    
    decisions.forEach(decision => {
      if (decision.pick === "C") cCount++;
      else if (decision.pick === "O") oCount++;
    });
    
    // More C's = first archetype, more O's = second archetype
    if (cCount > oCount) return faceC;
    if (oCount > cCount) return faceO;
    
    // Tie: use first decision as tie-breaker
    return decisions[0]?.pick === "O" ? faceO : faceC;
  }

  /**
   * DEPRECATED: Record answer during Phase B (duels)
   * @deprecated Use recordAnswerWithEffects instead for correct effect mapping
   */
  recordPhaseBAnswer(family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B'): void {
    console.warn('⚠️ Using deprecated recordPhaseBAnswer - effects may be incorrect. Use recordAnswerWithEffects instead.');
    console.log(`📊 SIF Phase B: ${family} ${questionType} choice ${choice}`);
    
    if (questionType === 'CO') {
      if (choice === 'A') {
        this.inc(this.counters.famC, family);
        console.log(`  → famC[${family}] = ${this.counters.famC[family]}`);
      } else {
        this.inc(this.counters.famO, family);
        console.log(`  → famO[${family}] = ${this.counters.famO[family]}`);
      }
    } else if (questionType === 'CF') {
      if (choice === 'A') {
        this.inc(this.counters.famC, family);
        console.log(`  → famC[${family}] = ${this.counters.famC[family]}`);
      } else {
        this.inc(this.counters.famF, family);
        console.log(`  → famF[${family}] = ${this.counters.famF[family]}`);
      }
    }
    
    console.log('📊 SIF Counters after Phase B:', this.counters);
  }

  /**
   * NEW: Record answer with proper effect mapping
   * This replaces the old recordPhaseBAnswer and recordPhaseCAnswer methods
   * Uses question effects to credit the correct faces based on new C/O/F semantics
   */
  recordAnswerWithEffects(question: any, choice: 'A' | 'B' | 'C', family: string): void {
    console.log(`📊 SIF Recording: ${family} question ${question.id} choice ${choice}`);
    
    const option = question.options.find((opt: any) => opt.key === choice);
    if (!option) {
      console.warn(`No option found for choice ${choice} in question ${question.id}`);
      return;
    }
    
    const effects = option.effects || {};
    console.log(`  → Effects:`, effects);
    
    // Record family-level effects
    if (effects.famC?.length > 0) {
      effects.famC.forEach((fam: string) => {
        this.inc(this.counters.famC, fam);
        console.log(`  → famC[${fam}] = ${this.counters.famC[fam]}`);
      });
    }
    
    if (effects.famO?.length > 0) {
      effects.famO.forEach((fam: string) => {
        this.inc(this.counters.famO, fam);
        console.log(`  → famO[${fam}] = ${this.counters.famO[fam]}`);
      });
    }
    
    if (effects.famF?.length > 0) {
      effects.famF.forEach((fam: string) => {
        this.inc(this.counters.famF, fam);
        console.log(`  → famF[${fam}] = ${this.counters.famF[fam]}`);
      });
    }
    
    // Record face-level effects (THE KEY FIX)
    if (effects.faceC?.length > 0) {
      effects.faceC.forEach((face: string) => {
        this.inc(this.counters.faceC, face);
        console.log(`  → faceC[${face}] = ${this.counters.faceC[face]}`);
      });
    }
    
    if (effects.faceO?.length > 0) {
      effects.faceO.forEach((face: string) => {
        this.inc(this.counters.faceO, face);
        console.log(`  → faceO[${face}] = ${this.counters.faceO[face]}`);
      });
    }
    
    if (effects.faceF?.length > 0) {
      effects.faceF.forEach((face: string) => {
        this.inc(this.counters.faceF, face);
        console.log(`  → faceF[${face}] = ${this.counters.faceF[face]}`);
      });
    }
    
    // Track context for origin analysis
    if (effects.faceC?.length > 0) {
      effects.faceC.forEach((face: string) => {
        this.contextEnhancer.trackChoiceContext(question.id, choice as 'A' | 'B', face);
        // Track origin events for internal candidate calculation
        this.trackOriginEventFromContext(question, choice as 'A' | 'B', face);
      });
    }
    if (effects.faceO?.length > 0) {
      effects.faceO.forEach((face: string) => {
        this.contextEnhancer.trackChoiceContext(question.id, choice as 'A' | 'B', face);
        // Track origin events for internal candidate calculation
        this.trackOriginEventFromContext(question, choice as 'A' | 'B', face);
      });
    }
    if (effects.faceF?.length > 0) {
      effects.faceF.forEach((face: string) => {
        this.contextEnhancer.trackChoiceContext(question.id, choice as 'A' | 'B', face);
        // Track origin events for internal candidate calculation
        this.trackOriginEventFromContext(question, choice as 'A' | 'B', face);
      });
    }
    
    console.log('📊 SIF Counters after recording:', this.counters);
  }

  /**
   * DEPRECATED: Record answer during Phase C (fused items)
   * Records both family and face counters for the anchored face
   * @deprecated Use recordAnswerWithEffects instead for correct effect mapping
   */
  recordPhaseCAnswer(family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace: string): void {
    console.warn('⚠️ Using deprecated recordPhaseCAnswer - effects may be incorrect. Use recordAnswerWithEffects instead.');
    console.log(`📊 SIF Phase C: ${family} ${questionType} choice ${choice} anchoredFace ${anchoredFace}`);
    
    // Handle CF/B case - only famF, no face vote
    if (questionType === 'CF' && choice === 'B') {
      this.inc(this.counters.famF, family);
      console.log(`  → famF[${family}] = ${this.counters.famF[family]}`);
      console.log(`  → no face vote for CF/B`);
      return;
    }
    
    // Handle C/O family signal
    if (choice === 'A') {
      this.inc(this.counters.famC, family);
      console.log(`  → famC[${family}] = ${this.counters.famC[family]}`);
    } else {
      this.inc(this.counters.famO, family);
      console.log(`  → famO[${family}] = ${this.counters.famO[family]}`);
    }
    
    // Track opportunities (all anchored faces get a chance to be voted on)
    this.inc(this.opportunities, anchoredFace);
    
    // Face vote only on positive endorsements (choice === 'A')
    // CO: choice 'A' = faceC++, choice 'B' = faceO++
    // CF: choice 'A' = faceC++, choice 'B' = no face vote (by design)
    if (choice === 'A') {
      this.inc(this.counters.faceC, anchoredFace);
      console.log(`  → faceC[${anchoredFace}] = ${this.counters.faceC[anchoredFace]} (positive endorsement)`);
    } else if (questionType === 'CO') {
      // Only CO questions get faceO votes on choice 'B'
      this.inc(this.counters.faceO, anchoredFace);
      console.log(`  → faceO[${anchoredFace}] = ${this.counters.faceO[anchoredFace]} (negative endorsement)`);
    } else {
      // CF questions with choice 'B' get no face vote (by design)
      console.log(`  → no face vote for ${questionType}/B (by design)`);
    }
    
    console.log('📊 SIF Counters after Phase C:', this.counters);
  }

  /**
   * Record all SIF data from quiz results
   * FIXED: This is now a snapshot-only method, no double counting
   */
  recordAllSIFData(quizData: any, primaryFamily: string, primaryFace: string): void {
    if (this.didRecordAll) {
      console.log('📊 SIF Recording All Data: Already recorded, skipping');
      return;
    }
    
    this.didRecordAll = true;
    console.log('📊 SIF Recording All Data: Snapshot only (counters already live)', { 
      primaryFamily, 
      primaryFace,
      currentCounters: this.counters 
    });
    
    // DO NOT replay picks into counters - they're already live from Phase B/C
    // Just store the data for reference
    this.snapshot = { primaryFamily, primaryFace, quizData };
  }

  /**
   * Record severity probe result
   */
  recordSeverityProbe(family: string, severity: 'F0.5' | 'F1'): void {
    // Store the actual severity value, not just increment
    const severityValue = severity === 'F1' ? 1 : 0.5;
    this.counters.sevF[family] = severityValue;
  }

  /**
   * NEW: compute anchor-candidate families BEFORE install (Phase D pre-step).
   */
  public computeAnchorCandidateFamilies(a26Faces: string[], moduleTopFamilies: string[]): Set<string> {
    console.log("🔍 computeAnchorCandidateFamilies input:", { a26Faces, moduleTopFamilies });
    
    // If any A-line 2.6 faces exist, use their families; else use module tops.
    if (a26Faces.length > 0) {
      // a26Faces contains face names like "Pace:C", "Truth:C", "Bonding:C"
      // We need to extract the family part (before the colon)
      const families = a26Faces.map(f => f.split(':')[0]);
      console.log("🔍 Extracted families from a26Faces:", families);
      return new Set(families);
    } else {
      console.log("🔍 No a26Faces, using moduleTopFamilies:", moduleTopFamilies);
      return new Set(moduleTopFamilies);
    }
  }

  /**
   * NEW: InstalledLikelihood scorer for a single face.
   */
  private installedLikelihoodForFace(face: string, source: "A"|"M", bPath?: ("C"|"O"|"F")[], mPath?: ("C"|"O"|"F")[], aCandFamilies?: Set<string>, aCandPrizeFaces?: Set<string>): number {
    console.log(`🧮 Computing IL for ${face} (source: ${source})`);
    
    let base = 0;
    if (source === "A" && bPath) {
      console.log(`  📊 A-line calculation for ${face}:`);
      console.log(`    → B-path: [${bPath.join(', ')}]`);
      
      const earlyO   = bPath[0] === "O" ? 1 : 0;
      const fTouch   = bPath.indexOf("F") !== -1 ? 1 : 0;
      const oHits    = bPath.filter(p=>p==="O").length;
      const oRatio   = oHits / 2;
      const purity   = this.computeFacePurityFromB(bPath);
      const purityGap= Math.max(0, Math.min(1, (2.6 - purity)/2));
      
      console.log(`    → earlyO: ${earlyO} (first pick is O: ${bPath[0] === "O"})`);
      console.log(`    → fTouch: ${fTouch} (has F in path: ${bPath.indexOf("F") !== -1})`);
      console.log(`    → oHits: ${oHits} (O picks: [${bPath.filter(p=>p==="O").join(', ')}])`);
      console.log(`    → oRatio: ${oRatio} (${oHits}/2)`);
      console.log(`    → purity: ${purity} (computed from B-path)`);
      console.log(`    → purityGap: ${purityGap} (clamp((2.6-${purity})/2, 0, 1))`);
      
      base = 1.6*earlyO + 1.2*fTouch + 0.8*oRatio + 0.8*purityGap;
      console.log(`    → base IL: ${base} (1.6×${earlyO} + 1.2×${fTouch} + 0.8×${oRatio} + 0.8×${purityGap})`);
      
    } else if (source === "M" && mPath) {
      console.log(`  📊 Module calculation for ${face}:`);
      console.log(`    → M-path: [${mPath.join(', ')}]`);
      
      const cCount     = mPath.filter(p=>p==="C").length;
      const driftRatio = (3 - cCount)/3;
      const endedF     = mPath[2] === "F" ? 1 : 0;
      const isCCC      = cCount === 3 ? 1 : 0;
      
      console.log(`    → cCount: ${cCount} (C picks: [${mPath.filter(p=>p==="C").join(', ')}])`);
      console.log(`    → driftRatio: ${driftRatio} ((3-${cCount})/3)`);
      console.log(`    → endedF: ${endedF} (last pick is F: ${mPath[2] === "F"})`);
      console.log(`    → isCCC: ${isCCC} (perfect CCC: ${cCount === 3})`);
      
      base = 1.6*isCCC + 1.4*endedF + 0.8*driftRatio;
      console.log(`    → base IL: ${base} (1.6×${isCCC} + 1.4×${endedF} + 0.8×${driftRatio})`);
    }
    base = Math.min(4.0, base);
    console.log(`  → base IL (capped): ${base}`);

    // Extract family from full face name (e.g., "Truth:Architect" -> "Truth")
    const family = face.split(':')[0];
    const sibBonus   = aCandFamilies?.has(family) ? 1.0 : 0.0;
    const prizeBonus = aCandPrizeFaces?.has(face) ? 0.5 : 0.0;

    console.log(`  🎁 Bonus calculation:`);
    console.log(`    → family: ${family} (extracted from ${face})`);
    console.log(`    → sibBonus: ${sibBonus} (family in anchor candidates: ${aCandFamilies?.has(family)})`);
    console.log(`    → prizeBonus: ${prizeBonus} (face in prize mirrors: ${aCandPrizeFaces?.has(face)})`);

    const finalIL = Math.min(5.0, base + sibBonus + prizeBonus);
    console.log(`  → final IL: ${finalIL} (${base} + ${sibBonus} + ${prizeBonus}, capped at 5.0)`);
    
    return finalIL;
  }

  /**
   * NEW: build shortlist of up to 4 installed suspects.
   */
  public buildInstallShortlist(allFaces: {face:string, source:"A"|"M", bPath?:("C"|"O"|"F")[], mPath?:("C"|"O"|"F")[]}[],
                                aCandFamilies: Set<string>, aCandPrizeFaces: Set<string>): string[] {
    console.log(`🎯 Building install shortlist from ${allFaces.length} faces`);
    console.log(`📊 Anchor candidate families: [${Array.from(aCandFamilies).join(', ')}]`);
    console.log(`🏆 Prize mirror faces: [${Array.from(aCandPrizeFaces).join(', ')}]`);
    
    const scored = allFaces.map(f => ({
      face: f.face,
      family: f.face.split(':')[0], // Extract family from full face name
      IL: this.installedLikelihoodForFace(f.face, f.source, f.bPath, f.mPath, aCandFamilies, aCandPrizeFaces),
      fTouch: (f.source==="A" && f.bPath?.indexOf("F") !== -1) ? 1 : 0,
      endedF: (f.source==="M" && f.mPath?.[2]==="F") ? 1 : 0
    }));

    console.log(`📈 All faces scored:`, scored.map(s => ({
      face: s.face,
      family: s.family,
      IL: s.IL,
      fTouch: s.fTouch,
      endedF: s.endedF
    })));

    // Store the calculated IL scores for later retrieval
    scored.forEach(s => {
      this.calculatedILScores[s.face] = s.IL;
      console.log(`💾 Stored IL score: ${s.face} = ${s.IL}`);
    });
    
    console.log('💾 All IL scores stored:', this.calculatedILScores);

    scored.sort((a,b)=>{
      if (b.IL !== a.IL) return b.IL - a.IL;
      if (b.fTouch !== a.fTouch) return b.fTouch - a.fTouch;
      if (b.endedF !== a.endedF) return b.endedF - a.endedF;
      return a.face.localeCompare(b.face);
    });

    console.log(`🔄 Sorted by IL (desc), then fTouch, then endedF, then alphabetical:`, scored.map(s => ({
      face: s.face,
      IL: s.IL,
      fTouch: s.fTouch,
      endedF: s.endedF
    })));

    const shortlist: string[] = [];
    const families: Record<string, number> = {};
    for (const s of scored) {
      if (shortlist.indexOf(s.face) === -1) {
        shortlist.push(s.face);
        families[s.family] = (families[s.family]||0) + 1;
        console.log(`  ✅ Added ${s.face} (${s.family}) to shortlist. IL: ${s.IL}`);
        if (shortlist.length === 4) {
          console.log(`  🛑 Reached max 4 faces, stopping selection`);
          break;
        }
      } else {
        console.log(`  ⏭️ Skipped ${s.face} (already in shortlist)`);
      }
    }

    console.log(`📋 Initial shortlist: [${shortlist.join(', ')}]`);
    console.log(`👥 Family distribution:`, families);

    // diversity: if all 4 same family, replace #4 with best from another family
    if (shortlist.length === 4) {
      const fam0 = shortlist[0].split(':')[0]; // Extract family from first face
      const allSame = shortlist.every(f => f.split(':')[0] === fam0);
      console.log(`🔍 Diversity check: all faces from ${fam0}? ${allSame}`);
      
      if (allSame) {
        const replacement = scored.find(s => s.face.split(':')[0] !== fam0 && shortlist.indexOf(s.face) === -1);
        if (replacement) {
          console.log(`🔄 Replacing ${shortlist[3]} with ${replacement.face} for diversity`);
          shortlist[3] = replacement.face;
        } else {
          console.log(`⚠️ No replacement found for diversity, keeping original shortlist`);
        }
      }
    }

    console.log(`🎯 Final install shortlist: [${shortlist.join(', ')}]`);
    return shortlist;
  }

  /**
   * NEW: resolve final Secondary after Anchor is known.
   */
  public resolveSecondary(installedChoice: string, anchorFace: string, shortlistOrdered: string[], allFacesOrderedByIL: string[]): string {
    console.log(`🔄 COLLISION CHECK: installedChoice=${installedChoice}, anchorFace=${anchorFace}`);
    
    if (installedChoice !== anchorFace) {
      console.log(`✅ No collision: returning installedChoice=${installedChoice}`);
      return installedChoice;
    }
    
    console.log(`⚠️ COLLISION DETECTED: installedChoice equals anchorFace!`);
    console.log(`🔍 Looking for alternative in shortlist: [${shortlistOrdered.join(', ')}]`);
    
    const alt = shortlistOrdered.find(f => f !== anchorFace);
    if (alt) {
      console.log(`✅ Found alternative in shortlist: ${alt}`);
      return alt;
    }
    
    console.log(`🔍 Looking for alternative in allFacesByIL: [${allFacesOrderedByIL.join(', ')}]`);
    const altFromAll = allFacesOrderedByIL.find(f => f !== anchorFace);
    if (altFromAll) {
      console.log(`✅ Found alternative in allFacesByIL: ${altFromAll}`);
      return altFromAll;
    }
    
    console.log(`❌ No alternative found! This should never happen. Returning installedChoice as fallback.`);
    return installedChoice; // degenerate case: keep installedChoice
  }

  /**
   * Get installed statements for Phase D shortlist
   * @param faceIds - Array of face IDs from the shortlist
   * @returns Array of installed statements with face IDs
   */
  public getInstalledStatements(faceIds: string[]): Array<{
    faceId: string;
    statement: string;
    label: string;
    family: string;
    cues: string[];
  }> {
    return faceIds.map(faceId => {
      const data = this.FACE_INSTALLED_STATEMENTS[faceId];
      if (!data) {
        console.warn(`No installed statement found for face: ${faceId}`);
        return {
          faceId,
          statement: `People expect me to **${faceId.split(':')[1] || 'Unknown'}** role.`,
          label: faceId.split(':')[1] || 'Unknown',
          family: faceId.split(':')[0] || 'Unknown',
          cues: ['Role-specific behavior']
        };
      }
      return {
        faceId,
        ...data
      };
    });
  }

  /**
   * NEW: Build Phase D install shortlist from quiz state
   */
  public buildPhaseDInstallShortlist(
    state: any,
    a26Faces: string[],
    moduleTopFamilies: string[]
  ): string[] {
    console.log("🎯 PHASE D - BUILDING INSTALL SHORTLIST");
    console.log("📊 Input parameters:", { 
      a26Faces: a26Faces, 
      moduleTopFamilies: moduleTopFamilies,
      totalLines: state.lines.length
    });
    
    // Get anchor candidate families
    const aCandFamilies = this.computeAnchorCandidateFamilies(a26Faces, moduleTopFamilies);
    console.log("🏆 Anchor candidate families computed:", Array.from(aCandFamilies));
    
    const aCandPrizeFaces = new Set(
      Array.from(aCandFamilies).map(fam => {
        // For each family, get both possible faces and their prize mirrors
        const familyFaces = this.FAMILY_FACES[fam] || [];
        const prizeMirrors = familyFaces.map(face => getPrizeMirror(face)).filter(Boolean);
        return prizeMirrors;
      }).flat()
    );
    console.log("🎁 Prize mirror faces computed:", Array.from(aCandPrizeFaces));
    
    // Build all faces with their paths
    const allFaces: {face: string, source: "A"|"M", bPath?: ("C"|"O"|"F")[], mPath?: ("C"|"O"|"F")[]}[] = [];
    
    // Add A-line faces from Phase B
    console.log("🔍 Processing A-lines from Phase B:");
    state.lines.forEach((line: any) => {
      if (line.selectedA && line.B?.picks && line.B.picks.length > 0) {
        // Phase B picks are stored as strings like "C", "O", "F"
        const bPath = line.B.picks as ("C"|"O"|"F")[];
        const face = this.determineFaceFromBPath(line.id, bPath);
        console.log(`  → ${line.id}: B-path [${bPath.join(', ')}] → ${face}`);
        allFaces.push({ face, source: "A", bPath });
      } else if (line.selectedA) {
        console.log(`  ⚠️ ${line.id}: Selected as A-line but no Phase B picks found`);
      }
    });
    
    // Add Module faces from Phase C
    console.log("🔍 Processing Module lines from Phase C:");
    state.lines.forEach((line: any) => {
      if (!line.selectedA && line.mod?.decisions && line.mod.decisions.length > 0) {
        // Phase C decisions are stored as {type, pick} objects
        const mPath = line.mod.decisions.map((decision: any) => decision.pick) as ("C"|"O"|"F")[];
        const face = this.determineFaceFromModuleDecisions(line.id, line.mod.decisions);
        console.log(`  → ${line.id}: M-path [${mPath.join(', ')}] → ${face}`);
        allFaces.push({ face, source: "M", mPath });
      } else if (!line.selectedA) {
        console.log(`  ⚠️ ${line.id}: Not selected as A-line but no Phase C decisions found`);
      }
    });
    
    console.log("📋 All faces collected for IL calculation:", allFaces.map(f => ({
      face: f.face,
      source: f.source,
      path: f.source === "A" ? f.bPath : f.mPath
    })));
    
    // Build shortlist using IL scoring
    const shortlist = this.buildInstallShortlist(allFaces, aCandFamilies, aCandPrizeFaces);
    
    console.log("🎯 PHASE D - FINAL INSTALL SHORTLIST:", shortlist);
    return shortlist;
  }

  /**
   * Helper: compute face purity from Phase B path
   */
  private computeFacePurityFromB(bPath: ("C"|"O"|"F")[]): number {
    const cCount = bPath.filter(p => p === "C").length;
    const oCount = bPath.filter(p => p === "O").length;
    const fCount = bPath.filter(p => p === "F").length;
    
    if (cCount + oCount === 0) return 0;
    return (cCount * 2.0 + oCount * 1.0) / (cCount + oCount);
  }

  /**
   * Get IL scores for display in Face Scoreboard
   */
  public getILScores(): Record<string, number> {
    // Return the IL scores that were calculated during Phase D
    console.log('📊 getILScores called, current stored scores:', this.calculatedILScores);
    console.log('📊 Number of stored scores:', Object.keys(this.calculatedILScores).length);
    
    if (Object.keys(this.calculatedILScores).length > 0) {
      console.log('📊 Returning calculated IL scores:', this.calculatedILScores);
      return { ...this.calculatedILScores };
    }
    
    // Fallback to empty object if no scores calculated yet
    console.log('⚠️ No IL scores calculated yet, returning empty object');
    return {};
  }

  /**
   * NEW: SIF Canon v3 finalization with InstalledLikelihood
   */
  public finalizeSIFWithInstall(
    state: any,
    anchorFace: string,
    allFacesByIL?: string[]
  ): SIFResult {
    console.log("SIF FINAL RESULT (CANON V3): Starting finalization", { anchorFace });
    
    const primaryFamily = FACE_TO_FAMILY[anchorFace];
    const prizeFace = getPrizeMirror(anchorFace);
    
    // Get installed choice from state
    const installedChoice = state.installedChoice || "";
    const shortlist = state.sifShortlist || [];
    
    console.log("SIF FINAL RESULT (CANON V3):", {
      anchorFace,
      primaryFamily,
      prizeFace,
      installedChoice,
      shortlist
    });
    
    // Resolve Secondary using the new method
    console.log("🔄 RESOLVING SECONDARY:", {
      installedChoice,
      anchorFace,
      shortlist,
      allFacesByIL: allFacesByIL || []
    });
    
    const secondaryFace = this.resolveSecondary(installedChoice, anchorFace, shortlist, allFacesByIL || []);
    const secondaryFamily = FACE_TO_FAMILY[secondaryFace];
    
    console.log("✅ SECONDARY RESOLVED:", {
      secondaryFace,
      secondaryFamily,
      wasCollision: installedChoice === anchorFace
    });
    
    // Compute badge from frozen verdicts (you'll need to implement this)
    const badge = this.computeSecondaryBadgeFromFrozen(secondaryFace, state);
    
    const result = {
      primary: {
        family: primaryFamily,
        face: anchorFace
      },
      secondary: {
        family: secondaryFamily,
        face: secondaryFace
      },
      prize: prizeFace,
      badge,
      context: {
        friction: this.getFrictionContext()
      }
    };
    
    console.log("SIF FINAL RESULT (CANON V3):", result);
    return result;
  }

  /**
   * Helper: Compute secondary badge from frozen verdicts
   */
  private computeSecondaryBadgeFromFrozen(secondaryFace: string, state: any): 'Aligned' | 'Installed from outside' | 'Not yet aligned' {
    // This is a simplified implementation - you may need to adjust based on your badge logic
    const secondaryFamily = FACE_TO_FAMILY[secondaryFace];
    const famF = this.counters.famF[secondaryFamily] || 0;
    const sevF = this.counters.sevF[secondaryFamily] || 0;
    const famC = this.counters.famC[secondaryFamily] || 0;
    const famO = this.counters.famO[secondaryFamily] || 0;
    
    const II = Math.min(famF + sevF, 3);
    const SI = (famC + famO) > 0 ? famC / (famC + famO) : 0.5;
    
    if (II >= 2 || SI < 0.5) {
      return 'Installed from outside';
    } else {
      return 'Not yet aligned';
    }
  }

  /**
   * Helper: Get friction context
   */
  private getFrictionContext(): Record<string, number> {
    const friction: Record<string, number> = {};
    Object.keys(this.counters.famF).forEach(family => {
      if (this.counters.famF[family] > 0) {
        friction[family] = this.counters.famF[family];
      }
    });
    return friction;
  }

  /**
   * DEPRECATED: Legacy FaceScore calculation - use IL shortlist instead
   * @deprecated Use buildInstallShortlist() and resolveSecondary() instead
   */
  calculateSIF(primaryFamily: string, primaryFace: string, familyVerdicts: Record<string, "C" | "O" | "F">, prizeFace?: string): SIFResult {
    // Determine prize face using Prize Mirror mapping
    const prizeMirror = getPrizeMirror(primaryFace);
    const actualPrizeFace = prizeFace || prizeMirror || FAMILY_TO_PRIZE[primaryFamily] || primaryFace;
    
    console.log('🎯 SIF CALCULATION START:', {
      primaryFamily,
      primaryFace,
      prizeFace: actualPrizeFace,
      prizeMirror: getPrizeMirror(primaryFace),
      familyVerdicts,
      counters: this.counters
    });

    // Defensive prize calculation: derive family verdicts if empty
    let effectiveFamilyVerdicts = familyVerdicts;
    if (Object.keys(familyVerdicts).length === 0) {
      console.warn('⚠️ Empty familyVerdicts - deriving from SIF counters as fallback');
      
      // Derive family verdicts from SIF counters
      // If a family has famF > 0, it's F; otherwise if famC > famO, it's C; else O
      effectiveFamilyVerdicts = {};
      const allFamilies = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
      
      allFamilies.forEach(family => {
        const famC = this.counters.famC[family] || 0;
        const famO = this.counters.famO[family] || 0;
        const famF = this.counters.famF[family] || 0;
        
        if (famF > 0) {
          effectiveFamilyVerdicts[family] = 'F';
        } else if (famC > famO) {
          effectiveFamilyVerdicts[family] = 'C';
        } else if (famO > famC) {
          effectiveFamilyVerdicts[family] = 'O';
        } else {
          // No data - default to O (neutral)
          effectiveFamilyVerdicts[family] = 'O';
        }
      });
      
      console.log('🎯 Derived family verdicts from SIF counters:', effectiveFamilyVerdicts);
    }

    // Get all faces with their families
    const allFaces = Object.keys(FACE_TO_FAMILY).map(face => ({
      face,
      family: FACE_TO_FAMILY[face]
    }));

    // Filter candidates: exclude entire primary family and F-verdict families
    const primaryFamilyFromFace = primaryFace.split(':')[0]; // Extract family from "Family:Face"
    const candidatePool = allFaces.filter(({ face, family }) => {
      const isNotPrimaryFamily = family !== primaryFamilyFromFace;
      const familyNotF = effectiveFamilyVerdicts[family] !== 'F';
      return isNotPrimaryFamily && familyNotF;
    });
    
    console.log('🎯 SIF Candidate Pool (after exclusions):', {
      primaryFace,
      excludedFaces: allFaces.filter(({ face, family }) => face === primaryFace.split(':')[1] || effectiveFamilyVerdicts[family] === 'F'),
      candidatePool
    });

    // Log the face counters and opportunities for debugging
    console.debug('SIFEngine faceC counters:', this.counters.faceC);
    console.debug('SIFEngine faceO counters:', this.counters.faceO);
    console.debug('SIFEngine opportunities:', this.opportunities);
    
    // Score each candidate face using the correct formula
    const scoredCandidates = candidatePool.map(({ face, family }) => {
      const faceKey = `${family}:${face}`;  // e.g. "Control:Rebel"
      const pos = this.counters.faceC?.[faceKey] ?? 0;  // direct "fits me" votes
      const neg = this.counters.faceO?.[faceKey] ?? 0;  // "not me" votes
      const opportunities = this.opportunities[faceKey] ?? 0;  // total opportunities
      const rawNI = Math.max(0, pos - neg);  // or just `pos` if that's the spec
      
      // Calculate rates for transparency
      const positiveRate = opportunities > 0 ? (pos / opportunities).toFixed(3) : '0.000';
      const negativeRate = opportunities > 0 ? (neg / opportunities).toFixed(3) : '0.000';
      const famC = this.counters.famC[family] || 0;
      const famO = this.counters.famO[family] || 0;
      const famF = this.counters.famF[family] || 0;
      const sevF = this.counters.sevF[family] || 0;
      
      const hasExposure = (famC + famO) > 0;
      const SI = hasExposure ? famC / (famC + famO) : 0.5;  // Family stability, neutral if no answers
      console.debug(`SI for ${family}: ${SI.toFixed(3)} ${hasExposure ? '' : '(neutral fallback)'}`);
      const II = Math.min(famF + sevF, 3);  // Instability, capped at 3
      
      return {
        face,
        family,
        rawNI,
        SI,
        II,
        famC,
        famO
      };
    });

    // Normalize after computing rawNI for all candidates
    const maxNI = Math.max(0, ...scoredCandidates.map(c => c.rawNI));
    const finalCandidates = scoredCandidates.map(c => {
      const NI = maxNI > 0 ? c.rawNI / maxNI : 0;
      const faceScore = 0.5 * NI + 0.5 * c.SI - 0.1 * c.II;
      
      return {
        face: c.face,
        family: c.family,
        score: faceScore,
        NI,
        SI: c.SI,
        II: c.II,
        rawNI: c.rawNI
      };
    });

    // Log all face scores with rates for debugging
    console.log('🎯 SIF Face Scores (before sorting):', finalCandidates.map(c => {
      const faceKey = `${c.family}:${c.face}`;
      const opportunities = this.opportunities[faceKey] ?? 0;
      const pos = this.counters.faceC[faceKey] ?? 0;
      const neg = this.counters.faceO[faceKey] ?? 0;
      const positiveRate = opportunities > 0 ? (pos / opportunities).toFixed(3) : '0.000';
      const negativeRate = opportunities > 0 ? (neg / opportunities).toFixed(3) : '0.000';
      
      return {
        face: c.face,
        family: c.family,
        rawNI: c.rawNI,
        NI: c.NI.toFixed(3),
        SI: c.SI.toFixed(3),
        II: c.II,
        score: c.score.toFixed(3),
        opportunities,
        positiveRate,
        negativeRate,
        votes: `${pos}+/${neg}-`
      };
    }));

    // Sort by score with proper tie-breaking
    const sortedCandidates = finalCandidates.sort((a, b) => {
      // Primary: highest score
      if (Math.abs(a.score - b.score) > 1e-9) {
        return b.score - a.score;
      }
      // Tie-breaker 1: higher NI (more clean wins for the face)
      if (a.NI !== b.NI) {
        return b.NI - a.NI;
      }
      // Tie-breaker 2: higher SI (more stable family)
      if (Math.abs(a.SI - b.SI) > 1e-9) {
        return b.SI - a.SI;
      }
      // Tie-breaker 3: lower II (less instability)
      return a.II - b.II;
    });

    const secondary = sortedCandidates[0];
    
    console.log('🎯 SIF Face Scores Ranking:', sortedCandidates.map(c => ({
      face: c.face,
      family: c.family,
      score: c.score.toFixed(3),
      NI: c.NI,
      SI: c.SI.toFixed(3),
      II: c.II
    })));
    
    console.log('🎯 SIF Selected Secondary:', {
      secondaryFace: secondary.face,
      secondaryFamily: secondary.family,
      score: secondary.score.toFixed(3)
    });

    // Determine badge based on secondary family stability
    const secondaryII = secondary.II;
    const secondarySI = secondary.SI;
    
    // Compare prizes using full keys
    const fullSecondary = `${secondary.family}:${secondary.face}`; // "Control:Rebel"
    const matchesPrize = fullSecondary === actualPrizeFace; // prizeFace stored as "Family:Face"
    
    console.log('🎯 SIF Badge Calculation:', {
      fullSecondary,
      prizeFace: actualPrizeFace,
      secondaryII,
      secondarySI: secondarySI.toFixed(3),
      matchesPrize,
      comparison: `"${fullSecondary}" === "${actualPrizeFace}"`
    });
    
    let badge: 'Aligned' | 'Installed from outside' | 'Not yet aligned';
    if (matchesPrize) {
      badge = 'Aligned';
      console.log('🎯 SIF Badge: Aligned (matches prize face)');
    } else if (secondaryII >= 2 || secondarySI < 0.5) {
      badge = 'Installed from outside';
      console.log('🎯 SIF Badge: Installed from outside (II >= 2 or SI < 0.5)');
    } else {
      badge = 'Not yet aligned';
      console.log('🎯 SIF Badge: Not yet aligned (default)');
    }

    // Build context with friction counts
    const friction: Record<string, number> = {};
    Object.keys(this.counters.famF).forEach(family => {
      if (this.counters.famF[family] > 0) {
        friction[family] = this.counters.famF[family];
      }
    });

    const result = {
      primary: {
        family: primaryFamily,
        face: primaryFace
      },
      secondary: {
        family: secondary.family,
        face: secondary.face
      },
      prize: actualPrizeFace,
      badge,
      context: {
        friction
      }
    };
    
    console.log('🎯 SIF FINAL RESULT:', result);
    console.log('🎯 SIF Friction Points:', friction);
    
    return result;
  }

  /**
   * Get current counters (for debugging)
   */
  getCounters(): SIFCounters {
    const result = { ...this.counters };
    console.log('📊 SIF getCounters called, returning:', {
      sevF: result.sevF,
      sevFKeys: Object.keys(result.sevF),
      sevFValues: Object.values(result.sevF),
      sevFEntries: Object.entries(result.sevF)
    });
    return result;
  }

  /**
   * Reset all counters
   */
  reset(): void {
    this.initializeCounters();
    // Don't clear IL scores on reset - they should persist through finalization
    // this.calculatedILScores = {}; // Clear stored IL scores
  }

  /**
   * Clear IL scores (call this when starting a new quiz)
   */
  clearILScores(): void {
    this.calculatedILScores = {};
  }

  /**
   * Get SIF results (placeholder method)
   */
  getSIFResults(): any {
    // This is a placeholder method - SIF results are typically calculated elsewhere
    // Return the current counters as a basic result
    return {
      counters: this.counters,
      ilScores: this.calculatedILScores
    };
  }

  /**
   * Get enhanced report with SIF preference and IL origin analysis
   */
  getEnhancedReport(): any {
    const sifResult = this.getSIFResults();
    return this.contextEnhancer.generateEnhancedReport(sifResult);
  }

  /**
   * Get origin insights for a specific face
   */
  getOriginInsights(face: string): any {
    return this.contextEnhancer.getOriginInsights(face);
  }

  /**
   * Clear context history (for new quiz sessions)
   */
  clearContextHistory(): void {
    this.contextEnhancer.clearContextHistory();
  }

  /**
   * Record user installed choice for internal candidate tracking
   */
  recordUserInstalled(face: string): void {
    this.sifUserInstalls[face] = (this.sifUserInstalls[face] ?? 0) + 1;
    this.sifLastPick = face;
    console.log(`📊 SIF User Install recorded: ${face} (total: ${this.sifUserInstalls[face]})`);
  }

  /**
   * Record origin event for internal origin share calculation
   */
  recordOriginEvent(face: string, locus: 'internal' | 'external' | 'mixed'): void {
    if (!this.originEvents[face]) {
      this.originEvents[face] = { internal: 0, external: 0, mixed: 0 };
    }
    this.originEvents[face][locus]++;
    console.log(`📊 Origin Event recorded: ${face} -> ${locus} (${this.originEvents[face][locus]})`);
  }

  /**
   * Track origin event from context tags in question options
   */
  private trackOriginEventFromContext(question: any, choice: 'A' | 'B', face: string): void {
    const option = question.options.find((opt: any) => opt.key === choice);
    if (!option?.context?.locus) return;
    
    const locus = option.context.locus;
    if (locus === 'internal' || locus === 'external' || locus === 'mixed') {
      this.recordOriginEvent(face, locus);
    }
  }

  /**
   * Get internal origin share for a face
   */
  getInternalOriginShare(face: string): number {
    const events = this.originEvents[face] ?? { internal: 0, external: 0, mixed: 0 };
    const total = events.internal + events.external + events.mixed;
    if (total <= 0) return 0;
    
    const mixedAsInternal = 0.5 * events.mixed; // Tuneable weight for mixed events
    return (events.internal + mixedAsInternal) / total;
  }

  /**
   * Get normalized SIF user installs across all faces
   */
  getSifNorm(): Record<string, number> {
    const values = Object.values(this.sifUserInstalls);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min;
    
    if (range === 0) {
      // If all values are the same, return equal weights
      const faces = Object.keys(this.sifUserInstalls);
      return faces.reduce((acc, face) => ({ ...acc, [face]: 0.5 }), {});
    }
    
    return Object.entries(this.sifUserInstalls).reduce((acc, [face, count]) => {
      acc[face] = (count - min) / range;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get all faces from Phase B and Phase C results
   */
  getAllFaces(): Array<{ id: string; family: string }> {
    const faces: Array<{ id: string; family: string }> = [];
    
    // Add all faces from family mappings
    Object.entries(this.FAMILY_FACES).forEach(([family, facePair]) => {
      facePair.forEach(face => {
        faces.push({ id: face, family });
      });
    });
    
    return faces;
  }

  /**
   * Get internal candidates for Phase E anchor selection
   */
  getInternalCandidates(options: {
    excludeFamilies: string[];
    max: number;
    fitFloor?: number;
  }): Array<{ id: string; family: string; reason: string; internalSelect: number }> {
    const { excludeFamilies, max, fitFloor = 0.20 } = options;
    const sifNorm = this.getSifNorm();
    const faces = this.getAllFaces();
    
    console.log('🔍 Computing internal candidates:', {
      excludeFamilies,
      max,
      fitFloor,
      sifNorm,
      originEvents: this.originEvents
    });
    
    const scored = faces
      .filter(f => !excludeFamilies.includes(f.family))
      .map(f => {
        const internalShare = this.getInternalOriginShare(f.id);
        const sifScore = sifNorm[f.id] ?? 0;
        const internalSelect = 0.6 * internalShare + 0.4 * sifScore;
        
        return {
          face: f,
          internalSelect,
          internalShare,
          sifScore
        };
      })
      .filter(f => f.internalSelect >= fitFloor) // Apply fit floor
      .sort((a, b) => b.internalSelect - a.internalSelect);
    
    console.log('🔍 Scored internal candidates:', scored);
    
    // Prefer last installed choice if it scored high enough
    const last = this.sifLastPick;
    const candidates: Array<{ id: string; family: string; reason: string; internalSelect: number }> = [];
    
    if (last) {
      const lastIndex = scored.findIndex(x => x.face.id === last);
      if (lastIndex >= 0) {
        const lastCandidate = scored[lastIndex];
        candidates.push({
          id: lastCandidate.face.id,
          family: lastCandidate.face.family,
          reason: `Recent pick: InternalShare=${lastCandidate.internalShare.toFixed(2)} · SIF=${lastCandidate.sifScore.toFixed(2)}`,
          internalSelect: lastCandidate.internalSelect
        });
        scored.splice(lastIndex, 1); // Remove from remaining list
      }
    }
    
    // Add remaining candidates up to max
    for (const candidate of scored) {
      if (candidates.length >= max) break;
      candidates.push({
        id: candidate.face.id,
        family: candidate.face.family,
        reason: `InternalShare=${candidate.internalShare.toFixed(2)} · SIF=${candidate.sifScore.toFixed(2)}`,
        internalSelect: candidate.internalSelect
      });
    }
    
    console.log('🔍 Final internal candidates:', candidates);
    return candidates;
  }
}
