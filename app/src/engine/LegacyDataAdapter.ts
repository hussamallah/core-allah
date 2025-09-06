/**
 * Legacy Data Adapter
 * 
 * Contract: Convert legacy question format to clean engine format
 * One adapter at load time, then engine never touches legacy fields
 */

export interface LegacyModuleQuestion {
  id: string;
  phase: 'C';
  line: string;
  prompt: string;
  options: { A: string; B: string };
  mappings: { A: string; B: string };
}

export interface LegacyDuelQuestion {
  id: string;
  phase: 'B';
  line: string;
  prompt: string;
  options: { A: string; B: string };
  mappings: { A: string; B: string };
}

export interface LegacySeverityQuestion {
  id: string;
  phase: 'D';
  kind: 'severity_probe';
  line: string;
  prompt: string;
  options: { A: string; B: string; C: string };
  mappings: { A: string; B: string; C: string };
}

export interface CleanModuleQuestion {
  id: string;
  phase: 'C';
  lineId: string;
  type: 'CO' | 'CF';
  order: 1 | 2 | 3;
  prompt: string;
  options: { A: string; B: string };
  mappings: { A: string; B: string };
}

export interface CleanDuelQuestion {
  id: string;
  phase: 'B';
  lineId: string;
  type: 'CO' | 'CF';
  order: 1 | 2;
  prompt: string;
  options: { A: string; B: string };
  mappings: { A: string; B: string };
}

export interface CleanSeverityQuestion {
  id: string;
  phase: 'C';
  lineId: string;
  prompt: string;
  options: { A: string; B: string; C: string };
  mappings: { A: string; B: string; C: string };
}

export class LegacyDataAdapter {
  /**
   * Convert legacy module question to clean format
   */
  static adaptModuleQuestion(legacy: LegacyModuleQuestion): CleanModuleQuestion {
    // Parse ID to extract type and order
    // Format: "C-LINE-XX-TYPE" where XX is order, TYPE is CO/CF
    const idParts = legacy.id.split('-');
    if (idParts.length < 4) {
      throw new Error(`Invalid module question ID format: ${legacy.id}`);
    }
    
    const orderStr = idParts[2];
    const typeStr = idParts[3];
    
    // Map order string to number
    const orderMap: Record<string, 1 | 2 | 3> = {
      '01': 1, '02': 2, '03': 3
    };
    
    const order = orderMap[orderStr];
    if (!order) {
      throw new Error(`Invalid order in module question ID: ${legacy.id}`);
    }
    
    // Map type string to clean type
    const typeMap: Record<string, 'CO' | 'CF'> = {
      'CO': 'CO', 'CF': 'CF'
    };
    
    const type = typeMap[typeStr];
    if (!type) {
      throw new Error(`Invalid type in module question ID: ${legacy.id}`);
    }
    
    return {
      id: legacy.id,
      phase: 'C',
      lineId: legacy.line,
      type,
      order,
      prompt: legacy.prompt,
      options: legacy.options,
      mappings: legacy.mappings
    };
  }

  /**
   * Convert legacy duel question to clean format
   */
  static adaptDuelQuestion(legacy: LegacyDuelQuestion): CleanDuelQuestion {
    // Parse ID to extract type and order
    // Format: "B-LINE-XX-TYPE" where XX is order, TYPE is CO/CF
    const idParts = legacy.id.split('-');
    if (idParts.length < 4) {
      throw new Error(`Invalid duel question ID format: ${legacy.id}`);
    }
    
    const orderStr = idParts[2];
    const typeStr = idParts[3];
    
    // Map order string to number
    const orderMap: Record<string, 1 | 2> = {
      '05': 1, '06': 2, '07': 2 // 05 and 07 are both order 1 for CO, 06 is order 2 for CF
    };
    
    const order = orderMap[orderStr];
    if (!order) {
      throw new Error(`Invalid order in duel question ID: ${legacy.id}`);
    }
    
    // Map type string to clean type
    const typeMap: Record<string, 'CO' | 'CF'> = {
      'CO': 'CO', 'CF': 'CF'
    };
    
    const type = typeMap[typeStr];
    if (!type) {
      throw new Error(`Invalid type in duel question ID: ${legacy.id}`);
    }
    
    return {
      id: legacy.id,
      phase: 'B',
      lineId: legacy.line,
      type,
      order,
      prompt: legacy.prompt,
      options: legacy.options,
      mappings: legacy.mappings
    };
  }

