import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import BottomNavigation from '../../../components/BottomNavigation';
import { ScreenHeader } from '../../../components/friends/ScreenHeader';
import { SearchBar } from '../../../components/friends/SearchBar';
import { FriendCard } from '../../../components/friends/FriendCard';
import { EmptyState } from '../../../components/friends/EmptyState';
import { useFriendsList } from '../../../hooks/useFriendsList';
import { COLORS } from '../../../constants/colors';
import useI18n from '../../../hooks/useI18n';

export default function FriendsList() {
  const { t } = useI18n();
  const {
    friends,
    loading,
    refreshing,
    searchTerm,
    searching,
    removing,
    setSearchTerm,
    handleRefresh,
    handleSearch,
    removeFriend,
    startChat
  } = useFriendsList();

  if (loading) {
    return (
      <View className="flex-1 bg-appBgWhite">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
          <Text className="text-lg font-nunito-medium text-appBlack mt-4">
            {t('friends.loadingFriends')}
          </Text>
        </SafeAreaView>
        <BottomNavigation />
      </View>
    );
  }

  const renderSearchSection = () => (
    <View className="mb-6">
      <Text className="text-lg font-nunito-medium text-appBlack mb-3">
        {t('friends.searchFriends')}
      </Text>
      <SearchBar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        searching={searching}
        placeholder={t('friends.searchFriendsPlaceholder')}
      />
    </View>
  );

  const renderFriendsList = () => {
    if (friends.length === 0) {
      return (
        <EmptyState
          icon="people-outline"
          title={searchTerm ? t('friends.noFriendsFound') : t('friends.noFriends')}
          description={searchTerm ? `No friends found matching "${searchTerm}"` : t('friends.noFriendsDescription')}
        />
      );
    }

    return friends.map((friendship) => (
      <FriendCard
        key={friendship.id}
        friendship={friendship}
        removing={removing}
        onStartChat={startChat}
        onRemoveFriend={removeFriend}
      />
    ));
  };

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <ScreenHeader title={t('friends.friendsList')} />

        {renderSearchSection()}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderFriendsList()}
          <View className="h-4" />
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation />
    </View>
  );
}