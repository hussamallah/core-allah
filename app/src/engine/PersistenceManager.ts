/**
 * Persistence Manager for Quiz Engine
 * 
 * Contract: Keep state in memory plus snapshot in localStorage
 * Persist after every pick and on severity select
 * Resume at exact next decision on reload
 */

export interface PersistedState {
  sessionId: string;
  phase: 'A' | 'B' | 'C' | 'D' | 'E' | 'Summary';
  selectedALines: string[];
  nonALines: string[];
  usedQuestions: string[];
  questionHistory: Array<{
    phase: 'A' | 'B' | 'C' | 'D' | 'E';
    lineId: string;
    questionId: string;
    choice: string;
    timestamp: number;
  }>;
  phaseBState: {
    currentLineIndex: number;
    completedLines: string[];
    linePicks: Array<{ lineId: string; pick1: string; pick2: string; purity: number | null }>;
  };
  phaseCState: {
    currentLineIndex: number;
    completedLines: string[];
    lineDecisions: Array<{
      lineId: string;
      co1: string;
      co2: string;
      cf: string;
      verdict: string | null;
      severity: { level: string; score: number } | null;
    }>;
    pendingSeverity: string | null;
  };
  lastUpdated: number;
}

export class PersistenceManager {
  private static readonly STORAGE_KEY = 'quiz_engine_state';
  private static readonly SESSION_ID_KEY = 'quiz_session_id';

  /**
   * Generate a new session ID
   */
  static generateSessionId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session ID or create new one
   */
  static getSessionId(): string {
    const existing = localStorage.getItem(this.SESSION_ID_KEY);
    if (existing) {
      return existing;
    }
    
    const newId = this.generateSessionId();
    localStorage.setItem(this.SESSION_ID_KEY, newId);
    return newId;
  }

  /**
   * Save state to localStorage
   */
  static saveState(state: PersistedState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      console.log('💾 State saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  static loadState(): PersistedState | null {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) {
        return null;
      }
      
      const state = JSON.parse(serialized) as PersistedState;
      
      // Check if state is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms
      if (Date.now() - state.lastUpdated > maxAge) {
        console.log('🗑️ State too old, clearing');
        this.clearState();
        return null;
      }
      
      console.log('📂 State loaded from localStorage');
      return state;
    } catch (error) {
      console.error('❌ Failed to load state:', error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  static clearState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_ID_KEY);
    console.log('🗑️ State cleared from localStorage');
  }

  /**
   * Check if there's a saved state for current session
   */
  static hasSavedState(): boolean {
    const state = this.loadState();
    return state !== null;
  }

  /**
   * Get state age in minutes
   */
  static getStateAge(): number {
    const state = this.loadState();
    if (!state) {
      return -1;
    }
    
    return Math.floor((Date.now() - state.lastUpdated) / (1000 * 60));
  }

  /**
   * Create initial state for new session
   */
  static createInitialState(
    selectedALines: string[],
    nonALines: string[]
  ): PersistedState {
    return {
      sessionId: this.getSessionId(),
      phase: 'A',
      selectedALines,
      nonALines,
      usedQuestions: [],
      questionHistory: [],
      phaseBState: {
        currentLineIndex: 0,
        completedLines: [],
        linePicks: []
      },
      phaseCState: {
        currentLineIndex: 0,
        completedLines: [],
        lineDecisions: [],
        pendingSeverity: null
      },
      lastUpdated: Date.now()
    };
  }

  /**
   * Update state with new data
   */
  static updateState(
    currentState: PersistedState,
    updates: Partial<PersistedState>
  ): PersistedState {
    const newState = {
      ...currentState,
      ...updates,
      lastUpdated: Date.now()
    };
    
    this.saveState(newState);
    return newState;
  }

  /**
   * Mark question as used
   */
  static markQuestionUsed(
    state: PersistedState,
    questionId: string
  ): PersistedState {
    if (!state.usedQuestions.includes(questionId)) {
      return this.updateState(state, {
        usedQuestions: [...state.usedQuestions, questionId]
      });
    }
    return state;
  }

  /**
   * Add question to history
   */
  static addQuestionToHistory(
    state: PersistedState,
    phase: 'A' | 'B' | 'C' | 'D' | 'E',
    lineId: string,
    questionId: string,
    choice: string
  ): PersistedState {
    const historyEntry = {
      phase,
      lineId,
      questionId,
      choice,
      timestamp: Date.now()
    };
    
    return this.updateState(state, {
      questionHistory: [...state.questionHistory, historyEntry]
    });
  }

  /**
   * Update phase B state
   */
  static updatePhaseBState(
    state: PersistedState,
    phaseBState: PersistedState['phaseBState']
  ): PersistedState {
    return this.updateState(state, { phaseBState });
  }

  /**
   * Update phase C state
   */
  static updatePhaseCState(
    state: PersistedState,
    phaseCState: PersistedState['phaseCState']
  ): PersistedState {
    return this.updateState(state, { phaseCState });
  }

  /**
   * Advance to next phase
   */
  static advancePhase(
    state: PersistedState,
    newPhase: PersistedState['phase']
  ): PersistedState {
    return this.updateState(state, { phase: newPhase });
  }

  /**
   * Get debug info about saved state
   */
  static getDebugInfo(): {
    hasState: boolean;
    sessionId: string | null;
    age: number;
    phase: string | null;
    usedQuestions: number;
    historyLength: number;
  } {
    const state = this.loadState();
    const sessionId = this.getSessionId();
    
    return {
      hasState: state !== null,
      sessionId: state?.sessionId || null,
      age: this.getStateAge(),
      phase: state?.phase || null,
      usedQuestions: state?.usedQuestions.length || 0,
      historyLength: state?.questionHistory.length || 0
    };
  }
}
