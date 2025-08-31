import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import Button from "./Button";
import useI18n from "../hooks/useI18n";
import VoiceRecognitionService from "../services/voice-recognition-service";

interface VoiceInputProps {
  onSubmitWord: (word: string) => void;
  isGameActive: boolean;
  language?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onSubmitWord,
  isGameActive,
  language = "pt-BR",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const voiceService = useRef<VoiceRecognitionService | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (isGameActive) {
      voiceService.current = new VoiceRecognitionService({
        onResult: (text: string) => {
          const cleanText = text
            .toLowerCase()
            .trim()
            .replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ\s]/g, "")
            .split(" ")[0];
          setRecognizedText(cleanText);
          setIsListening(false);
          setIsProcessing(false);
        },
        onError: (error) => {
          const errorCode =
            error.error?.code || error.error?.message || "unknown";

          if (errorCode === "7" || errorCode === "7/No match") {
            setIsListening(false);
            setIsProcessing(false);
            return;
          }

          console.error("Voice recognition error:", error);
          setIsListening(false);
          setIsProcessing(false);

          Alert.alert(
            t("common.error"),
            t("wordBuilder.voiceRecognitionError"),
            [{ text: t("common.ok") }]
          );
        },
        onStart: () => {
          setIsListening(true);
          setIsProcessing(false);
          startPulseAnimation();
        },
        onEnd: () => {
          setIsListening(false);
          stopPulseAnimation();
        },
      });
    }

    return () => {
      voiceService.current?.destroy();
    };
  }, [isGameActive]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleVoiceButtonPress = async () => {
    if (!isGameActive) return;

    if (isListening) {
      await voiceService.current?.stopListening();
      setIsListening(false);
      setIsProcessing(false);
    } else {
      setRecognizedText("");
      setIsProcessing(true);
      const started = await voiceService.current?.startListening(language);
      if (!started) {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = () => {
    if (recognizedText.trim().length > 0 && isGameActive) {
      onSubmitWord(recognizedText.trim().toLowerCase());
      setRecognizedText("");
    }
  };

  const handleReRecord = () => {
    setRecognizedText("");
    handleVoiceButtonPress();
  };

  const getMicrophoneColor = () => {
    if (!isGameActive) return COLORS.appMediumGrey;
    if (isListening) return COLORS.appMediumRed;
    if (isProcessing) return "#ff8800";
    return COLORS.appBlack;
  };

  const getMicrophoneSize = () => {
    return isListening ? 40 : 32;
  };

  return (
    <View className="px-4 pt-2 pb-4">
      <View className="bg-appLightGrey rounded-xl p-4 border-2 border-appDarkGrey">
        <Text className="text-lg font-nunito-bold text-appDarkGrey mb-3">
          {t("wordBuilder.speakWord")}
        </Text>

        <View className="items-center mb-4">
          <TouchableOpacity
            onPress={handleVoiceButtonPress}
            disabled={!isGameActive || isProcessing}
            className={`w-20 h-20 rounded-full items-center justify-center border-2 ${
              isListening
                ? "bg-red-100 border-red-400"
                : "bg-appBgWhite border-appMediumGrey"
            }`}
          >
            <Animated.View
              style={{
                transform: [{ scale: isListening ? pulseAnimation : 1 }],
              }}
            >
              <MaterialIcons
                name="mic"
                size={getMicrophoneSize()}
                color={getMicrophoneColor()}
              />
            </Animated.View>
          </TouchableOpacity>

          <Text className="text-sm font-nunito-medium text-appDarkGrey mt-2 text-center">
            {isListening
              ? t("wordBuilder.listening")
              : isProcessing
              ? t("wordBuilder.processing")
              : t("wordBuilder.tapToSpeak")}
          </Text>
        </View>

        {recognizedText ? (
          <View className="bg-appBgWhite border border-appMediumGrey rounded-lg p-4 mb-3">
            <Text className="text-lg font-nunito-medium text-appBlack text-center">
              "{recognizedText}"
            </Text>
          </View>
        ) : null}

        <View className="flex-row space-x-2">
          {recognizedText ? (
            <>
              <Button
                title={t("wordBuilder.reRecord")}
                onPress={handleReRecord}
                disabled={!isGameActive}
                className="flex-1"
                textSize="sm"
                bgColor="bg-appMediumGrey"
                bgColorActivate="bg-appDarkGrey"
                textColor="text-appBgWhite"
                textColorActivate="text-appBgWhite"
                iconLeft="microphone"
                iconLeftSize={16}
              />
              <Button
                title={t("wordBuilder.submit")}
                onPress={handleSubmit}
                disabled={!isGameActive || recognizedText.trim().length === 0}
                className="flex-1"
                textSize="sm"
                bgColor="bg-appDarkGrey"
                bgColorActivate="bg-appBlack"
                textColor="text-appBgWhite"
                textColorActivate="text-appBgWhite"
                iconLeft="paper-plane"
                iconLeftSize={16}
              />
            </>
          ) : (
            <Button
              title={
                isListening
                  ? t("wordBuilder.stopListening")
                  : t("wordBuilder.startListening")
              }
              onPress={handleVoiceButtonPress}
              disabled={!isGameActive}
              className="w-full"
              textSize="base"
              bgColor={isListening ? "bg-red-500" : "bg-appDarkGrey"}
              bgColorActivate={isListening ? "bg-red-600" : "bg-appBlack"}
              textColor="text-appBgWhite"
              textColorActivate="text-appBgWhite"
              iconLeft={isListening ? "stop" : "microphone"}
              iconLeftSize={18}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default VoiceInput;
