import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";
import { useEffect } from "react";
import useI18n from "../../../hooks/useI18n";
import { useMatchHistory } from "../../../hooks/useMatchHistory";
import Spinner from "../../../components/Spinner";
import Toast from "react-native-toast-message";
import MatchHistoryItem from "../../../components/MatchHistoryItem";

export default function History() {
  const { t } = useI18n();
  const {
    data: matchHistoryItems,
    isLoading,
    isError,
    error,
  } = useMatchHistory();

  useEffect(() => {
    if (isError && error) {
      Toast.show({
        type: "error",
        text1: "Error loading match history",
        position: "top",
      });
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner />
      </View>
    );
  }

  return (
    <SafeAreaView className="w-full h-full bg-appBgWhite pt-5">
      <ScrollView
        className="w-full h-full bg-appBgWhite"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-4xl font-nunito-bold my-8 px-10 text-appBlack">
          {t("navigation.history")}
        </Text>

        {matchHistoryItems && matchHistoryItems.length === 0 && (
          <Text className="text-lg font-nunito-medium py-6 px-10 text-appBlack">
            No match history found. Start a new match to see it here!
          </Text>
        )}

        {matchHistoryItems &&
          matchHistoryItems.map((item) => (
            <MatchHistoryItem
              key={item.id}
              startTime={item.startTime}
              endTime={item.endTime}
              mode={item.mode}
              language={item.language}
              averageFluencyScore={item.averageFluencyScore}
              users={item.users}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
