/**
 * Core Engine - Framework-agnostic TypeScript module
 * 
 * This module provides core functionality that can be used across
 * different frameworks and applications.
 */

// Core types and interfaces
export interface EngineConfig {
  name: string;
  version: string;
  debug?: boolean;
  features?: string[];
}

export interface EngineState {
  isInitialized: boolean;
  config: EngineConfig;
  data: Record<string, any>;
}

// Core Engine class
export class CoreEngine {
  private state: EngineState;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: EngineConfig) {
    this.state = {
      isInitialized: false,
      config,
      data: {}
    };
  }

  /**
   * Initialize the engine
   */
  async initialize(): Promise<void> {
    if (this.state.isInitialized) {
      throw new Error('Engine is already initialized');
    }

    // Simulate async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.state.isInitialized = true;
    this.emit('initialized', this.state);
  }

  /**
   * Get current engine state
   */
  getState(): EngineState {
    return { ...this.state };
  }

  /**
   * Update engine configuration
   */
  updateConfig(updates: Partial<EngineConfig>): void {
    this.state.config = { ...this.state.config, ...updates };
    this.emit('configUpdated', this.state.config);
  }

  /**
   * Set data in the engine
   */
  setData(key: string, value: any): void {
    this.state.data[key] = value;
    this.emit('dataUpdated', { key, value });
  }

  /**
   * Get data from the engine
   */
  getData(key: string): any {
    return this.state.data[key];
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Utility methods
   */
  isDebugMode(): boolean {
    return this.state.config.debug || false;
  }

  getVersion(): string {
    return this.state.config.version;
  }

  getName(): string {
    return this.state.config.name;
  }
}

// Utility functions
export function createEngine(config: EngineConfig): CoreEngine {
  return new CoreEngine(config);
}

export function validateConfig(config: any): config is EngineConfig {
  return (
    typeof config === 'object' &&
    typeof config.name === 'string' &&
    typeof config.version === 'string'
  );
}

// Export types and main class as default
export default CoreEngine;
