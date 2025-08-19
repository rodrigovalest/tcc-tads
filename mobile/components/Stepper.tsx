import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useI18n from "../hooks/useI18n";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, steps }) => {
  const { t } = useI18n();
  currentStep = currentStep -1;
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        {steps.map((step, index) => (
          <View key={index} className="flex-1 items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                index < currentStep
                  ? "bg-green-500"
                  : index === currentStep
                  ? "bg-appDarkGrey"
                  : "bg-gray-300"
              }`}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={20} color="white" />
              ) : (
                <Text
                  className={`text-sm font-bold ${
                    index === currentStep ? "text-white" : "text-gray-600"
                  }`}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              className={`text-xs text-center mt-2 ${
                index === currentStep ? "text-appDarkGrey font-semibold" : "text-gray-500"
              }`}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>
      
        
      <View className="h-2 bg-gray-200 rounded-full">
        <View
          className="h-2 bg-appDarkGrey rounded-full transition-all duration-300"
          style={{ width: `${((currentStep  ) / (totalSteps )) * 100}%` }}
        />
      </View>
      
      <Text className="text-center text-gray-600 mt-2">
        {t('register.stepper.step')} {currentStep + 1} {t('register.stepper.of')} {totalSteps}
      </Text>
    </View>
  );
};

export default Stepper; 