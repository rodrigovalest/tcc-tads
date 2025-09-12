import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS } from "../constants/colors";
import Button from "./Button";
import useI18n from "../hooks/useI18n";

interface WordInputProps {
  onSubmitWord: (word: string) => void;
  isGameActive: boolean;
}

const WordInput: React.FC<WordInputProps> = ({
  onSubmitWord,
  isGameActive,
}) => {
  const [currentWord, setCurrentWord] = useState("");
  const inputRef = useRef<TextInput>(null);
  const { t } = useI18n();

  const handleSubmit = () => {
    if (currentWord.trim().length > 0 && isGameActive) {
      onSubmitWord(currentWord.trim().toLowerCase());
      setCurrentWord("");
      // Keep focus on input
      inputRef.current?.focus();
    }
  };

  const handleTextChange = (text: string) => {
    // Only allow letters and basic characters
    const cleanText = text.replace(
      /[^a-zA-ZáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ]/g,
      ""
    );
    setCurrentWord(cleanText);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="px-4 pt-2 pb-4"
    >
      <View className="bg-appLightGrey rounded-xl p-4 border-2 border-appDarkGrey">
        <Text className="text-lg font-nunito-bold text-appDarkGrey mb-3">
          {t("wordBuilder.enterWord")}
        </Text>

        <TextInput
          ref={inputRef}
          value={currentWord}
          onChangeText={handleTextChange}
          placeholder={t("wordBuilder.enterWord")}
          placeholderTextColor={COLORS.appMediumGrey}
          className="w-full bg-appBgWhite border border-appMediumGrey rounded-lg px-4 py-4 text-lg font-nunito-medium text-appBlack mb-3"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          editable={isGameActive}
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
          returnKeyType="send"
          style={{
            fontSize: 18,
            fontFamily: "nunito-medium",
          }}
        />

        <Button
          title={t("wordBuilder.submit")}
          onPress={handleSubmit}
          disabled={!isGameActive || currentWord.trim().length === 0}
          className="w-full"
          textSize="base"
          bgColor="bg-appDarkGrey"
          bgColorActivate="bg-appBlack"
          textColor="text-appBgWhite"
          textColorActivate="text-appBgWhite"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default WordInput;
