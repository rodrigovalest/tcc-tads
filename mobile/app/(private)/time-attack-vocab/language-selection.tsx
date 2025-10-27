import React, { useEffect } from "react";
import { TouchableOpacity, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import useTimeAttackVocabStore from "../../../store/time-attack-vocab-store";
import useI18n from "../../../hooks/useI18n";
import { AVALIABLE_MATCH_LANGUAGES } from "../../../constants/avaliable-match-languages";
import { MatchLanguage } from "../../../models/types/match-language.type";

import Button from "../../../components/Button";
import MatchLanguageSelector from "../../../components/MatchLanguageSelector";
import InputModeSelector from "../../../components/InputModeSelector";
import VocabularyLevelSelector from "../../../components/VocabularyLevelSelector";

export default function TimeAttackVocabLanguageSelection() {
  const {
    sourceLanguage,
    targetLanguage,
    inputMode,
    level,
    setTargetLanguage,
    setInputMode,
    setLevel,
    resetTimeAttackVocab,
  } = useTimeAttackVocabStore();
  const { t } = useI18n();
  const router = useRouter();

  const onBack = async () => {
    router.back();
  };

  // Redirect if no source language is set
  useEffect(() => {
    if (!sourceLanguage) {
      router.navigate("/(private)/language-selection" as any);
    }
  }, [sourceLanguage, router]);

  const getAvailableTargetLanguages = () => {
    if (!sourceLanguage) return [];

    return Object.keys(AVALIABLE_MATCH_LANGUAGES).filter(
      (lang) => lang !== sourceLanguage
    ) as MatchLanguage[];
  };

  const onPlay = () => {
    if (!sourceLanguage || !targetLanguage || !inputMode) {
      Toast.show({
        type: "error",
        text1: t("validation.allFieldsRequired"),
        text2: t("validation.selectAllOptions"),
      });
      return;
    }

    router.navigate("/time-attack-vocab/solo/game" as any);
  };

  const handleTargetLanguageSelect = async (language: MatchLanguage) => {
    if (language === sourceLanguage) {
      Toast.show({
        type: "error",
        text1: t("validation.sameLanguageError"),
        text2: t("validation.selectDifferentTargetLanguage"),
      });
      return;
    }
    await setTargetLanguage(language);
  };

  if (!sourceLanguage) {
    return null;
  }

  const availableLanguages = getAvailableTargetLanguages();

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite pb-10">
      <ScrollView
        className="flex-1 bg-appBgWhite"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          className="w-full py-3 px-2 bg-appLightGrey"
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={35} color={"#191919"} />
        </TouchableOpacity>

        <View className="px-6 mt-20">
          <Text className="text-3xl font-nunito-bold text-appBlack mb-4">
            {t("timeAttackVocab.setup")}
          </Text>

          <View className="bg-appLightGrey rounded-lg p-4 mb-8 border border-appMediumGrey">
            <Text className="text-lg font-nunito-semibold text-appBlack mb-2">
              {t("match.sourceLanguage")}:{" "}
              {AVALIABLE_MATCH_LANGUAGES[sourceLanguage]}
            </Text>
            <Text className="text-sm font-nunito-medium text-appMediumGrey">
              {t("timeAttackVocab.wordsWillAppearIn")}{" "}
              {AVALIABLE_MATCH_LANGUAGES[sourceLanguage]}
            </Text>
          </View>

          <Text className="text-xl font-nunito-bold text-appBlack mb-3">
            {t("match.targetLanguage")} ({t("match.responseLanguage")})
          </Text>

          <View className="mb-8">
            <MatchLanguageSelector
              selected={targetLanguage}
              onSelect={handleTargetLanguageSelect}
              availableLanguages={availableLanguages}
            />
          </View>

          <Text className="text-xl font-nunito-bold text-appBlack mb-3">
            {t("timeAttackVocab.selectInputMode")}
          </Text>

          <View className="mb-8">
            <InputModeSelector selected={inputMode} onSelect={setInputMode} />
          </View>

          <Text className="text-xl font-nunito-bold text-appBlack mb-3">
            {t("timeAttackVocab.selectLevel") || "Select vocabulary level"}
          </Text>
          <View className="mb-8">
            <VocabularyLevelSelector
              selected={level}
              onSelect={setLevel as any}
            />
          </View>

          {sourceLanguage && targetLanguage && (
            <View className="bg-blue-50 rounded-lg p-4 mb-8 border border-blue-200">
              <Text className="text-lg font-nunito-semibold text-blue-800 text-center">
                {AVALIABLE_MATCH_LANGUAGES[sourceLanguage]} →{" "}
                {AVALIABLE_MATCH_LANGUAGES[targetLanguage]}
              </Text>
              <Text className="text-sm font-nunito-medium text-blue-600 text-center mt-1">
                {t("timeAttackVocab.gameFormat")}
              </Text>
            </View>
          )}

          <Button
            title={t("common.play")}
            onPress={onPlay}
            disabled={
              !sourceLanguage || !targetLanguage || !inputMode || !level
            }
            bgColor="bg-black"
            textColor="text-white"
            borderColor="border-black"
            bgColorActivate="bg-gray-800"
            className="py-4"
            iconRight="play"
            iconRightSize={20}
            iconRightColor="white"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
