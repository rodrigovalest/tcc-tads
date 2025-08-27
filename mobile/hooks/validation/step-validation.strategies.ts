import { MultiStepRegisterData } from "../../models/types/register.types";
import { BaseValidationStrategy } from "./base-validation.strategy";

export class LanguageValidationStrategy extends BaseValidationStrategy {
  validate(formData: MultiStepRegisterData): boolean {
    return formData.languages.length > 0;
  }
}

export class OptionalStepValidationStrategy extends BaseValidationStrategy {
  validate(): boolean {
    return true;
  }
}
