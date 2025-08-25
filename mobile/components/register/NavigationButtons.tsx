import React from "react";
import { View } from "react-native";
import Button from "../Button";

interface NavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmitForm: () => void;
  t: (key: string) => string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  isSubmitting,
  onPrevStep,
  onNextStep,
  onSubmitForm,
  t,
}) => {
  return (
    <View className="flex-row gap-3 mt-6 mb-4">
      {!isFirstStep && (
        <View className="flex-1">
          <Button
            title={t('register.buttons.back')}
            onPress={onPrevStep}
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

      <View className="flex-1">
        <Button
          title={isLastStep ? t('register.buttons.finish') : t('register.buttons.next')}
          onPress={isLastStep ? onSubmitForm : onNextStep}
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
