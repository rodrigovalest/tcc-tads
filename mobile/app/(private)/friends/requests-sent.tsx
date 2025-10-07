import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../../../components/BottomNavigation';
import { ScreenHeader } from '../../../components/friends/ScreenHeader';
import { SentRequestCard } from '../../../components/friends/SentRequestCard';
import { EmptyState } from '../../../components/friends/EmptyState';
import { useFriendshipRequests } from '../../../hooks/useFriendshipRequests';
import { COLORS } from '../../../constants/colors';
import useI18n from '../../../hooks/useI18n';

export default function RequestsSentScreen() {
  const { t } = useI18n();
  const {
    requests,
    loading,
    refreshing,
    responding,
    handleRefresh,
    cancelRequest
  } = useFriendshipRequests('sent');

  if (loading) {
    return (
      <View className="flex-1 bg-appBgWhite">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
          <Text className="text-lg font-nunito-medium text-appBlack mt-4">
            {t('friends.loadingRequests')}
          </Text>
        </SafeAreaView>
        <BottomNavigation />
      </View>
    );
  }

  const renderContent = () => {
    if (requests.length === 0) {
      return (
        <EmptyState
          icon="paper-plane-outline"
          title={t('friends.noSentRequests')}
          description={t('friends.noSentRequestsDescription')}
        />
      );
    }

    return requests.map((request) => (
      <SentRequestCard
        key={request.id}
        request={request}
        canceling={responding}
        onCancel={cancelRequest}
      />
    ));
  };

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <ScreenHeader title={t('friends.sentRequests')} />

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