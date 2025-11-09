import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import useMatchStore from "../../store/match-store";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MATCH_RATE } from "../../constants/match-rate";
import Button from "../../components/Button";
import Toast from "react-native-toast-message";
import { useMatchRate } from "../../hooks/useMatchRate";
import Spinner from "../../components/Spinner";
import useI18n from "../../hooks/useI18n";
import { getMatchLanguageName } from "../../utils/match-language-utils";

export default function MatchRateDuo() {
  const router = useRouter();
  const { resetMatch, matchId, buddy, matchLanguage } = useMatchStore();
  const { t } = useI18n();

  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const { mutate: submitRating, isPending } = useMatchRate();

  const onRatePress = () => {
    if (selectedRate === null) {
      Toast.show({
        type: "error",
        text1: "No rating selected",
        text2: "Please select a rating before submitting.",
        position: "top",
      });
      return;
    }

    submitRating({
      matchId: matchId!,
      reviewedId: buddy!.userId,
      fluencyScore: selectedRate,
    },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: t("match.rate.success.title") || "Rating submitted",
            text2: t("match.rate.success.message") || "Your rating was saved successfully",
            position: "top",
          });
          resetMatch();
          router.replace("/(private)/(tabs)/matches");
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: t("match.rate.error.title") || "Error",
            text2: error.message || t("match.rate.error.message") || "Could not submit rating",
            position: "top",
          });
        },
      });
  };

  const onSkip = () => {
    resetMatch();
    router.replace("/(private)/(tabs)/matches");
  };

  if (!buddy || !matchId || !matchLanguage || isPending) {
    return <SafeAreaView className="bg-appBgWhite items-center justify-center w-full h-full"><Spinner /></SafeAreaView>;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-appBgWhite"
      testID="match-rate-screen"
    >
      <ScrollView className="mt-8 mb-3">
        <Text className="text-3xl px-8 font-nunito-bold text-appBlack mb-4">
          {t("match.rate.title", { name: buddy.username, language: getMatchLanguageName(matchLanguage).toLowerCase() }) || `How do you rate ${buddy.username}'s ${getMatchLanguageName(matchLanguage).toLowerCase()} skills?`}
        </Text>

        <Text className="text-appDarkGrey text-lg px-8 font-nunito-medium mb-6">
          {t("match.rate.subtitle") || "Your feedback helps your partner track their progress — be honest and constructive."}
        </Text>

        {Object.entries(MATCH_RATE).map(([key, { i18nKeyLevel, i18nKeyDescription, image }]) => {
          const rate = Number(key);
          const isSelected = selectedRate === rate;

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => setSelectedRate(rate)}
            >
              <View
                className={`flex-row py-4 mx-6 rounded-xl mt-2 mb-2 ${isSelected ? "bg-blue-200" : "bg-appLightGrey"}`}
              >
                <View className="px-4">
                  <View className="w-28 h-28">
                    <Image
                      source={image}
                      resizeMode="stretch"
                      className="w-full h-full rounded-lg"
                    />
                  </View>
                </View>

                <View className="flex-1 pr-4 justify-center">
                  <Text className="text-appBlack text-xl font-nunito-bold">
                    {`Level ${rate} - ${t(i18nKeyLevel)}`}
                  </Text>

                  <Text className="text-appBlack text-lg font-nunito-regular">
                    {t(i18nKeyDescription)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className="px-6 mb-3">
        <Button
          title={t("match.rate.submit") || "Submit Rating"}
          onPress={onRatePress}
          disabled={selectedRate === null}
          bgColor="bg-black"
          textColor="text-white"
          className="mb-2"
          bgColorActivate="bg-appDarkGrey"
        />

        <Button
          title={t("common.skip") || "Skip"}
          onPress={onSkip}
          textColor="text-appBlack"
          bgColorActivate="bg-appLightGrey"
          textColorActivate="text-appBlack"
        />
      </View>
    </SafeAreaView>
  );
}
