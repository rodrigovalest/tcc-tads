import { MultiStepRegisterData, RegisterFormData } from "../../models/types/register.types";

export interface ValidationStrategy {
  validate: (formData: MultiStepRegisterData) => boolean;
}

export interface ValidationRule {
  condition: boolean;
  field: keyof RegisterFormData;
  message: string;
}

export abstract class BaseValidationStrategy implements ValidationStrategy {
  abstract validate(formData: MultiStepRegisterData): boolean;
  
  protected validateRules(rules: ValidationRule[], setError: (field: keyof RegisterFormData, error: { message: string }) => void): boolean {
    let isValid = true;
    
    rules.forEach(({ condition, field, message }) => {
      if (condition) {
        setError(field, { message });
        isValid = false;
      }
    });

    return isValid;
  }
}
