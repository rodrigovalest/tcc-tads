import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRegister } from "./useRegister";
import { MultiStepRegisterData, RegisterRequest, RegisterFormData } from "../types/register.types";
import useI18n from "./useI18n";

export function useMultiStepRegister() {
  const { t } = useI18n();
  const { mutate: register, isPending } = useRegister();
  const [currentStep, setCurrentStep] = useState(1);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [formData, setFormData] = useState<MultiStepRegisterData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nationality: "",
    languages: [],
    photo: undefined,
    interestTopics: [],
    personalDescription: "",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    setError,
    clearErrors,
  } = useForm<RegisterFormData>({
    mode: 'onSubmit',
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      nationality: "",
      languages: [],
      photo: undefined,
      interestTopics: [],
      personalDescription: "",
    },
  });

  const updateFormData = (field: keyof MultiStepRegisterData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field as keyof RegisterFormData, value);
    
    // Clear errors when user starts typing again
    if (attemptedNext) {
      clearErrors(field as keyof RegisterFormData);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1: 
        const hasBasicFields = !!(formData.username && formData.email && formData.password && 
                 formData.confirmPassword && formData.nationality);
        
        let isValid = true;
        
        if (!formData.username) {
          setError('username', { message: t('register.errors.usernameRequired') });
          isValid = false;
        }
        
        if (!formData.email) {
          setError('email', { message: t('register.errors.emailRequired') });
          isValid = false;
        } else if (!isValidEmail(formData.email)) {
          setError('email', { message: t('register.errors.invalidEmail') });
          isValid = false;
        }
        
        if (!formData.password) {
          setError('password', { message: t('register.errors.passwordRequired') });
          isValid = false;
        } else if (!isValidPassword(formData.password)) {
          setError('password', { message: t('register.errors.passwordTooShort') });
          isValid = false;
        }
        
        if (!formData.confirmPassword) {
          setError('confirmPassword', { message: t('register.errors.confirmPasswordRequired') });
          isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
          setError('confirmPassword', { message: t('register.errors.passwordsDoNotMatch') });
          isValid = false;
        }
        
        if (!formData.nationality) {
          setError('nationality', { message: t('register.errors.nationalityRequired') });
          isValid = false;
        }
        
        return isValid;
        
      case 2: 
        return formData.languages.length > 0;
      case 3: 
        return true;
      case 4: 
        return true;
      case 5: 
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    setAttemptedNext(true);
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        setAttemptedNext(false);
        clearErrors();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setAttemptedNext(false);
      clearErrors();
      return true;
    }
    return false;
  };

  const skipStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setAttemptedNext(false);
      clearErrors();
    }
  };

  const submitForm = () => { 
    const registerData: RegisterRequest = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      nationality: formData.nationality,
      languages: formData.languages,
      photo: formData.photo || undefined,
      interestTopics: formData.interestTopics.length > 0 ? formData.interestTopics : undefined,
      personalDescription: formData.personalDescription || undefined,
    };
    register(registerData);
  };

  const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
    submitForm();
  };

  return {
    control,
    handleSubmit,
    formState: { errors },
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    validateCurrentStep,
    nextStep,
    prevStep,
    skipStep,
    onSubmit,
    submitForm,
    isSubmitting: isPending,
    isValidEmail,
    isValidPassword,
    attemptedNext,
  };
} 