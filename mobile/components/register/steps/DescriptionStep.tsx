import React from "react";
import PersonalDescription from "../../PersonalDescription";
import { MultiStepRegisterData } from "../../../models/types/register.types";

interface DescriptionStepProps {
  formData: MultiStepRegisterData;
  updateFormData: (field: keyof MultiStepRegisterData, value: any) => void;
}

export const DescriptionStep: React.FC<DescriptionStepProps> = ({ formData, updateFormData }) => {
  return (
    <PersonalDescription
      description={formData.personalDescription}
      onDescriptionChange={(description) => updateFormData("personalDescription", description)}
    />
  );
};
