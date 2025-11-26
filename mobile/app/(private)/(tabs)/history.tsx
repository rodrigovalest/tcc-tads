import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList } from "react-native";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import Spinner from "../../../components/Spinner";
import MatchHistoryItem from "../../../components/MatchHistoryItem";
import useI18n from "../../../hooks/useI18n";
import { useMatchHistory } from "../../../hooks/useMatchHistory";

export default function History() {
  const { t } = useI18n();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMatchHistory();

  useEffect(() => {
    if (isError && error) {
      Toast.show({
        type: "error",
        text1:
          t("history.errorLoadingHistory") || "Error loading match history",
        position: "top",
      });
    }
  }, [isError, error]);

  const matchHistoryList =
    data?.pages.flatMap((page) => {
      if (Array.isArray(page)) return page;
      return page?.data ?? [];
    }) || [];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite pt-5">
      <FlatList
        data={matchHistoryList}
        keyExtractor={(item, index) =>
          item.id ? String(item.id) : `item-${index}`
        }
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <Text className="text-4xl font-nunito-bold my-8 px-10 text-appBlack">
            {t("navigation.history")}
          </Text>
        )}
        ListEmptyComponent={() => (
          <Text className="text-lg font-nunito-medium py-6 px-10 text-appBlack">
            {t("history.noMatchesYet")}
          </Text>
        )}
        renderItem={({ item }) => {
          if (!item) return null;
          return (
            <MatchHistoryItem
              startTime={item.startTime}
              endTime={item.endTime}
              mode={item.mode}
              language={item.language}
              averageFluencyScore={item.averageFluencyScore}
              users={item.users}
            />
          );
        }}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="py-4">
              <Spinner />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
