import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import BottomNavigation from '../../../components/BottomNavigation';
import { ScreenHeader } from '../../../components/friends/ScreenHeader';
import { SearchBar } from '../../../components/friends/SearchBar';
import { UserSearchCard } from '../../../components/friends/UserSearchCard';
import { EmptyState } from '../../../components/friends/EmptyState';
import { useUserSearch } from '../../../hooks/useUserSearch';
import { COLORS } from '../../../constants/colors';
import useI18n from '../../../hooks/useI18n';

export default function SearchUsers() {
  const { t } = useI18n();
  const {
    searchTerm,
    searchResults,
    searching,
    hasSearched,
    sendingRequests,
    setSearchTerm,
    handleSearch,
    sendFriendRequest
  } = useUserSearch();

  const renderSearchButton = () => (
    <View className="mb-6">
      <Text className="text-lg font-nunito-medium text-appBlack mb-3">
        {t('friends.searchByUsername')}
      </Text>
      <SearchBar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        searching={searching}
        placeholder={t('friends.enterUsername')}
      />
    </View>
  );

  const renderSearchResults = () => {
    if (searching) {
      return (
        <View className="flex-1 justify-center items-center py-10">
          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
          <Text className="text-base font-nunito-medium text-appBlack mt-4">
            {t('friends.searching')}
          </Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title={t('friends.noResults')}
          description={`No users found with username "${searchTerm}"`}
        />
      );
    }

    if (!hasSearched) {
      return (
        <EmptyState
          icon="search-outline"
          title={t('friends.searchResults')}
          description={t('friends.searchResultsDescription')}
        />
      );
    }

    return (
      <>
        {searchResults.map((user) => (
          <UserSearchCard
            key={user.id}
            user={user}
            sendingRequests={sendingRequests}
            onSendRequest={sendFriendRequest}
          />
        ))}
      </>
    );
  };

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <ScreenHeader title={t('friends.searchUsers')} />
        
        {renderSearchButton()}

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {renderSearchResults()}
          <View className="h-4" />
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation />
    </View>
  );
}