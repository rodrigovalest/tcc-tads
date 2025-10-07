import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../../../components/BottomNavigation';
import { ScreenHeader } from '../../../components/friends/ScreenHeader';
import { ConversationCard } from '../../../components/friends/ConversationCard';
import { EmptyState } from '../../../components/friends/EmptyState';
import { useConversations } from '../../../hooks/useConversations';
import { COLORS } from '../../../constants/colors';
import useI18n from '../../../hooks/useI18n';

export default function ConversationsScreen() {
  const { t } = useI18n();
  const {
    conversations,
    loading,
    refreshing,
    handleRefresh,
    startChat
  } = useConversations();

  if (loading) {
    return (
      <View className="flex-1 bg-appBgWhite">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
          <Text className="text-lg font-nunito-medium text-appBlack mt-4">
            {t('friends.loadingConversations')}
          </Text>
        </SafeAreaView>
        <BottomNavigation />
      </View>
    );
  }

  const renderContent = () => {
    if (conversations.length === 0) {
      return (
        <EmptyState
          icon="chatbubbles-outline"
          title={t('friends.noConversations')}
          description={t('friends.noConversationsDescription')}
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
        <ScreenHeader title={t('friends.conversations')} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderContent()}
          <View className="h-4" />
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation />
    </View>
  );
}
