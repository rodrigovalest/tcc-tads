import React from "react";
import { View, ScrollView } from "react-native";
import Stepper from "./Stepper";
import { StepContent } from "./register/StepContent";
import { NavigationButtons } from "./register/NavigationButtons";
import { useMultiStepRegister } from "../hooks/useMultiStepRegister";
import { useGoogleRegister } from "../hooks/useGoogleRegister";
import useI18n from "../hooks/useI18n";

const MultiStepRegisterForm: React.FC = () => {
  const { t } = useI18n();
  const { googleUserData, isGoogleAccount, downloadGooglePhoto } =
    useGoogleRegister();

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

  const lastProcessedState = React.useRef({
    isGoogleAccount: false,
    hasGoogleUserData: false,
    googleEmail: "",
  });

  React.useEffect(() => {
    const currentState = {
      isGoogleAccount,
      hasGoogleUserData: !!googleUserData,
      googleEmail: googleUserData?.email || "",
    };

    const hasStateChanged =
      lastProcessedState.current.isGoogleAccount !==
        currentState.isGoogleAccount ||
      lastProcessedState.current.hasGoogleUserData !==
        currentState.hasGoogleUserData ||
      lastProcessedState.current.googleEmail !== currentState.googleEmail;

    if (!hasStateChanged) {
      return;
    }

    if (isGoogleAccount && googleUserData) {
      updateFormData("email", googleUserData.email);
      updateFormData("isGoogleAccount", true);
    } else if (!isGoogleAccount && !googleUserData) {
      updateFormData("isGoogleAccount", false);
      updateFormData("email", "");
      updateFormData("photo", null);
      updateFormData("googlePhoto", undefined);
    }

    lastProcessedState.current = currentState;
  }, [isGoogleAccount, googleUserData]);

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
        nestedScrollEnabled={true}
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
          isGoogleAccount={isGoogleAccount}
          googleEmail={googleUserData?.email}
          googlePhoto={isGoogleAccount ? googleUserData?.photo : undefined}
          onDownloadGooglePhoto={downloadGooglePhoto}
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
