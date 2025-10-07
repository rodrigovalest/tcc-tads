import React, { useState, useRef } from "react";
import { View, TextInput, Text } from "react-native";
import { COLORS } from "../constants/colors";
import Button from "./Button";
import useI18n from "../hooks/useI18n";

interface TranslationInputProps {
  onSubmitTranslation: (translation: string) => void;
  isGameActive: boolean;
  wordToTranslate: string;
  fromLanguage: string;
  toLanguage: string;
  placeholder?: string;
}

const TranslationInput: React.FC<TranslationInputProps> = ({
  onSubmitTranslation,
  isGameActive,
  wordToTranslate,
  fromLanguage,
  toLanguage,
  placeholder,
}) => {
  const [currentTranslation, setCurrentTranslation] = useState("");
  const inputRef = useRef<TextInput>(null);
  const { t } = useI18n();

  const handleSubmit = () => {
    if (currentTranslation.trim().length > 0 && isGameActive) {
      onSubmitTranslation(currentTranslation.trim());
      setCurrentTranslation("");
      inputRef.current?.focus();
    }
  };

  const handleTextChange = (text: string) => {
    const cleanText = text.replace(
      /[^a-zA-ZáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ\s]/g,
      ""
    );
    setCurrentTranslation(cleanText);
  };

  return (
    <View className="px-4 pt-2 pb-4">
      <View className="bg-appLightGrey rounded-xl p-4 border-2 border-appDarkGrey">
        <View className="mb-3">
          <Text className="text-lg font-nunito-bold text-appDarkGrey text-center mb-2">
            {t("timeAttackVocab.translateWord")}
          </Text>
          <Text className="text-2xl font-nunito-bold text-appBlack text-center mb-1">
            "{wordToTranslate}"
          </Text>
          <Text className="text-sm font-nunito-medium text-appMediumGrey text-center">
            {t("timeAttackVocab.fromTo", {
              from: fromLanguage,
              to: toLanguage,
            })}
          </Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <View className="flex-1">
            <TextInput
              ref={inputRef}
              value={currentTranslation}
              onChangeText={handleTextChange}
              placeholder={placeholder || t("timeAttackVocab.enterTranslation")}
              placeholderTextColor={COLORS.appMediumGrey}
              className="bg-white border border-appMediumGrey rounded-lg px-3 py-3 text-lg font-nunito-medium text-appBlack"
              autoFocus
              editable={isGameActive}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Button
            title={t("timeAttackVocab.submit")}
            onPress={handleSubmit}
            disabled={!isGameActive || currentTranslation.trim().length === 0}
            className="px-4 py-3"
            bgColor="bg-appGreen"
            textColor="text-white"
            borderColor="border-appGreen"
            bgColorActivate="bg-green-600"
            borderColorActivate="border-green-600"
          />
        </View>
      </View>
    </View>
  );
};

export default TranslationInput;
