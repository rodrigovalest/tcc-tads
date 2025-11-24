import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useI18n from "../../../hooks/useI18n";
import { useConversations } from "../../../hooks/useConversations";
import { ConversationCard } from "../../../components/friends/ConversationCard";
import { EmptyState } from "../../../components/friends/EmptyState";
import { COLORS } from "../../../constants/colors";

export default function Chat() {
  const { t } = useI18n();
  const { conversations, loading, refreshing, handleRefresh, startChat } =
    useConversations();

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
          <Text className="text-lg font-nunito-medium text-appBlack mt-4">
            {t("friends.loadingConversations")}
          </Text>
        </View>
      );
    }

    if (conversations.length === 0) {
      return (
        <EmptyState
          icon="chatbubbles-outline"
          title={t("friends.noConversations")}
          description={t("friends.noConversationsDescription")}
        />
      );
    }

    return conversations.map((conversation) => (
      <ConversationCard
        key={conversation.friend.id}
        conversation={conversation}
        onPress={startChat}
      />
    ));
  };

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-nunito-bold text-appBlack">
            {t("friends.conversations")}
          </Text>
          <Pressable
            onPress={() => router.push("/(private)/friends")}
            className="flex-row items-center bg-appLightGrey px-3 py-2 rounded-full"
          >
            <Ionicons name="people" size={18} color="#262B2A" />
            <Text className="ml-2 text-sm font-nunito-semibold text-appBlack">
              {t("friends.friends")}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderContent()}
          <View className="h-6" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
