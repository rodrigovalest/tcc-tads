import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { AVALIABLE_MATCH_MODES } from "../../constants/available-match-modes";
import IAvaliableMatchMode from "../../models/interfaces/avaliable_match_mode";
import useMatchStore from "../../store/match-store";
import { useRouter } from "expo-router";
import { TouchableOpacity, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import MatchFormatSelector from "../../components/MatchFormatSelector";
import MatchLanguageSelector from "../../components/MatchLanguageSelector";
import InputModeSelector from "../../components/InputModeSelector";
import useI18n from "../../hooks/useI18n";
import Toast from "react-native-toast-message";

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
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!matchMode) {
      router.replace("/(private)/(tabs)/matches");
      return;
    }
  }, [matchMode, router]);

  if (!matchMode) {
    return null;
  }

  const selectedMatchMode: IAvaliableMatchMode =
    AVALIABLE_MATCH_MODES[matchMode];

  const onBack = async () => {
    await resetMatch();
    router.replace("/(private)/(tabs)/matches");
  };

  const onPlay = () => {
    if (!matchMode || !matchFormat || !matchLanguage) return;

    if (matchMode === "word-builder") {
      if (!inputMode) return;
      router.replace("/(private)/word-builder/solo/game");
    } else {
      router.replace("/(private)/just-chilling/duo/waiting");
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-appBgWhite"
      testID="language-selection-screen"
    >
      <TouchableOpacity
        className="w-full py-3 px-2 bg-appLightGrey"
        onPress={onBack}
        testID="back-button"
      >
        <Ionicons name="chevron-back" size={35} />
      </TouchableOpacity>

      <View className="px-6 mt-20">
        <Text className="text-3xl font-nunito-bold text-appBlack mb-4">
          {t("match.playToChallenge")}
        </Text>

        <Text className="text-xl font-nunito-medium text-appBlack mb-8">
          {t("match.gameMode")}: {selectedMatchMode.title}
        </Text>

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

        <View className="mb-8">
          <MatchLanguageSelector
            selected={matchLanguage}
            onSelect={setMatchLanguage}
          />
        </View>

        {/* Mostrar seletor de modo de input apenas para Word Builder */}
        {matchMode === "word-builder" && (
          <InputModeSelector selected={inputMode} onSelect={setInputMode} />
        )}

        <Button
          title={t("common.play")}
          onPress={onPlay}
          disabled={
            matchFormat === null ||
            matchLanguage === null ||
            (matchMode === "word-builder" && inputMode === null)
          }
          bgColor="bg-black"
          textColor="text-white"
          borderColor="border-black"
          bgColorActivate="bg-gray-800"
          className="py-4"
          iconRight={"play"}
          iconRightSize={20}
          iconRightColor="white"
        />
      </View>
    </SafeAreaView>
  );
}
