import { MultiStepRegisterData, RegisterFormData } from "../../models/types/register.types";
import { BaseValidationStrategy, ValidationRule } from "./base-validation.strategy";

export class BasicInfoValidationStrategy extends BaseValidationStrategy {
  constructor(
    private setError: (field: keyof RegisterFormData, error: { message: string }) => void,
    private t: (key: string) => string,
    private isValidEmail: (email: string) => boolean,
    private isValidPassword: (password: string) => boolean
  ) {
    super();
  }

  validate(formData: MultiStepRegisterData): boolean {
    const validationRules: ValidationRule[] = [
      {
        condition: !formData.name?.trim(),
        field: 'name',
        message: this.t('register.errors.nameRequired'),
      },
      {
        condition: !formData.username?.trim(),
        field: 'username',
        message: this.t('register.errors.usernameRequired'),
      },
      {
        condition: !formData.email?.trim(),
        field: 'email',
        message: this.t('register.errors.emailRequired'),
      },
      {
        condition: !!formData.email && !this.isValidEmail(formData.email),
        field: 'email',
        message: this.t('register.errors.invalidEmail'),
      },
      {
        condition: !formData.password,
        field: 'password',
        message: this.t('register.errors.passwordRequired'),
      },
      {
        condition: !!formData.password && !this.isValidPassword(formData.password),
        field: 'password',
        message: this.t('register.errors.passwordTooShort'),
      },
      {
        condition: !formData.confirmPassword,
        field: 'confirmPassword',
        message: this.t('register.errors.confirmPasswordRequired'),
      },
      {
        condition: !!formData.confirmPassword && formData.password !== formData.confirmPassword,
        field: 'confirmPassword',
        message: this.t('register.errors.passwordsDoNotMatch'),
      },
      {
        condition: !formData.nationality,
        field: 'nationality',
        message: this.t('register.errors.nationalityRequired'),
      },
    ];

    return this.validateRules(validationRules, this.setError);
  }
}
