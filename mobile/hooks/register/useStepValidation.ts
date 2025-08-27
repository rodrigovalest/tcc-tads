import { useCallback, useMemo } from "react";
import { MultiStepRegisterData, RegisterFormData } from "../../models/types/register.types";
import { ValidationFactory } from "../validation/validation.factory";

export function useStepValidation(
  setError: (field: keyof RegisterFormData, error: { message: string }) => void,
  t: (key: string) => string,
  isValidEmail: (email: string) => boolean,
  isValidPassword: (password: string) => boolean
) {
  const validationStrategies = useMemo(() => ({
    1: ValidationFactory.getStrategy(0, { setError, t, isValidEmail, isValidPassword }),
    2: ValidationFactory.getStrategy(1),
    3: ValidationFactory.getStrategy(2),
    4: ValidationFactory.getStrategy(3),
    5: ValidationFactory.getStrategy(4),
  }), [t, isValidEmail, isValidPassword, setError]);
  const validateCurrentStep = useCallback((currentStep: number, formData: MultiStepRegisterData): Promise<boolean> => {
    return new Promise((resolve) => {
      const strategy = validationStrategies[currentStep as keyof typeof validationStrategies];
      const isValid = strategy ? strategy.validate(formData) : false;
      resolve(isValid);
    });
  }, [validationStrategies]);

  return {
    validateCurrentStep,
  };
}
