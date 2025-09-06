/**
 * Performance Optimizer for Quiz Engine
 * 
 * Contract: Preindex questions, keep bitset for used questions
 * Soft cap: at least 5 items per (lineId,type,order) in bank
 */

export interface PerformanceConfig {
  maxQuestionsPerCombination: number;
  enableBitset: boolean;
  enablePreindexing: boolean;
  enableTelemetrySampling: boolean;
  telemetrySamplingRate: number; // 0.0 to 1.0
}

export interface PerformanceMetrics {
  totalQuestions: number;
  indexedQuestions: number;
  usedQuestions: number;
  unusedQuestions: number;
  averageLookupTime: number;
  memoryUsage: number;
  telemetryEvents: number;
}

export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private lookupTimes: number[] = [];
  private maxLookupTimes = 100; // Keep last 100 lookup times

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxQuestionsPerCombination: 5,
      enableBitset: true,
      enablePreindexing: true,
      enableTelemetrySampling: true,
      telemetrySamplingRate: 0.1, // 10% sampling
      ...config
    };
    
    this.metrics = {
      totalQuestions: 0,
      indexedQuestions: 0,
      usedQuestions: 0,
      unusedQuestions: 0,
      averageLookupTime: 0,
      memoryUsage: 0,
      telemetryEvents: 0
    };
  }

  /**
   * Preindex questions for fast lookup
   * Contract: 3-level map byLine[lineId][type][order] -> ModuleQuestion[]
   */
  preindexQuestions<T extends { lineId: string; type: string; order: number }>(
    questions: T[]
  ): Map<string, Map<string, Map<number, T[]>>> {
    const startTime = performance.now();
    
    const index = new Map<string, Map<string, Map<number, T[]>>>();
    
    for (const question of questions) {
      if (!index.has(question.lineId)) {
        index.set(question.lineId, new Map());
      }
      const lineMap = index.get(question.lineId)!;
      
      if (!lineMap.has(question.type)) {
        lineMap.set(question.type, new Map());
      }
      const typeMap = lineMap.get(question.type)!;
      
      if (!typeMap.has(question.order)) {
        typeMap.set(question.order, []);
      }
      typeMap.get(question.order)!.push(question);
    }
    
    const endTime = performance.now();
    const lookupTime = endTime - startTime;
    
    this.recordLookupTime(lookupTime);
    this.metrics.indexedQuestions = questions.length;
    
    console.log(`⚡ Preindexed ${questions.length} questions in ${lookupTime.toFixed(2)}ms`);
    
    return index;
  }

  /**
   * Create optimized bitset for used questions
   * Contract: 32-bit bitset or Set<string> for used ids
   */
  createUsedQuestionsSet(questionIds: string[]): Set<string> {
    const startTime = performance.now();
    
    const usedSet = new Set<string>();
    
    const endTime = performance.now();
    const lookupTime = endTime - startTime;
    
    this.recordLookupTime(lookupTime);
    
    console.log(`⚡ Created used questions set in ${lookupTime.toFixed(2)}ms`);
    
    return usedSet;
  }

  /**
   * Fast lookup with preindexed data
   */
  fastLookup<T>(
    index: Map<string, Map<string, Map<number, T[]>>>,
    lineId: string,
    type: string,
    order: number,
    usedSet: Set<string>
  ): T | null {
    const startTime = performance.now();
    
    const questions = index
      .get(lineId)
      ?.get(type)
      ?.get(order) || [];
    
    const unused = questions.find(q => !usedSet.has((q as any).id));
    
    const endTime = performance.now();
    const lookupTime = endTime - startTime;
    
    this.recordLookupTime(lookupTime);
    
    return unused || null;
  }

  /**
   * Record lookup time for performance tracking
   */
  private recordLookupTime(time: number): void {
    this.lookupTimes.push(time);
    
    // Keep only last N lookup times
    if (this.lookupTimes.length > this.maxLookupTimes) {
      this.lookupTimes.shift();
    }
    
    // Update average
    this.metrics.averageLookupTime = 
      this.lookupTimes.reduce((a, b) => a + b, 0) / this.lookupTimes.length;
  }

  /**
   * Check if question bank meets soft cap requirements
   */
  validateQuestionBank<T extends { lineId: string; type: string; order: number }>(
    questions: T[]
  ): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Group questions by combination
    const combinations = new Map<string, T[]>();
    
    for (const question of questions) {
      const key = `${question.lineId}-${question.type}-${question.order}`;
      if (!combinations.has(key)) {
        combinations.set(key, []);
      }
      combinations.get(key)!.push(question);
    }
    
    // Check each combination
    for (const [key, questions] of Array.from(combinations)) {
      if (questions.length < this.config.maxQuestionsPerCombination) {
        warnings.push(
          `Low question count for ${key}: ${questions.length}/${this.config.maxQuestionsPerCombination}`
        );
      }
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Sample telemetry events based on sampling rate
   */
  shouldSampleTelemetry(): boolean {
    if (!this.config.enableTelemetrySampling) {
      return true; // Sample all if sampling is disabled
    }
    
    return Math.random() < this.config.telemetrySamplingRate;
  }

  /**
   * Update performance metrics
   */
  updateMetrics(
    totalQuestions: number,
    usedQuestions: number,
    telemetryEvents: number
  ): void {
    this.metrics.totalQuestions = totalQuestions;
    this.metrics.usedQuestions = usedQuestions;
    this.metrics.unusedQuestions = totalQuestions - usedQuestions;
    this.metrics.telemetryEvents = telemetryEvents;
    
    // Estimate memory usage (rough calculation)
    this.metrics.memoryUsage = this.estimateMemoryUsage();
  }

  /**
   * Estimate memory usage in bytes
   */
  private estimateMemoryUsage(): number {
    // Rough estimation based on question count and average size
    const avgQuestionSize = 500; // bytes per question
    const indexOverhead = 0.3; // 30% overhead for indexing
    const bitsetOverhead = 0.1; // 10% overhead for bitset
    
    return Math.floor(
      this.metrics.totalQuestions * avgQuestionSize * (1 + indexOverhead + bitsetOverhead)
    );
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
    metrics: PerformanceMetrics;
  } {
    const recommendations: string[] = [];
    let status: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    
    // Check lookup performance
    if (this.metrics.averageLookupTime > 10) {
      recommendations.push('Consider optimizing question lookup - average time > 10ms');
      status = 'fair';
    }
    
    // Check question coverage
    const coverage = this.metrics.unusedQuestions / this.metrics.totalQuestions;
    if (coverage < 0.2) {
      recommendations.push('Low question coverage - consider adding more questions');
      status = 'poor';
    }
    
    // Check memory usage
    if (this.metrics.memoryUsage > 10 * 1024 * 1024) { // 10MB
      recommendations.push('High memory usage - consider lazy loading');
      status = 'fair';
    }
    
    // Check telemetry volume
    if (this.metrics.telemetryEvents > 1000) {
      recommendations.push('High telemetry volume - consider sampling');
      status = 'good';
    }
    
    return {
      status,
      recommendations,
      metrics: this.metrics
    };
  }

  /**
   * Optimize configuration based on current metrics
   */
  optimizeConfiguration(): PerformanceConfig {
    const summary = this.getPerformanceSummary();
    
    if (summary.status === 'poor' || summary.status === 'fair') {
      // Increase sampling rate to reduce telemetry overhead
      if (this.metrics.telemetryEvents > 500) {
        this.config.telemetrySamplingRate = Math.min(0.05, this.config.telemetrySamplingRate);
      }
      
      // Enable bitset if not already enabled
      if (!this.config.enableBitset) {
        this.config.enableBitset = true;
      }
    }
    
    return { ...this.config };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalQuestions: 0,
      indexedQuestions: 0,
      usedQuestions: 0,
      unusedQuestions: 0,
      averageLookupTime: 0,
      memoryUsage: 0,
      telemetryEvents: 0
    };
    
    this.lookupTimes = [];
  }
}
