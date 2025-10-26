import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";
import { COLORS } from "../constants/colors";
import useI18n from "../hooks/useI18n";

interface VoiceInputProps {
  onSubmitWord: (word: string) => void;
  isGameActive: boolean;
  language?: string;
  placeholder?: string;
  title?: string;
}

const VoiceWordInput: React.FC<VoiceInputProps> = ({
  onSubmitWord,
  isGameActive,
  language,
  placeholder,
  title,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const { t } = useI18n();

  function onSpeechResults({ value }: SpeechResultsEvent) {
    const recognizedText = value ?? [];
    const cleanText = recognizedText
      .join(" ")
      .replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ\s]/g, "")
      .trim()
      .split(" ")[0]; // Pega apenas a primeira palavra
    setText(cleanText || "");
  }

  async function handleListening() {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        setText("");
        await Voice.start(language || "pt-BR");
        setIsListening(true);
      }
    } catch (e) {
      console.error("Error handling listening:", e);
    }
  }

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  function handleSubmit() {
    if (text.trim().length > 0 && isGameActive) {
      onSubmitWord(text.trim().toLowerCase());
      setText("");
    }
  }

  const canSubmit = text.trim().length > 0 && isGameActive;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="px-4 pt-2 pb-4"
    >
      <View className="bg-appLightGrey rounded-xl p-4 border-2 border-appDarkGrey">
        <Text className="text-lg font-nunito-bold text-appDarkGrey mb-4">
          {title || t("wordBuilder.enterWord")}
        </Text>

        <View className="flex-row items-center space-x-3">
          <View className="flex-1">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={placeholder || t("wordBuilder.enterWord")}
              placeholderTextColor={COLORS.appMediumGrey}
              className="border-2 border-appMediumGrey rounded-lg px-4 py-3 text-lg font-nunito-medium text-appBlack bg-appBgWhite"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isListening && isGameActive}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
              style={{
                fontSize: 18,
                fontFamily: "nunito-medium",
                opacity: isGameActive ? 1 : 0.6,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleListening}
            disabled={!isGameActive}
            className="w-14 h-14 rounded-lg items-center justify-center border-2"
            style={{
              backgroundColor: isListening
                ? COLORS.appRed
                : isGameActive
                ? COLORS.appBlack
                : COLORS.appLightGrey,
              borderColor: isListening
                ? COLORS.appRed
                : isGameActive
                ? COLORS.appBlack
                : COLORS.appMediumGrey,
              opacity: isGameActive ? 1 : 0.6,
            }}
          >
            <MaterialIcons
              name={isListening ? "mic" : "mic-none"}
              size={24}
              color={isGameActive ? COLORS.appBgWhite : COLORS.appMediumGrey}
            />
          </TouchableOpacity>

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

export default VoiceWordInput;