  /**
   * Convert legacy severity question to clean format
   */
  static adaptSeverityQuestion(legacy: LegacySeverityQuestion): CleanSeverityQuestion {
    return {
      id: legacy.id,
      phase: 'C', // Convert D phase to C for engine
      lineId: legacy.line,
      prompt: legacy.prompt,
      options: legacy.options,
      mappings: legacy.mappings
    };
  }

  /**
   * Adapt array of legacy module questions
   */
  static adaptModuleQuestions(legacy: LegacyModuleQuestion[]): CleanModuleQuestion[] {
    const adapted: CleanModuleQuestion[] = [];
    const errors: string[] = [];
    
    for (const item of legacy) {
      try {
        adapted.push(this.adaptModuleQuestion(item));
      } catch (error) {
        errors.push(`Module question ${item.id}: ${error}`);
      }
    }
    
    if (errors.length > 0) {
      console.warn('⚠️ Module question adaptation errors:', errors);
    }
    
    return adapted;
  }

  /**
   * Adapt array of legacy duel questions
   */
  static adaptDuelQuestions(legacy: LegacyDuelQuestion[]): CleanDuelQuestion[] {
    const adapted: CleanDuelQuestion[] = [];
    const errors: string[] = [];
    
    for (const item of legacy) {
      try {
        adapted.push(this.adaptDuelQuestion(item));
      } catch (error) {
        errors.push(`Duel question ${item.id}: ${error}`);
      }
    }
    
    if (errors.length > 0) {
      console.warn('⚠️ Duel question adaptation errors:', errors);
    }
    
    return adapted;
  }

  /**
   * Adapt array of legacy severity questions
   */
  static adaptSeverityQuestions(legacy: LegacySeverityQuestion[]): CleanSeverityQuestion[] {
    const adapted: CleanSeverityQuestion[] = [];
    const errors: string[] = [];
    
    for (const item of legacy) {
      try {
        adapted.push(this.adaptSeverityQuestion(item));
      } catch (error) {
        errors.push(`Severity question ${item.id}: ${error}`);
      }
    }
    
    if (errors.length > 0) {
      console.warn('⚠️ Severity question adaptation errors:', errors);
    }
    
    return adapted;
  }

  /**
   * Validate adapted questions
   */
  static validateAdaptedQuestions(
    moduleQuestions: CleanModuleQuestion[],
    duelQuestions: CleanDuelQuestion[],
    severityQuestions: CleanSeverityQuestion[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for duplicate IDs
    const allIds = [
      ...moduleQuestions.map(q => q.id),
      ...duelQuestions.map(q => q.id),
      ...severityQuestions.map(q => q.id)
    ];
    
    const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate question IDs: ${duplicateIds.join(', ')}`);
    }
    
    // Check for missing required combinations
    const requiredModuleCombinations = [
      { lineId: 'Control', type: 'CO', order: 1 },
      { lineId: 'Control', type: 'CO', order: 2 },
      { lineId: 'Control', type: 'CF', order: 3 }
    ];
    
    for (const combo of requiredModuleCombinations) {
      const exists = moduleQuestions.some(q => 
        q.lineId === combo.lineId && 
        q.type === combo.type && 
        q.order === combo.order
      );
      
      if (!exists) {
        errors.push(`Missing module question: ${combo.lineId} ${combo.type}${combo.order}`);
      }
    }
    
    // Check for missing severity questions
    const requiredLines = ['Control', 'Pace', 'Boundary', 'Truth', 'Recognition', 'Bonding', 'Stress'];
    for (const lineId of requiredLines) {
      const exists = severityQuestions.some(q => q.lineId === lineId);
      if (!exists) {
        errors.push(`Missing severity question for: ${lineId}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get adaptation summary
   */
  static getAdaptationSummary(
    moduleQuestions: CleanModuleQuestion[],
    duelQuestions: CleanDuelQuestion[],
    severityQuestions: CleanSeverityQuestion[]
  ): {
    totalQuestions: number;
    moduleQuestions: number;
    duelQuestions: number;
    severityQuestions: number;
    lines: string[];
    types: string[];
  } {
    const allLines = new Set([
      ...moduleQuestions.map(q => q.lineId),
      ...duelQuestions.map(q => q.lineId),
      ...severityQuestions.map(q => q.lineId)
    ]);
    
    const allTypes = new Set([
      ...moduleQuestions.map(q => q.type),
      ...duelQuestions.map(q => q.type)
    ]);
    
    return {
      totalQuestions: moduleQuestions.length + duelQuestions.length + severityQuestions.length,
      moduleQuestions: moduleQuestions.length,
      duelQuestions: duelQuestions.length,
      severityQuestions: severityQuestions.length,
      lines: Array.from(allLines).sort(),
      types: Array.from(allTypes).sort()
    };
  }
}
