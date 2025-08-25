import { useCallback } from "react";
import { useStepNavigation } from "./register/useStepNavigation";
import { useFormDataManager } from "./register/useFormDataManager";
import { useRegisterConfiguration } from "./register/useRegisterConfiguration";
import { useRegisterSubmission } from "./register/useRegisterSubmission";
import { useRegisterForm } from "./register/useRegisterForm";
import { useValidationHelpers } from "./register/useValidationHelpers";
import { useStepValidation } from "./register/useStepValidation";
import { RegisterFormData } from "../models/types/register.types";

export function useMultiStepRegister() {
  const stepNavigation = useStepNavigation();
  const formDataManager = useFormDataManager();
  const configuration = useRegisterConfiguration();
  const submission = useRegisterSubmission();
  const form = useRegisterForm();
  const validationHelpers = useValidationHelpers();
  const stepValidation = useStepValidation(
    form.setError,
    configuration.t,
    validationHelpers.isValidEmail,
    validationHelpers.isValidPassword
  );
  const updateFormData = useCallback((field: keyof typeof formDataManager.formData, value: any) => {
    formDataManager.updateFormData(field, value);
    form.setValue(field as keyof RegisterFormData, value);
    
    if (stepNavigation.attemptedNext) {
      form.clearErrors(field as keyof RegisterFormData);
    }
  }, [formDataManager, form, stepNavigation.attemptedNext]);
  const nextStep = useCallback(async () => {
    stepNavigation.setAttemptedNext(true);
    const isValid = await stepValidation.validateCurrentStep(
      stepNavigation.currentStep,
      formDataManager.formData
    );
    
    if (isValid) {
      const success = stepNavigation.nextStep();
      if (success) {
        form.clearErrors();
      }
      return success;
    }
    return false;
  }, [stepNavigation, stepValidation, formDataManager.formData, form]);

  const prevStep = useCallback(() => {
    const success = stepNavigation.prevStep();
    if (success) {
      form.clearErrors();
    }
    return success;
  }, [stepNavigation, form]);

  const skipStep = useCallback(() => {
    const success = stepNavigation.skipStep();
    if (success) {
      form.clearErrors();
    }
    return success;
  }, [stepNavigation, form]);
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    return stepValidation.validateCurrentStep(
      stepNavigation.currentStep,
      formDataManager.formData
    );
  }, [stepValidation, stepNavigation.currentStep, formDataManager.formData]);
  const handleSubmitForm = useCallback(
    submission.handleSubmitForm(formDataManager.formData, validateCurrentStep),
    [submission, formDataManager.formData, validateCurrentStep]
  );
  return {
    control: form.control,
    handleSubmit: form.handleSubmit,
    formState: form.formState,
    currentStep: stepNavigation.currentStep,
    setCurrentStep: stepNavigation.setCurrentStep,
    stepTitles: configuration.stepTitles,
    totalSteps: configuration.totalSteps,
    formData: formDataManager.formData,
    updateFormData,
    countryItems: configuration.countryItems,
    isNationalityDropdownOpen: formDataManager.isNationalityDropdownOpen,
    setIsNationalityDropdownOpen: formDataManager.setIsNationalityDropdownOpen,
    validateCurrentStep,
    isValidEmail: validationHelpers.isValidEmail,
    isValidPassword: validationHelpers.isValidPassword,
    attemptedNext: stepNavigation.attemptedNext,
    nextStep,
    prevStep,
    skipStep,
    buttonState: {
      isFirstStep: stepNavigation.isFirstStep,
      isLastStep: stepNavigation.isLastStep,
      canSkip: stepNavigation.canSkip,
    },
    onSubmit: submission.onSubmit,
    submitForm: () => submission.submitForm(formDataManager.formData),
    handleSubmitForm,
    isSubmitting: submission.isSubmitting,
  };
}
