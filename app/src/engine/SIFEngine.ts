/**
 * SIF (Secondary Identity Face) Engine
 * 
 * Handles counting signals during quiz phases and calculating SIF in Phase D
 * Follows the SIF specification: count during run, decide at Phase D
 */

import { SIFCounters, SIFResult, FACE_TO_FAMILY, FAMILY_TO_FACES, FAMILY_TO_PRIZE, PRIZE_MIRROR_MAP, getPrizeMirror } from '@/types/quiz';

export class SIFEngine {
  private counters: SIFCounters;
  private didRecordAll: boolean = false;
  private didRecordPhaseD: boolean = false;
  private snapshot: any = null;
  private opportunities: Record<string, number> = {}; // Track opportunities per face

  // Family-to-archetype mapping for face determination
  private readonly FAMILY_FACES: Record<string, [string, string]> = {
    Control: ["Control:Sovereign", "Control:Rebel"],
    Pace: ["Pace:Navigator", "Pace:Driver"],
    Boundary: ["Boundary:Guardian", "Boundary:Equalizer"],
    Truth: ["Truth:Architect", "Truth:Seeker"],
    Recognition: ["Recognition:Spotlight", "Recognition:Diplomat"],
    Bonding: ["Bonding:Partner", "Bonding:Provider"],
    Stress: ["Stress:Catalyst", "Stress:Artisan"],
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
    "Pace:Driver": {
      statement: "People look to me to **imagine what's next and inspire direction**.",
      label: "Driver",
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
      faceO: {}
    };
  }

