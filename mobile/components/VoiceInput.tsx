import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
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

const VoiceInput: React.FC<VoiceInputProps> = ({
  onSubmitWord,
  isGameActive,
  language,
  placeholder,
  title,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { t } = useI18n();

  async function onSpeechResults({ value }: SpeechResultsEvent) {
    const recognizedText = value ?? [];
    const fullText = recognizedText
      .join(" ")
      .replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ\s]/g, "")
      .trim();

    // Separa em palavras individuais
    const newWords = fullText.split(/\s+/).filter((word) => word.length > 0);

    if (newWords.length > 0) {
      setWords((prevWords) => [...prevWords, ...newWords]);
      setIsListening(false);
      await Voice.stop();
    }
  }

  function onSpeechError(error: any) {
    const errorCode = error.error?.code || error.error?.message || "unknown";

    // Ignora erros 5 (Client side error) e 7 (No match) pois são comuns e não críticos
    // O erro 5 geralmente ocorre quando o reconhecimento termina abruptamente mas ainda captura a palavra
    if (
      errorCode === "5" ||
      errorCode === "7" ||
      errorCode === "5/Client side error" ||
      errorCode === "7/No match"
    ) {
      console.log("Voice recognition: Non-critical error ignored:", errorCode);
      return;
    }

    console.error("Voice recognition error:", error);
    // Desliga o microfone apenas para erros críticos
    setIsListening(false);
  }

  function onSpeechEnd() {
    // Desliga o microfone quando a gravação terminar sem resultado
    setIsListening(false);
  }

  async function handleListening() {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        await Voice.start(language || "pt-BR");
        setIsListening(true);
      }
    } catch (e) {
      console.error("Error handling listening:", e);
      setIsListening(false);
    }
  }

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  function handleRemoveWord(index: number) {
    setWords((prevWords) => prevWords.filter((_, i) => i !== index));
  }

  function handleMoveWord(fromIndex: number, toIndex: number) {
    setWords((prevWords) => {
      const newWords = [...prevWords];
      const [movedWord] = newWords.splice(fromIndex, 1);
      newWords.splice(toIndex, 0, movedWord);
      return newWords;
    });
  }

  function handleSubmit() {
    if (words.length > 0 && isGameActive) {
      // Envia todas as palavras como uma única string
      const finalText = words.join(" ").toLowerCase();
      onSubmitWord(finalText);
      setWords([]);
    }
  }

  const canSubmit = words.length > 0 && isGameActive;

  return (
    <View className="bg-appBgWhite px-4 pt-2 pb-4">
      <View className="bg-appLightGrey rounded-xl p-4 border-2 border-appDarkGrey">
        <Text className="text-lg font-nunito-bold text-appDarkGrey mb-4">
          {title || t("wordBuilder.speakWord")}
        </Text>

        {/* Área de palavras reconhecidas */}
        <View className="mb-4 min-h-[100px] bg-appBgWhite border-2 border-appMediumGrey rounded-lg p-3">
          {words.length === 0 ? (
            <View className="flex-1 justify-center items-center py-6">
              <MaterialIcons
                name="mic-none"
                size={32}
                color={COLORS.appMediumGrey}
              />
              <Text className="text-center text-appMediumGrey font-nunito-medium mt-2">
                {placeholder || t("wordBuilder.tapToSpeak")}
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {words.map((word, index) => (
                <View
                  key={`${word}-${index}`}
                  className="flex-row items-center bg-appBlack rounded-full px-3 py-2"
                  style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.5,
                  }}
                >
                  {/* Botão para mover para esquerda */}
                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => handleMoveWord(index, index - 1)}
                      className="mr-1 p-1"
                      disabled={!isGameActive}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons
                        name="chevron-left"
                        size={20}
                        color={COLORS.appBgWhite}
                      />
                    </TouchableOpacity>
                  )}

                  {/* Palavra */}
                  <Text className="text-appBgWhite font-nunito-bold text-base px-1">
                    {word}
                  </Text>

                  {/* Botão para mover para direita */}
                  {index < words.length - 1 && (
                    <TouchableOpacity
                      onPress={() => handleMoveWord(index, index + 1)}
                      className="p-1"
                      disabled={!isGameActive}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color={COLORS.appBgWhite}
                      />
                    </TouchableOpacity>
                  )}

                  {/* Botão de deletar */}
                  <TouchableOpacity
                    onPress={() => handleRemoveWord(index)}
                    className="ml-1 p-1"
                    disabled={!isGameActive}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={COLORS.appBgWhite}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botões de controle */}
        <View className="flex-row items-center space-x-3 gap-2">
          {/* Botão do microfone */}
          <TouchableOpacity
            onPress={handleListening}
            disabled={!isGameActive}
            className="flex-1 rounded-lg items-center justify-center border-2 py-3"
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
            <View className="flex-row items-center">
              <MaterialIcons
                name={isListening ? "mic" : "mic-none"}
                size={24}
                color={isGameActive ? COLORS.appBgWhite : COLORS.appMediumGrey}
              />
              <Text
                className="ml-2 font-nunito-bold"
                style={{
                  color: isGameActive
                    ? COLORS.appBgWhite
                    : COLORS.appMediumGrey,
                  fontSize: 16,
                }}
              >
                {isListening
                  ? t("wordBuilder.listening")
                  : t("wordBuilder.tapToSpeak")}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botão de enviar */}
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
    </View>
  );
};

export default VoiceInput;
