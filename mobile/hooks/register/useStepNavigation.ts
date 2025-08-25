import { useState, useCallback } from "react";
import { FIRST_STEP, LAST_STEP } from "./register.constants";

export function useStepNavigation() {
  const [currentStep, setCurrentStep] = useState(FIRST_STEP);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const resetValidationState = useCallback(() => {
    setAttemptedNext(false);
  }, []);
  const nextStep = useCallback(() => {
    if (currentStep < LAST_STEP) {
      setCurrentStep(prev => prev + 1);
      resetValidationState();
      return true;
    }
    return false;
  }, [currentStep, resetValidationState]);

  const prevStep = useCallback(() => {
    if (currentStep > FIRST_STEP) {
      setCurrentStep(prev => prev - 1);
      resetValidationState();
      return true;
    }
    return false;
  }, [currentStep, resetValidationState]);

  const skipStep = useCallback(() => {
    if (currentStep < LAST_STEP) {
      setCurrentStep(prev => prev + 1);
      resetValidationState();
      return true;
    }
    return false;
  }, [currentStep, resetValidationState]);

  const goToStep = useCallback((step: number) => {
    if (step >= FIRST_STEP && step <= LAST_STEP) {
      setCurrentStep(step);
      resetValidationState();
      return true;
    }
    return false;
  }, [resetValidationState]);

  return {
    currentStep,
    setCurrentStep,
    attemptedNext,
    setAttemptedNext,
    nextStep,
    prevStep,
    skipStep,
    goToStep,
    resetValidationState,
    isFirstStep: currentStep === FIRST_STEP,
    isLastStep: currentStep === LAST_STEP,
    canSkip: currentStep > FIRST_STEP && currentStep < LAST_STEP,
  };
}
