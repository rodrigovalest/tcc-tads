import React from "react";
import LanguageFluencySelector from "../../LanguageFluencySelector";
import { LanguageFluency, MultiStepRegisterData } from "../../../models/types/register.types";

interface LanguageStepProps {
  formData: MultiStepRegisterData;
  updateFormData: (field: keyof MultiStepRegisterData, value: any) => void;
}

export const LanguageStep: React.FC<LanguageStepProps> = ({ formData, updateFormData }) => {
  return (
    <LanguageFluencySelector
      selectedLanguages={formData.languages}
      onLanguagesChange={(languages: LanguageFluency[]) => updateFormData("languages", languages)}
    />
  );
};
