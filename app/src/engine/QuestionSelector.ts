/**
 * Deterministic Question Selection Engine
 * 
 * Contract: Exact matching by (phase, lineId, type, order) with no fallbacks
 * No random selection, no substring matching, no "vibes"
 */

export type LineId = 'Control' | 'Pace' | 'Boundary' | 'Truth' | 'Recognition' | 'Bonding' | 'Stress';
export type ModuleType = 'CO' | 'CF';
export type ModuleOrder = 1 | 2 | 3;
export type DuelType = 'CO' | 'CF';
export type DuelOrder = 1 | 2;

export interface ModuleQuestion {
  id: string;
  phase: 'C';
  lineId: string;
  type: ModuleType;
  order: ModuleOrder;
  prompt: string;
  options: { A: string; B: string };
  mappings: { A: string; B: string };
}

export interface DuelQuestion {
  id: string;
  phase: 'B';
  lineId: string;
  type: DuelType;
  order: DuelOrder;
  prompt: string;
  options: { A: string; B: string };
  mappings: { A: string; B: string };
}

export interface SeverityProbeQuestion {
  id: string;
  phase: 'C' | 'D';
  lineId: string;
  prompt: string;
  options: { A: string; B: string; C: string };
  mappings: { A: string; B: string; C: string };
}

export interface TelemetryEvent {
  type: 'view_question' | 'pick_option' | 'compute_verdict' | 'severity_select' | 'phase_complete';
  phase: 'B' | 'C';
  lineId: string;
  questionId?: string;
  decisionType?: 'CO1' | 'CO2' | 'CF';
  pick?: 'C' | 'O' | 'F';
  verdict?: 'C' | 'O' | 'F';
  level?: 'high' | 'mid' | 'low';
  score?: number;
  latencyMs?: number;
  ts: number;
}

export class QuestionSelector {
  private moduleIndex: Map<string, Map<ModuleType, Map<ModuleOrder, ModuleQuestion[]>>> = new Map();
  private duelIndex: Map<string, Map<DuelType, Map<DuelOrder, DuelQuestion[]>>> = new Map();
  private severityIndex: Map<string, SeverityProbeQuestion> = new Map();
  private usedQuestions: Set<string> = new Set();
  private telemetryEvents: TelemetryEvent[] = [];

  constructor(
    moduleQuestions: ModuleQuestion[],
    duelQuestions: DuelQuestion[],
    severityQuestions: SeverityProbeQuestion[]
  ) {
    this.buildIndexes(moduleQuestions, duelQuestions, severityQuestions);
  }

  private buildIndexes(
    moduleQuestions: ModuleQuestion[],
    duelQuestions: DuelQuestion[],
    severityQuestions: SeverityProbeQuestion[]
  ) {
    // Build module question index: byLine[lineId][type][order] -> ModuleQuestion[]
    for (const q of moduleQuestions) {
      if (!this.moduleIndex.has(q.lineId)) {
        this.moduleIndex.set(q.lineId, new Map());
      }
      const lineMap = this.moduleIndex.get(q.lineId)!;
      
      if (!lineMap.has(q.type)) {
        lineMap.set(q.type, new Map());
      }
      const typeMap = lineMap.get(q.type)!;
      
      if (!typeMap.has(q.order)) {
        typeMap.set(q.order, []);
      }
      typeMap.get(q.order)!.push(q);
    }

    // Build duel question index: byLine[lineId][type][order] -> DuelQuestion[]
    for (const q of duelQuestions) {
      if (!this.duelIndex.has(q.lineId)) {
        this.duelIndex.set(q.lineId, new Map());
      }
      const lineMap = this.duelIndex.get(q.lineId)!;
      
      if (!lineMap.has(q.type)) {
        lineMap.set(q.type, new Map());
      }
      const typeMap = lineMap.get(q.type)!;
      
      if (!typeMap.has(q.order)) {
        typeMap.set(q.order, []);
      }
      typeMap.get(q.order)!.push(q);
    }

    // Build severity question index: byLine[lineId] -> SeverityProbeQuestion
    for (const q of severityQuestions) {
      if (q.phase === 'C') {
        this.severityIndex.set(q.lineId, q);
      }
    }
  }

