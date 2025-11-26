import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../../../components/BottomNavigation';
import { ScreenHeader } from '../../../components/friends/ScreenHeader';
import { FriendCard } from '../../../components/friends/FriendCard';
import { EmptyState } from '../../../components/friends/EmptyState';
import { useFriendsList } from '../../../hooks/useFriendsList';
import { useGameInvites } from '../../../hooks/useGameInvites';
import { MatchMode } from '../../../models/types/match-mode.type';
import { MatchLanguage } from '../../../models/types/match-language.type';
import { AVALIABLE_MATCH_MODES } from '../../../constants/available-match-modes';
import { COLORS } from '../../../constants/colors';
import useI18n from '../../../hooks/useI18n';

export default function SendGameInvite() {
  const { t } = useI18n();
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const { friends, loading, removing, startChat, removeFriend } =
    useFriendsList();
  const { sendInvite } = useGameInvites();

  const handleInviteToGame = (friendId: number) => {
    setSelectedFriendId(friendId);
    setShowModeModal(true);
  };

  const handleSelectMode = (matchMode: MatchMode, matchLanguage: MatchLanguage) => {
    if (selectedFriendId) {
      sendInvite(selectedFriendId, matchMode, matchLanguage);
      setShowModeModal(false);
      setSelectedFriendId(null);
    }
  };

  const duoModes = Object.values(AVALIABLE_MATCH_MODES).filter(
    (mode) => mode.matchFormat.includes('duo'),
  );

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

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <ScreenHeader title={t('friends.inviteFriendToPlay')} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {friends.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title={t('friends.noFriends')}
              description={t('friends.noFriendsDescription')}
            />
          ) : (
            friends.map((friendship) => (
              <FriendCard
                key={friendship.id}
                friendship={friendship}
                removing={removing}
                onStartChat={startChat}
                onRemoveFriend={removeFriend}
                onInviteToGame={handleInviteToGame}
              />
            ))
          )}
          <View className="h-4" />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showModeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-appBgWhite rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-nunito-bold text-appBlack">
                {t('friends.selectGameMode')}
              </Text>
              <TouchableOpacity onPress={() => setShowModeModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.appDarkGrey} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {duoModes.map((mode) => (
                <TouchableOpacity
                  key={mode.matchMode}
                  onPress={() =>
                    handleSelectMode(mode.matchMode as MatchMode, 'pt')
                  }
                  className="bg-appLightGrey rounded-xl p-4 mb-4 flex-row items-center"
                >
                  {mode.image && (
                    <Image
                      source={mode.image}
                      className="w-16 h-16 rounded-lg mr-4"
                      resizeMode="cover"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-lg font-nunito-bold text-appBlack">
                      {mode.title}
                    </Text>
                    <Text className="text-sm font-nunito-regular text-appMediumGrey">
                      {t('friends.language')}: Português
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.appMediumGrey}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNavigation />
    </View>
  );
}

