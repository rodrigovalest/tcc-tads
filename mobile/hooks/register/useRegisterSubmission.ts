import { useCallback } from "react";
import { Alert } from "react-native";
import { SubmitHandler } from "react-hook-form";
import { useRegister } from "../useRegister";
import { MultiStepRegisterData, RegisterRequest, RegisterFormData } from "../../models/types/register.types";
import useI18n from "../useI18n";

export function useRegisterSubmission() {
  const { t } = useI18n();
  const { mutate: register, isPending } = useRegister();
  const createRegisterData = useCallback((formData: MultiStepRegisterData): RegisterRequest => ({
    username: formData.username,
    email: formData.email,
    password: formData.password,
    nationality: formData.nationality,
    languages: formData.languages,
    photo: formData.photo || undefined,
    interestTopics: formData.interestTopics.length > 0 ? formData.interestTopics : undefined,
    personalDescription: formData.personalDescription || undefined,
  }), []);

  const submitForm = useCallback((formData: MultiStepRegisterData) => {
    const registerData = createRegisterData(formData);
    
    console.log('🚀 Submitting registration form with data:', {
      ...registerData,
      photo: registerData.photo ? 'Photo URI present' : 'No photo',
      password: '***hidden***'
    });
    
    register(registerData);
  }, [createRegisterData, register]);
  const handleSubmitForm = useCallback((
    formData: MultiStepRegisterData,
    validateCurrentStep: () => Promise<boolean>
  ) => {
    return async () => {
      const isValid = await validateCurrentStep();
      if (isValid) {
        submitForm(formData);
      } else {
        Alert.alert(t('common.error'), t('register.validation.fillRequired'));
      }
    };
  }, [submitForm, t]);

  const onSubmit: SubmitHandler<RegisterFormData> = useCallback((data) => {
    submitForm(data as MultiStepRegisterData);
  }, [submitForm]);

  return {
    submitForm,
    handleSubmitForm,
    onSubmit,
    isSubmitting: isPending,
  };
}