  /**
   * Select first unused module question matching exact criteria
   * Contract: No fallbacks, no random selection, exact matching only
   */
  selectModuleQuestion(
    lineId: string,
    type: ModuleType,
    order: ModuleOrder
  ): ModuleQuestion | null {
    const questions = this.moduleIndex
      .get(lineId)
      ?.get(type)
      ?.get(order) || [];

    const unused = questions.find(q => !this.usedQuestions.has(q.id));
    
    if (unused) {
      this.emitTelemetry({
        type: 'view_question',
        phase: 'C',
        lineId,
        questionId: unused.id,
        ts: Date.now()
      });
    }

    return unused || null;
  }

  /**
   * Select first unused duel question matching exact criteria
   * Contract: No fallbacks, no random selection, exact matching only
   */
  selectDuelQuestion(
    lineId: string,
    type: DuelType,
    order: DuelOrder
  ): DuelQuestion | null {
    const questions = this.duelIndex
      .get(lineId)
      ?.get(type)
      ?.get(order) || [];

    const unused = questions.find(q => !this.usedQuestions.has(q.id));
    
    if (unused) {
      this.emitTelemetry({
        type: 'view_question',
        phase: 'B',
        lineId,
        questionId: unused.id,
        ts: Date.now()
      });
    }

    return unused || null;
  }

  /**
   * Get severity probe for line (exactly one per line)
   * Contract: Direct lookup, no usedQuestions check needed
   */
  getSeverityProbe(lineId: string): SeverityProbeQuestion | null {
    return this.severityIndex.get(lineId) || null;
  }

  /**
   * Mark question as used
   * Contract: Immutable operation, no side effects
   */
  markUsed(questionId: string): void {
    this.usedQuestions.add(questionId);
  }

  /**
   * Get all used question IDs
   */
  getUsedQuestions(): string[] {
    return Array.from(this.usedQuestions);
  }

  /**
   * Emit telemetry event
   * Contract: Lightweight, no PII, ids only
   */
  private emitTelemetry(event: TelemetryEvent): void {
    this.telemetryEvents.push(event);
    
    // In production, send to telemetry service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to telemetry service
      console.log('Telemetry:', event);
    }
  }

  /**
   * Get telemetry events for debugging
   */
  getTelemetryEvents(): TelemetryEvent[] {
    return [...this.telemetryEvents];
  }

  /**
   * Record pick with telemetry
   */
  recordPick(
    phase: 'B' | 'C',
    lineId: string,
    decisionType: 'CO1' | 'CO2' | 'CF',
    pick: 'C' | 'O' | 'F',
    questionId: string,
    latencyMs: number = 0
  ): void {
    this.markUsed(questionId);
    
    this.emitTelemetry({
      type: 'pick_option',
      phase,
      lineId,
      questionId,
      decisionType,
      pick,
      latencyMs,
      ts: Date.now()
    });
  }

  /**
   * Record verdict computation
   */
  recordVerdict(
    lineId: string,
    key: string,
    verdict: 'C' | 'O' | 'F'
  ): void {
    this.emitTelemetry({
      type: 'compute_verdict',
      phase: 'C',
      lineId,
      verdict,
      ts: Date.now()
    });
  }

  /**
   * Record severity selection
   */
  recordSeveritySelect(
    lineId: string,
    level: 'high' | 'mid' | 'low',
    score: number
  ): void {
    this.emitTelemetry({
      type: 'severity_select',
      phase: 'C',
      lineId,
      level,
      score,
      ts: Date.now()
    });
  }

  /**
   * Record phase completion
   */
  recordPhaseComplete(phase: 'B' | 'C'): void {
    this.emitTelemetry({
      type: 'phase_complete',
      phase,
      lineId: 'Control', // Dummy value for phase events
      ts: Date.now()
    });
  }
}
