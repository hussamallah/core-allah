/**
 * SIF Validation Utilities
 * 
 * Validates that question effects properly credit external faces for O/F choices
 * according to the new C/O/F semantics.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that a question's effects properly map O/F choices to external faces
 */
export function validateSIFMapping(question: any, choice: 'A' | 'B' | 'C'): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const option = question.options.find((opt: any) => opt.key === choice);
  if (!option) {
    result.isValid = false;
    result.errors.push(`No option found for choice ${choice} in question ${question.id}`);
    return result;
  }

  const effects = option.effects || {};
  const questionFamily = question.family;

  // Validate that O effects credit external faces
  if (option.pick === 'O' && effects.faceO?.length > 0) {
    effects.faceO.forEach((face: string) => {
      const faceFamily = face.split(':')[0];
      if (faceFamily === questionFamily) {
        result.isValid = false;
        result.errors.push(
          `❌ O choice credits same family face: ${face} for ${questionFamily} question`
        );
      }
    });
  }

  // Validate that F effects credit external faces
  if (option.pick === 'F' && effects.faceF?.length > 0) {
    effects.faceF.forEach((face: string) => {
      const faceFamily = face.split(':')[0];
      if (faceFamily === questionFamily) {
        result.isValid = false;
        result.errors.push(
          `❌ F choice credits same family face: ${face} for ${questionFamily} question`
        );
      }
    });
  }

  // Validate that C effects credit same family faces
  if (option.pick === 'C' && effects.faceC?.length > 0) {
    effects.faceC.forEach((face: string) => {
      const faceFamily = face.split(':')[0];
      if (faceFamily !== questionFamily) {
        result.warnings.push(
          `⚠️ C choice credits different family face: ${face} for ${questionFamily} question`
        );
      }
    });
  }

  // Validate effect consistency
  if (option.pick === 'C' && effects.famC?.length === 0) {
    result.warnings.push(
      `⚠️ C choice has no famC effects for ${questionFamily}`
    );
  }

  if (option.pick === 'O' && effects.famO?.length === 0) {
    result.warnings.push(
      `⚠️ O choice has no famO effects for ${questionFamily}`
    );
  }

  if (option.pick === 'F' && effects.famF?.length === 0) {
    result.warnings.push(
      `⚠️ F choice has no famF effects for ${questionFamily}`
    );
  }

  return result;
}

/**
 * Validates an entire question bank for SIF mapping correctness
 */
export function validateQuestionBank(questions: any[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  questions.forEach(question => {
    // Validate each option
    question.options.forEach((option: any) => {
      const choice = option.key;
      const validation = validateSIFMapping(question, choice);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(...validation.errors);
      }
      
      result.warnings.push(...validation.warnings);
    });
  });

  return result;
}

/**
 * Validates that a specific question follows the new C/O/F semantics
 */
export function validateQuestionSemantics(question: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check that question has exactly 3 options (A, B, C)
  if (question.options.length !== 3) {
    result.isValid = false;
    result.errors.push(
      `Question ${question.id} should have exactly 3 options, got ${question.options.length}`
    );
  }

  // Check that options have correct keys
  const optionKeys = question.options.map((opt: any) => opt.key);
  const expectedKeys = ['A', 'B', 'C'];
  expectedKeys.forEach(key => {
    if (!optionKeys.includes(key)) {
      result.isValid = false;
      result.errors.push(
        `Question ${question.id} missing option key: ${key}`
      );
    }
  });

  // Check that each option has a pick value
  question.options.forEach((option: any) => {
    if (!option.pick || !['C', 'O', 'F'].includes(option.pick)) {
      result.isValid = false;
      result.errors.push(
        `Question ${question.id} option ${option.key} has invalid pick: ${option.pick}`
      );
    }
  });

  // Check that effects are properly structured
  question.options.forEach((option: any) => {
    if (!option.effects) {
      result.warnings.push(
        `Question ${question.id} option ${option.key} has no effects`
      );
      return;
    }

    const effects = option.effects;
    const validEffectKeys = ['famC', 'famO', 'famF', 'faceC', 'faceO', 'faceF'];
    
    Object.keys(effects).forEach(key => {
      if (!validEffectKeys.includes(key)) {
        result.warnings.push(
          `Question ${question.id} option ${option.key} has unknown effect key: ${key}`
        );
      }
      
      if (!Array.isArray(effects[key])) {
        result.warnings.push(
          `Question ${question.id} option ${option.key} effect ${key} should be an array`
        );
      }
    });
  });

  return result;
}

/**
 * Logs validation results in a readable format
 */
export function logValidationResults(result: ValidationResult, context: string = 'Validation'): void {
  console.log(`\n🔍 ${context} Results:`);
  
  if (result.isValid) {
    console.log('✅ All validations passed');
  } else {
    console.log('❌ Validation failed');
  }

  if (result.errors.length > 0) {
    console.log('\n🚨 Errors:');
    result.errors.forEach(error => console.log(`  ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    result.warnings.forEach(warning => console.log(`  ${warning}`));
  }

  console.log(`\n📊 Summary: ${result.errors.length} errors, ${result.warnings.length} warnings\n`);
}

/**
 * Quick validation for a single question choice
 */
export function quickValidateChoice(question: any, choice: 'A' | 'B' | 'C'): boolean {
  const result = validateSIFMapping(question, choice);
  if (!result.isValid) {
    console.error(`❌ Invalid choice ${choice} for question ${question.id}:`, result.errors);
  }
  return result.isValid;
}

