import React from "react";
import InterestTopicsSelector from "../../InterestTopicsSelector";
import { MultiStepRegisterData } from "../../../models/types/register.types";

interface InterestStepProps {
  formData: MultiStepRegisterData;
  updateFormData: (field: keyof MultiStepRegisterData, value: any) => void;
}

export const InterestStep: React.FC<InterestStepProps> = ({ formData, updateFormData }) => {
  return (
    <InterestTopicsSelector
      selectedTopics={formData.interestTopics}
      onTopicsChange={(topics) => updateFormData("interestTopics", topics)}
    />
  );
};
