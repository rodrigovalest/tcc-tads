import { ValidationStrategy } from "./base-validation.strategy";
import { MultiStepRegisterData, RegisterFormData } from "../../models/types/register.types";
import { BasicInfoValidationStrategy } from "./basic-info-validation.strategy";
import { LanguageValidationStrategy, OptionalStepValidationStrategy } from "./step-validation.strategies";

export class ValidationFactory {
  static createBasicInfoStrategy(
    setError: (field: keyof RegisterFormData, error: { message: string }) => void,
    t: (key: string) => string,
    isValidEmail: (email: string) => boolean,
    isValidPassword: (password: string) => boolean
  ): ValidationStrategy {
    return new BasicInfoValidationStrategy(setError, t, isValidEmail, isValidPassword);
  }

  static createLanguageStrategy(): ValidationStrategy {
    return new LanguageValidationStrategy();
  }

  static createOptionalStrategy(): ValidationStrategy {
    return new OptionalStepValidationStrategy();
  }

  static getStrategy(
    step: number,
    dependencies?: {
      setError?: (field: keyof RegisterFormData, error: { message: string }) => void;
      t?: (key: string) => string;
      isValidEmail?: (email: string) => boolean;
      isValidPassword?: (password: string) => boolean;
    }
  ): ValidationStrategy {
    switch (step) {
      case 0:
        if (!dependencies?.setError || !dependencies?.t || !dependencies?.isValidEmail || !dependencies?.isValidPassword) {
          throw new Error('Basic info validation requires all dependencies');
        }
        return this.createBasicInfoStrategy(
          dependencies.setError,
          dependencies.t,
          dependencies.isValidEmail,
          dependencies.isValidPassword
        );
      case 1:
        return this.createLanguageStrategy();
      case 2:
      case 3:
      case 4:
        return this.createOptionalStrategy();
      default:
        throw new Error(`No validation strategy found for step ${step}`);
    }
  }

  static validateStep(
    step: number,
    formData: MultiStepRegisterData,
    dependencies?: {
      setError?: (field: keyof RegisterFormData, error: { message: string }) => void;
      t?: (key: string) => string;
      isValidEmail?: (email: string) => boolean;
      isValidPassword?: (password: string) => boolean;
    }
  ): boolean {
    const strategy = this.getStrategy(step, dependencies);
    return strategy.validate(formData);
  }
}
