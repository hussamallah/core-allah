/**
 * Router lock: one flow, no loops
 * PATCHSET v2025-09-06 — "Do What The Site Says"
 */

export type Phase = 'A' | 'B' | 'C' | 'D' | 'E' | 'Archetype' | 'Celebration' | 'FinalProcessing' | 'Summary';

export interface RouterState {
  currentPhase: Phase;
  phaseEnteredOnce: Set<Phase>;
  isLocked: boolean;
}

export class Router {
  private state: RouterState = {
    currentPhase: 'A',
    phaseEnteredOnce: new Set(),
    isLocked: false
  };

  private listeners: Set<(phase: Phase) => void> = new Set();

  /**
   * Run the canonical flow: A → B → C → D → E
   * No loops, no optional paths, no HMR re-runs
   */
  runFlow(): void {
    if (this.state.isLocked) {
      console.warn('🚫 Router is locked - flow already running');
      return;
    }

    this.state.isLocked = true;
    this.route('A');
  }

  /**
   * Route to a specific phase with guards
   */
  route(phase: Phase): void {
    // Guard: prevent HMR or re-renders from re-running phases
    if (this.state.phaseEnteredOnce.has(phase)) {
      console.warn(`🚫 Phase ${phase} already entered - skipping`);
      return;
    }

    // Validate phase sequence
    if (!this.isValidTransition(this.state.currentPhase, phase)) {
      throw new Error(`Invalid phase transition: ${this.state.currentPhase} → ${phase}`);
    }

    console.log(`🎯 Router: ${this.state.currentPhase} → ${phase}`);
    
    this.state.currentPhase = phase;
    this.state.phaseEnteredOnce.add(phase);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(phase));
  }

  /**
   * Validate phase transitions according to canon
   */
  private isValidTransition(from: Phase, to: Phase): boolean {
    const validTransitions: Record<Phase, Phase[]> = {
      'A': ['B'],
      'B': ['C'],
      'C': ['D'],
      'D': ['E'],
      'E': ['Archetype'],
      'Archetype': ['Summary'],
      'Summary': [] // Terminal phase
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): Phase {
    return this.state.currentPhase;
  }

  /**
   * Check if phase has been entered
   */
  hasPhaseEntered(phase: Phase): boolean {
    return this.state.phaseEnteredOnce.has(phase);
  }

  /**
   * Subscribe to phase changes
   */
  onPhaseChange(listener: (phase: Phase) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reset router (for restart)
   */
  reset(): void {
    this.state = {
      currentPhase: 'A',
      phaseEnteredOnce: new Set(),
      isLocked: false
    };
    this.listeners.clear();
  }

  /**
   * Check if router is locked
   */
  isLocked(): boolean {
    return this.state.isLocked;
  }
}

// Singleton instance
export const router = new Router();
