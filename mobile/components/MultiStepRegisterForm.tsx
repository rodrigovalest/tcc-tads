import React from "react";
import { View, ScrollView } from "react-native";
import Stepper from "./Stepper";
import { StepContent } from "./register/StepContent";
import { NavigationButtons } from "./register/NavigationButtons";
import { useMultiStepRegister } from "../hooks/useMultiStepRegister";
import useI18n from "../hooks/useI18n";

interface MultiStepRegisterFormProps {}

const MultiStepRegisterForm: React.FC<MultiStepRegisterFormProps> = () => {
  const { t } = useI18n();
  const {
    control,
    formState: { errors },
    currentStep,
    stepTitles,
    totalSteps,
    formData,
    updateFormData,
    countryItems,
    isNationalityDropdownOpen,
    setIsNationalityDropdownOpen,
    nextStep,
    prevStep,
    handleSubmitForm,
    isSubmitting,
    buttonState,
  } = useMultiStepRegister();

  return (
    <View className="flex-1">
      <Stepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        steps={stepTitles}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StepContent
          currentStep={currentStep}
          control={control}
          errors={errors}
          updateFormData={updateFormData}
          formData={formData}
          countryItems={countryItems}
          isNationalityDropdownOpen={isNationalityDropdownOpen}
          setIsNationalityDropdownOpen={setIsNationalityDropdownOpen}
          t={t}
        />
        
        <NavigationButtons
          isFirstStep={buttonState.isFirstStep}
          isLastStep={buttonState.isLastStep}
          isSubmitting={isSubmitting}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmitForm={handleSubmitForm}
          t={t}
        />
      </ScrollView>
    </View>
  );
};

export default React.memo(MultiStepRegisterForm); 