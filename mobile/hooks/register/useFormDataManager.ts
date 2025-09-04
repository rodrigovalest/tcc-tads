import { useState, useCallback } from "react";
import { MultiStepRegisterData, RegisterFormData } from "../../models/types/register.types";
import { DEFAULT_FORM_VALUES } from "./register.constants";

export function useFormDataManager() {
  const [formData, setFormData] = useState<MultiStepRegisterData>(DEFAULT_FORM_VALUES);
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false);

  const updateFormData = useCallback((field: keyof MultiStepRegisterData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(DEFAULT_FORM_VALUES);
  }, []);

  const getFieldValue = useCallback((field: keyof MultiStepRegisterData) => {
    return formData[field];
  }, [formData]);

  return {
    formData,
    setFormData,
    updateFormData,
    resetFormData,
    getFieldValue,
    isNationalityDropdownOpen,
    setIsNationalityDropdownOpen,
  };
}
