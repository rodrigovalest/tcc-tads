import React from "react";
import ProfilePhotoUpload from "../../ProfilePhotoUpload";
import { MultiStepRegisterData } from "../../../models/types/register.types";

interface PhotoStepProps {
  formData: MultiStepRegisterData;
  updateFormData: (field: keyof MultiStepRegisterData, value: any) => void;
}

export const PhotoStep: React.FC<PhotoStepProps> = ({ formData, updateFormData }) => {
  return (
    <ProfilePhotoUpload
      photoUri={formData.photo}
      onPhotoChange={(uri) => updateFormData("photo", uri)}
    />
  );
};