  // Helper to safely increment counters
  private inc(obj: Record<string, number>, key: string, by = 1): void {
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
   * Record answer during Phase B (duels)
   */
  recordPhaseBAnswer(family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B'): void {
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
   * Record answer during Phase C (fused items)
   * Records both family and face counters for the anchored face
   */
  recordPhaseCAnswer(family: string, questionType: 'CO' | 'CF', choice: 'A' | 'B', anchoredFace: string): void {
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
  recordSeverityProbe(family: string, severity: 'F0' | 'F0.5' | 'F1'): void {
    this.counters.sevF[family]++;
    console.log(`📊 SIF Severity Probe: ${family} severity ${severity} → sevF[${family}] = ${this.counters.sevF[family]}`);
    console.log('📊 SIF Counters after Severity Probe:', this.counters);
  }

  /**
   * NEW: compute anchor-candidate families BEFORE install (Phase D pre-step).
   */
  public computeAnchorCandidateFamilies(a26Faces: string[], moduleTopFamilies: string[]): Set<string> {
    // If any A-line 2.6 faces exist, use their families; else use module tops.
    return new Set(a26Faces.length ? a26Faces.map(f => FACE_TO_FAMILY[f]) : moduleTopFamilies);
  }

  /**
   * NEW: InstalledLikelihood scorer for a single face.
   */
  private installedLikelihoodForFace(face: string, source: "A"|"M", bPath?: ("C"|"O"|"F")[], mPath?: ("C"|"O"|"F")[], aCandFamilies?: Set<string>, aCandPrizeFaces?: Set<string>): number {
    let base = 0;
    if (source === "A" && bPath) {
      const earlyO   = bPath[0] === "O" ? 1 : 0;
      const fTouch   = bPath.indexOf("F") !== -1 ? 1 : 0;
      const oHits    = bPath.filter(p=>p==="O").length;
      const oRatio   = oHits / 2;
      const purity   = this.computeFacePurityFromB(bPath); // reuse your purity calc
      const purityGap= Math.max(0, Math.min(1, (2.6 - purity)/2));
      base = 1.6*earlyO + 1.2*fTouch + 0.8*oRatio + 0.8*purityGap;
    } else if (source === "M" && mPath) {
      const cCount     = mPath.filter(p=>p==="C").length;
      const driftRatio = (3 - cCount)/3;
      const endedF     = mPath[2] === "F" ? 1 : 0;
      const isCCC      = cCount === 3 ? 1 : 0;
      base = 1.6*isCCC + 1.4*endedF + 0.8*driftRatio;
    }
    base = Math.min(4.0, base);

    const family = FACE_TO_FAMILY[face];
    const sibBonus   = aCandFamilies?.has(family) ? 1.0 : 0.0;
    const prizeBonus = aCandPrizeFaces?.has(face) ? 0.5 : 0.0;

    return Math.min(5.0, base + sibBonus + prizeBonus);
  }

  /**
   * NEW: build shortlist of up to 4 installed suspects.
   */
  public buildInstallShortlist(allFaces: {face:string, source:"A"|"M", bPath?:("C"|"O"|"F")[], mPath?:("C"|"O"|"F")[]}[],
                                aCandFamilies: Set<string>, aCandPrizeFaces: Set<string>): string[] {
    const scored = allFaces.map(f => ({
      face: f.face,
      family: FACE_TO_FAMILY[f.face],
      IL: this.installedLikelihoodForFace(f.face, f.source, f.bPath, f.mPath, aCandFamilies, aCandPrizeFaces),
      fTouch: (f.source==="A" && f.bPath?.indexOf("F") !== -1) ? 1 : 0,
      endedF: (f.source==="M" && f.mPath?.[2]==="F") ? 1 : 0
    }));

    scored.sort((a,b)=>{
      if (b.IL !== a.IL) return b.IL - a.IL;
      if (b.fTouch !== a.fTouch) return b.fTouch - a.fTouch;
      if (b.endedF !== a.endedF) return b.endedF - a.endedF;
      return a.face.localeCompare(b.face);
    });

    const shortlist: string[] = [];
    const families: Record<string, number> = {};
    for (const s of scored) {
      if (shortlist.indexOf(s.face) === -1) {
        shortlist.push(s.face);
        families[s.family] = (families[s.family]||0) + 1;
        if (shortlist.length === 4) break;
      }
    }

    // diversity: if all 4 same family, replace #4 with best from another family
    if (shortlist.length === 4) {
      const fam0 = FACE_TO_FAMILY[shortlist[0]];
      const allSame = shortlist.every(f => FACE_TO_FAMILY[f] === fam0);
      if (allSame) {
        const replacement = scored.find(s => FACE_TO_FAMILY[s.face] !== fam0 && shortlist.indexOf(s.face) === -1);
        if (replacement) shortlist[3] = replacement.face;
      }
    }
    return shortlist;
  }

  /**
   * NEW: resolve final Secondary after Anchor is known.
   */
  public resolveSecondary(installedChoice: string, anchorFace: string, shortlistOrdered: string[], allFacesOrderedByIL: string[]): string {
    if (installedChoice !== anchorFace) return installedChoice;
    const alt = shortlistOrdered.find(f => f !== anchorFace) 
            ?? allFacesOrderedByIL.find(f => f !== anchorFace);
    return alt ?? installedChoice; // degenerate case: keep installedChoice
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
    console.log("PHASE D - BUILDING INSTALL SHORTLIST", { a26Faces, moduleTopFamilies });
    
    // Get anchor candidate families
    const aCandFamilies = this.computeAnchorCandidateFamilies(a26Faces, moduleTopFamilies);
    const aCandPrizeFaces = new Set(
      Array.from(aCandFamilies).map(fam => getPrizeMirror(fam+":dummy")).filter(Boolean)
    );
    
    // Build all faces with their paths
    const allFaces: {face: string, source: "A"|"M", bPath?: ("C"|"O"|"F")[], mPath?: ("C"|"O"|"F")[]}[] = [];
    
    // Add A-line faces from Phase B
    state.lines.forEach((line: any) => {
      if (line.selectedA && line.B?.picks && line.B.picks.length > 0) {
        // Phase B picks are stored as strings like "C", "O", "F"
        const bPath = line.B.picks as ("C"|"O"|"F")[];
        const face = this.determineFaceFromBPath(line.id, bPath);
        allFaces.push({ face, source: "A", bPath });
      }
    });
    
    // Add Module faces from Phase C
    state.lines.forEach((line: any) => {
      if (!line.selectedA && line.mod?.decisions && line.mod.decisions.length > 0) {
        // Phase C decisions are stored as {type, pick} objects
        const mPath = line.mod.decisions.map((decision: any) => decision.pick) as ("C"|"O"|"F")[];
        const face = this.determineFaceFromModuleDecisions(line.id, line.mod.decisions);
        allFaces.push({ face, source: "M", mPath });
      }
    });
    
    console.log("PHASE D - All faces for IL calculation:", allFaces);
    
    // Build shortlist using IL scoring
    const shortlist = this.buildInstallShortlist(allFaces, aCandFamilies, aCandPrizeFaces);
    
    console.log("PHASE D - INSTALL SHORTLIST:", shortlist);
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
    const installedChoice = state.sifResult?.installedChoice || "";
    const shortlist = state.sifResult?.shortlist || [];
    
    console.log("SIF FINAL RESULT (CANON V3):", {
      anchorFace,
      primaryFamily,
      prizeFace,
      installedChoice,
      shortlist
    });
    
    // Resolve Secondary using the new method
    const secondaryFace = this.resolveSecondary(installedChoice, anchorFace, shortlist, allFacesByIL || []);
    const secondaryFamily = FACE_TO_FAMILY[secondaryFace];
    
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
    return { ...this.counters };
  }

  /**
   * Reset all counters
   */
  reset(): void {
    this.initializeCounters();
  }
}
