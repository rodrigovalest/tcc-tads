import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRegister } from "./useRegister";
import { MultiStepRegisterData, RegisterRequest, RegisterFormData } from "../types/register.types";

export function useMultiStepRegister() {
  const { mutate: register, isPending } = useRegister();
  const [currentStep, setCurrentStep] = useState(1);
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
  } = useForm<RegisterFormData>({
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
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: 
        const hasBasicFields = !!(formData.username && formData.email && formData.password && 
                 formData.confirmPassword && formData.nationality);
        const isEmailValid = isValidEmail(formData.email);
        const isPasswordValid = isValidPassword(formData.password);
        const passwordsMatch = formData.password === formData.confirmPassword;
        
        return hasBasicFields && isEmailValid && isPasswordValid && passwordsMatch;
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

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      return true;
    }
    return false;
  };

  const skipStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
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
  };
} 