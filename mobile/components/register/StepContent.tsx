import React from "react";
import { Control, FieldErrors } from "react-hook-form";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { LanguageStep } from "./steps/LanguageStep";
import { PhotoStep } from "./steps/PhotoStep";
import { InterestStep } from "./steps/InterestStep";
import { DescriptionStep } from "./steps/DescriptionStep";
import { MultiStepRegisterData } from "../../models/types/register.types";

interface StepContentProps {
  currentStep: number;
  control: Control<any>;
  errors: FieldErrors<any>;
  updateFormData: (field: keyof MultiStepRegisterData, value: any) => void;
  formData: MultiStepRegisterData;
  countryItems: Array<{ label: string; value: string }>;
  isNationalityDropdownOpen: boolean;
  setIsNationalityDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  t: (key: string) => string;
  isGoogleAccount?: boolean;
  googleEmail?: string;
  googlePhoto?: string;
  onDownloadGooglePhoto?: (photoUrl: string) => Promise<string | null>;
}

export const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  control,
  errors,
  updateFormData,
  formData,
  countryItems,
  isNationalityDropdownOpen,
  setIsNationalityDropdownOpen,
  t,
  isGoogleAccount = false,
  googleEmail,
  googlePhoto,
  onDownloadGooglePhoto,
}) => {
  switch (currentStep) {
    case 1:
      return (
        <BasicInfoStep
          control={control}
          errors={errors}
          updateFormData={updateFormData}
          countryItems={countryItems}
          isNationalityDropdownOpen={isNationalityDropdownOpen}
          setIsNationalityDropdownOpen={setIsNationalityDropdownOpen}
          t={t}
          isGoogleAccount={isGoogleAccount}
          googleEmail={googleEmail}
        />
      );
    case 2:
      return (
        <LanguageStep formData={formData} updateFormData={updateFormData} />
      );
    case 3:
      return (
        <PhotoStep
          formData={formData}
          updateFormData={updateFormData}
          googlePhoto={isGoogleAccount ? googlePhoto : undefined}
          onDownloadGooglePhoto={onDownloadGooglePhoto}
        />
      );
    case 4:
      return (
        <InterestStep formData={formData} updateFormData={updateFormData} />
      );
    case 5:
      return (
        <DescriptionStep formData={formData} updateFormData={updateFormData} />
      );
    default:
      return null;
  }
};
