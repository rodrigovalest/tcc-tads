import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import useI18n from "../hooks/useI18n";

interface WordInputProps {
  onSubmitWord: (word: string) => void;
  isGameActive: boolean;
  placeholder?: string;
  title?: string;
}

const WordInput: React.FC<WordInputProps> = ({
  onSubmitWord,
  isGameActive,
  placeholder,
  title,
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
    const cleanText = text
      .replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ\s]/g, "")
      .split(" ")[0]; // Pega apenas a primeira palavra
    setCurrentWord(cleanText);
  };

  const canSubmit = currentWord.trim().length > 0 && isGameActive;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="px-4 pt-2 pb-4"
    >
      <View className="bg-appLightGrey rounded-xl p-4 border-2 border-appDarkGrey">
        <Text className="text-lg font-nunito-bold text-appDarkGrey mb-4">
          {title || t("wordBuilder.enterWord")}
        </Text>

        <View className="flex-row items-center space-x-3 gap-2">
          {/* Input de texto */}
          <View className="flex-1">
            <TextInput
              ref={inputRef}
              value={currentWord}
              onChangeText={handleTextChange}
              placeholder={placeholder || t("wordBuilder.enterWord")}
              placeholderTextColor={COLORS.appMediumGrey}
              className="border-2 border-appMediumGrey rounded-lg px-4 py-3 text-lg font-nunito-medium text-appBlack bg-appBgWhite"
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
                opacity: isGameActive ? 1 : 0.6,
              }}
            />
          </View>

          {/* Botão de confirmar */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            className="w-14 h-14 rounded-lg items-center justify-center border-2"
            style={{
              backgroundColor: canSubmit
                ? COLORS.appBlack
                : COLORS.appLightGrey,
              borderColor: canSubmit ? COLORS.appBlack : COLORS.appMediumGrey,
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={canSubmit ? COLORS.appBgWhite : COLORS.appMediumGrey}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default WordInput;
