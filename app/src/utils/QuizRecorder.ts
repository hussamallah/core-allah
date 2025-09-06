/**
 * Quiz Recorder - Tracks user choices and SIF data throughout the quiz
 */

export interface QuizRecord {
  timestamp: number;
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Summary';
  action: 'line_selected' | 'question_answered' | 'severity_assessed' | 'verdict_calculated' | 'sif_calculated';
  lineId?: string;
  questionId?: string;
  choice?: string;
  severity?: 'high' | 'mid' | 'low';
  verdict?: string;
  sifCounters?: Record<string, any>;
  sifResult?: any;
  details?: Record<string, any>;
}

class QuizRecorder {
  private records: QuizRecord[] = [];
  private isEnabled: boolean = true;

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  record(record: Omit<QuizRecord, 'timestamp'>) {
    if (!this.isEnabled) return;
    
    this.records.push({
      ...record,
      timestamp: Date.now()
    });
  }

  recordLineSelection(phase: QuizRecord['phase'], lineId: string) {
    this.record({
      phase,
      action: 'line_selected',
      lineId
    });
  }

  recordQuestionAnswer(phase: QuizRecord['phase'], lineId: string, questionId: string, choice: string, details?: Record<string, any>) {
    this.record({
      phase,
      action: 'question_answered',
      lineId,
      questionId,
      choice,
      details
    });
  }

  recordSeverityAssessment(lineId: string, severity: 'high' | 'mid' | 'low', sifCounters: Record<string, any>) {
    this.record({
      phase: 'C',
      action: 'severity_assessed',
      lineId,
      severity,
      sifCounters: { ...sifCounters }
    });
  }

  recordVerdictCalculation(lineId: string, verdict: string, decisions: any[], phase: 'C' | 'D' = 'D') {
    this.record({
      phase,
      action: 'verdict_calculated',
      lineId,
      verdict,
      details: { decisions }
    });
  }

  recordSIFCalculation(sifResult: any, sifCounters: Record<string, any>) {
    this.record({
      phase: 'D',
      action: 'sif_calculated',
      sifResult: { ...sifResult },
      sifCounters: { ...sifCounters }
    });
  }

  getRecords(): QuizRecord[] {
    return [...this.records];
  }

  getRecordsByPhase(phase: QuizRecord['phase']): QuizRecord[] {
    return this.records.filter(r => r.phase === phase);
  }

  getRecordsByAction(action: QuizRecord['action']): QuizRecord[] {
    return this.records.filter(r => r.action === action);
  }

  getRecordsForLine(lineId: string): QuizRecord[] {
    return this.records.filter(r => r.lineId === lineId);
  }

  getSummary(): {
    totalRecords: number;
    phaseBreakdown: Record<string, number>;
    actionBreakdown: Record<string, number>;
    linesInvolved: string[];
    severityAssessments: number;
    verdictsCalculated: number;
  } {
    const phaseBreakdown: Record<string, number> = {};
    const actionBreakdown: Record<string, number> = {};
    const linesInvolved = new Set<string>();
    let severityAssessments = 0;
    let verdictsCalculated = 0;

    this.records.forEach(record => {
      phaseBreakdown[record.phase] = (phaseBreakdown[record.phase] || 0) + 1;
      actionBreakdown[record.action] = (actionBreakdown[record.action] || 0) + 1;
      
      if (record.lineId) {
        linesInvolved.add(record.lineId);
      }
      
      if (record.action === 'severity_assessed') {
        severityAssessments++;
      }
      
      if (record.action === 'verdict_calculated') {
        verdictsCalculated++;
      }
    });

    return {
      totalRecords: this.records.length,
      phaseBreakdown,
      actionBreakdown,
      linesInvolved: Array.from(linesInvolved),
      severityAssessments,
      verdictsCalculated
    };
  }

  exportToJSON(): string {
    return JSON.stringify({
      records: this.records,
      summary: this.getSummary(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  clear() {
    this.records = [];
  }
}

// Singleton instance
export const quizRecorder = new QuizRecorder();

// Enable by default in development
if (process.env.NODE_ENV === 'development') {
  quizRecorder.enable();
}
