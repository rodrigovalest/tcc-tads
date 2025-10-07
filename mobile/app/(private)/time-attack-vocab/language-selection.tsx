import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import useMatchStore from "../../../store/match-store";
import { useI18n } from "../../../hooks/useI18n";
import { MatchLanguage } from "../../../models/types/match-language.type";
import { InputMode } from "../../../models/types/input-mode.type";
import { getMatchLanguageInfo } from "../../../utils/match-language-utils";
import { COLORS } from "../../../constants/colors";
import Button from "../../../components/Button";
import InputModeSelector from "../../../components/InputModeSelector";

export default function TimeAttackVocabLanguageSelection() {
  const router = useRouter();
  const { t } = useI18n();
  const { matchMode, matchFormat, resetMatch, setInputMode } = useMatchStore();

  const [targetLanguage, setTargetLanguage] = useState<MatchLanguage>("pt");
  const [inputMode, setLocalInputMode] = useState<InputMode | null>("typing");

  const availableLanguages: MatchLanguage[] = ["en", "pt", "es"];
  const sourceLanguages: MatchLanguage[] = ["en", "pt", "es"];

  const onBack = async () => {
    await resetMatch();
    router.replace("/(private)/(tabs)/matches");
  };

  const onPlay = async () => {
    if (!matchMode || !matchFormat) {
      Alert.alert(t("common.error"), t("timeAttackVocab.gameSetupError"));
      return;
    }

    if (!inputMode) {
      Alert.alert(t("common.error"), t("validation.selectInputMode"));
      return;
    }

    await setInputMode(inputMode);

    router.push({
      pathname: "/(private)/time-attack-vocab/game" as any,
      params: { targetLanguage },
    });
  };

  const renderLanguageSelector = (
    title: string,
    selectedLanguage: MatchLanguage,
    onLanguageSelect: (lang: MatchLanguage) => void
  ) => (
    <View className="mb-6">
      <Text className="text-lg font-nunito-bold text-appBlack mb-3">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {availableLanguages.map((lang) => {
          const langInfo = getMatchLanguageInfo(lang);
          const isSelected = selectedLanguage === lang;

          return (
            <TouchableOpacity
              key={lang}
              onPress={() => onLanguageSelect(lang)}
              className={`flex-row items-center px-4 py-3 rounded-xl border-2 ${
                isSelected
                  ? "bg-appBlue border-appBlue"
                  : "bg-white border-appLightGrey"
              }`}
            >
              <Text className="text-2xl mr-2">{langInfo.flag}</Text>
              <Text
                className={`font-nunito-semibold ${
                  isSelected ? "text-white" : "text-appBlack"
                }`}
              >
                {langInfo.name}
              </Text>
              {isSelected && (
                <MaterialIcons
                  name="check"
                  size={20}
                  color="white"
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-appBackground">
      <View className="flex-row items-center justify-between p-4 border-b border-appLightGrey">
        <TouchableOpacity onPress={onBack} className="p-2">
          <MaterialIcons name="arrow-back" size={24} color={COLORS.appBlack} />
        </TouchableOpacity>
        <Text className="text-lg font-nunito-bold text-appBlack">
          {t("timeAttackVocab.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <View className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-center text-2xl font-nunito-bold text-appBlack mb-2">
              {t("timeAttackVocab.title")}
            </Text>
            <Text className="text-center text-base font-nunito-medium text-appDarkGrey mb-4">
              {t("timeAttackVocab.description")}
            </Text>
          </View>

          <View className="bg-white rounded-xl p-6 mb-6">
            {renderLanguageSelector(
              t("timeAttackVocab.selectTargetLanguage"),
              targetLanguage,
              setTargetLanguage
            )}

            <View className="mb-6">
              <Text className="text-lg font-nunito-bold text-appBlack mb-3">
                {t("wordBuilder.inputMode")}
              </Text>
              <InputModeSelector
                selected={inputMode}
                onSelect={setLocalInputMode}
              />
            </View>
          </View>

          <Button
            title={t("common.play")}
            onPress={onPlay}
            disabled={!inputMode}
            className="mx-6 mb-6"
            bgColor="bg-appBlue"
            textColor="text-white"
            borderColor="border-appBlue"
            bgColorActivate="bg-blue-600"
            borderColorActivate="border-blue-600"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
