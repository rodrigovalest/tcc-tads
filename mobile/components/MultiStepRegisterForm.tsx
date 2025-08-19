import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { Controller } from "react-hook-form";
import { COUNTRIES } from "../constants/countries";
import Input from "./Input";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Stepper from "./Stepper";
import LanguageFluencySelector from "./LanguageFluencySelector";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import InterestTopicsSelector from "./InterestTopicsSelector";
import PersonalDescription from "./PersonalDescription";
import { useMultiStepRegister } from "../hooks/useMultiStepRegister";
import { LanguageFluency } from "../types/register.types";
import useI18n from "../hooks/useI18n";

const STEPS = [
  "register.steps.basicInfo",
  "register.steps.languages", 
  "register.steps.photo",
  "register.steps.interests",
  "register.steps.description",
];

const MultiStepRegisterForm: React.FC = () => {
  const { t } = useI18n();
  const {
    control,
    formState: { errors },
    currentStep,
    formData,
    updateFormData,
    validateCurrentStep,
    nextStep,
    prevStep,
    skipStep,
    submitForm,
    isSubmitting,
  } = useMultiStepRegister();

  const [open, setOpen] = useState(false);
  const items = Object.entries(COUNTRIES).map(([code, name]) => ({
    label: name,
    value: code,
  }));

  const handleSubmitForm = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      submitForm();
    } else {
      Alert.alert(t('common.error'), t('register.validation.fillRequired'));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View className="space-y-4">
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={`${t('auth.username')} *`}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    updateFormData("username", text);
                  }}
                  onBlur={onBlur}
                  placeholder={t('auth.enterUsername')}
                  error={errors.username?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={`${t('auth.email')} *`}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    updateFormData("email", text);
                  }}
                  onBlur={onBlur}
                  placeholder={t('auth.enterEmail')}
                  type="email"
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={`${t('auth.password')} *`}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    updateFormData("password", text);
                  }}
                  onBlur={onBlur}
                  placeholder={t('auth.enterPassword')}
                  type="password"
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={`${t('auth.confirmPassword')} *`}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    updateFormData("confirmPassword", text);
                  }}
                  onBlur={onBlur}
                  placeholder={t('auth.confirmYourPassword')}
                  type="password"
                  error={errors.confirmPassword?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="nationality"
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  label={`${t('auth.nationality')} *`}
                  value={value}
                  onChange={(text) => {
                    onChange(text);
                    updateFormData("nationality", text);
                  }}
                  items={items}
                  error={errors.nationality?.message}
                  open={open}
                  setOpen={setOpen}
                />
              )}
            />
          </View>
        );

      case 2:
        return (
          <LanguageFluencySelector
            selectedLanguages={formData.languages}
            onLanguagesChange={(languages: LanguageFluency[]) => updateFormData("languages", languages)}
          />
        );

      case 3:
        return (
          <ProfilePhotoUpload
            photoUri={formData.photo}
            onPhotoChange={(uri) => updateFormData("photo", uri)}
          />
        );

      case 4:
        return (
          <InterestTopicsSelector
            selectedTopics={formData.interestTopics}
            onTopicsChange={(topics) => updateFormData("interestTopics", topics)}
          />
        );

      case 5:
        return (
          <PersonalDescription
            description={formData.personalDescription}
            onDescriptionChange={(description) => updateFormData("personalDescription", description)}
          />
        );

      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === STEPS.length;
    const canSkip = currentStep === 0;

    return (
      <View className="flex-row gap-3 mt-6 mb-4">
        {!isFirstStep && (
          <View className="flex-1">
            <Button
              title={t('register.buttons.back')}
              onPress={prevStep}
              className="w-full"
              textSize="base"
              textColor="text-gray-700"
              textColorActivate="text-gray-800"
              bgColor="bg-gray-200"
              bgColorActivate="bg-gray-300"
              borderColor="border-gray-300"
            />
          </View>
        )}

        {canSkip && (
          <View className="flex-1">
            <Button
              title={t('register.buttons.skip')}
              onPress={skipStep}
              className="w-full"
              textSize="base"
              textColor="text-gray-600"
              textColorActivate="text-gray-700"
              bgColor="bg-transparent"
              bgColorActivate="bg-gray-100"
              borderColor="border-gray-300"
            />
          </View>
        )}

        <View className="flex-1">
          <Button
            title={isLastStep ? t('register.buttons.finish') : t('register.buttons.next')}
            onPress={isLastStep ? handleSubmitForm : nextStep}
            disabled={isSubmitting}
            loading={isSubmitting}
            className="w-full"
            textSize="base"
            textColor="text-black"
            textColorActivate="text-black"
            bgColor="bg-white"
            bgColorActivate="bg-gray-100"
            borderColor="border-gray-300"
          />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <Stepper
        currentStep={currentStep}
        totalSteps={STEPS.length}
        steps={STEPS.map(step => t(step))}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderStepContent()}
        {renderStepButtons()}
      </ScrollView>
    </View>
  );
};

export default MultiStepRegisterForm; 