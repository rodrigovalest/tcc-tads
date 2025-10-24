import React from "react";
import { View, Text } from "react-native";
import useI18n from "../hooks/useI18n";
import SimpleVoiceInput from "./SimpleVoiceInput";
import WordInput from "./WordInput";

interface UnifiedWordInputProps {
  onSubmitWord: (word: string) => void;
  isGameActive: boolean;
  inputMode: "voice" | "typing";
  language?: string;
  placeholder?: string;
  title?: string;
}

const UnifiedWordInput: React.FC<UnifiedWordInputProps> = ({
  onSubmitWord,
  isGameActive,
  inputMode,
  language = "pt-BR",
  placeholder,
  title,
}) => {
  const { t } = useI18n();

  if (inputMode === "voice") {
    return (
      <View className="px-4 pt-2 pb-4">
        <View className="bg-appLightGrey rounded-xl p-4 border-2 border-appDarkGrey">
          <Text className="text-lg font-nunito-bold text-appDarkGrey mb-4">
            {title || t("wordBuilder.speakWord")}
          </Text>

          <SimpleVoiceInput
            onSubmitWord={onSubmitWord}
            isGameActive={isGameActive}
            language={language}
            placeholder={placeholder || t("wordBuilder.tapToSpeak")}
          />
        </View>
      </View>
    );
  }

  return (
    <WordInput
      onSubmitWord={onSubmitWord}
      isGameActive={isGameActive}
      placeholder={placeholder}
      title={title}
    />
  );
};

export default UnifiedWordInput;
