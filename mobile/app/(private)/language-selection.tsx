import React from "react";
import { TouchableOpacity, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { AVALIABLE_MATCH_MODES } from "../../constants/available-match-modes";
import IAvaliableMatchMode from "../../models/interfaces/avaliable_match_mode";
import useMatchStore from "../../store/match-store";
import useTimeAttackVocabStore from "../../store/time-attack-vocab-store";
import useI18n from "../../hooks/useI18n";

import Button from "../../components/Button";
import MatchFormatSelector from "../../components/MatchFormatSelector";
import MatchLanguageSelector from "../../components/MatchLanguageSelector";
import InputModeSelector from "../../components/InputModeSelector";

export default function LanguageSelection() {
  const {
    matchMode,
    matchFormat,
    matchLanguage,
    inputMode,
    resetMatch,
    setMatchLanguage,
    setMatchFormat,
    setInputMode,
  } = useMatchStore();
  const { sourceLanguage, setSourceLanguage, resetTimeAttackVocab } =
    useTimeAttackVocabStore();
  const { t } = useI18n();
  const router = useRouter();

  if (!matchMode) {
    router.replace("/(private)/(tabs)/matches");
    return null;
  }

  const selectedMatchMode: IAvaliableMatchMode =
    AVALIABLE_MATCH_MODES[matchMode];

  const onBack = async () => {
    await resetMatch();
    await resetTimeAttackVocab();
    router.replace("/(private)/(tabs)/matches");
  };

  const onPlay = () => {
    if (matchMode === "time-attack-vocab") {
      if (!sourceLanguage) {
        Toast.show({
          type: "error",
          text1: t("validation.languageRequired"),
          text2: t("validation.selectSourceLanguage"),
        });
        return;
      }
      router.navigate("/time-attack-vocab/language-selection" as any);
      return;
    }

    if (!matchMode || !matchFormat || !matchLanguage) return;

    if (matchMode === "word-builder" && !inputMode) {
      Toast.show({
        type: "error",
        text1: t("validation.inputModeRequired"),
        text2: t("validation.selectInputMode"),
      });
      return;
    }

    if (matchMode === "word-builder" && matchFormat === "solo") {
      router.replace("/(private)/word-builder/solo/game");
    } else if (matchMode === "just-chilling" && matchFormat === "duo") {
      router.replace("/(private)/just-chilling/duo/waiting");
    } else if (matchMode === "guess-who" && matchFormat === "duo") {
      router.replace("/(private)/guess-who/duo/waiting");
    } else {
      console.warn(`No route found for ${matchMode}/${matchFormat}`);
      router.replace("/(private)/(tabs)/matches");
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-appBgWhite pb-10"
      testID="language-selection-screen"
    >
      <ScrollView
        className="flex-1 bg-appBgWhite"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          className="w-full py-3 px-2 bg-appLightGrey"
          onPress={onBack}
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={35} color={"#191919"} />
        </TouchableOpacity>

        <View className="px-6 mt-20">
          <Text className="text-3xl font-nunito-bold text-appBlack mb-4">
            {t("match.playToChallenge")}
          </Text>

          <Text className="text-xl font-nunito-medium text-appBlack mb-8">
            {t("match.gameMode")}: {selectedMatchMode.title}
          </Text>

          {matchMode !== "time-attack-vocab" && (
            <>
              <Text className="text-xl font-nunito-bold text-appBlack mb-2">
                {t("match.matchFormat")}
              </Text>

              <View className="mb-8">
                <MatchFormatSelector
                  avaliableMatchFormats={selectedMatchMode.matchFormat}
                  selected={matchFormat}
                  onSelect={setMatchFormat}
                />
              </View>
            </>
          )}
          {matchMode === "time-attack-vocab" ? (
            <View className="mb-8">
              <Text className="text-lg font-nunito-bold text-appBlack mb-3">
                {t("match.sourceLanguage")} ({t("match.languageToLearn")})
              </Text>
              <MatchLanguageSelector
                selected={sourceLanguage}
                onSelect={setSourceLanguage}
              />
            </View>
          ) : (
            <View className="mb-8">
              <MatchLanguageSelector
                selected={matchLanguage}
                onSelect={setMatchLanguage}
              />
            </View>
          )}

          {matchMode === "word-builder" && (
            <View className="mb-8">
              <InputModeSelector selected={inputMode} onSelect={setInputMode} />
            </View>
          )}

          <Button
            title={
              matchMode === "time-attack-vocab"
                ? t("common.next")
                : t("common.play")
            }
            onPress={onPlay}
            disabled={
              matchMode === "time-attack-vocab"
                ? sourceLanguage === null
                : matchFormat === null ||
                  matchLanguage === null ||
                  (matchMode === "word-builder" && inputMode === null)
            }
            bgColor="bg-black"
            textColor="text-white"
            borderColor="border-black"
            bgColorActivate="bg-gray-800"
            className="py-4"
            iconRight={
              matchMode === "time-attack-vocab" ? "arrow-forward" : "play"
            }
            iconRightSize={20}
            iconRightColor="white"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
