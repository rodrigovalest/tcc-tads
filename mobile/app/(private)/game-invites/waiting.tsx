import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useGameInvites } from '../../../hooks/useGameInvites';
import { COLORS } from '../../../constants/colors';
import useI18n from '../../../hooks/useI18n';
import { AVALIABLE_MATCH_MODES } from '../../../constants/available-match-modes';
import { useGameInviteMatchListener } from '../../../hooks/useGameInviteMatchListener';
import useMatchStore from '../../../store/match-store';

export default function WaitingForInviteResponse() {
  const { t } = useI18n();
  const { inviteId, friendName, matchMode } = useLocalSearchParams();
  const { sentInvites, cancelInvite, refreshInvites } = useGameInvites();
  const { matchMode: storeMatchMode, matchLanguage } = useMatchStore();
  const [invite, setInvite] = useState<any>(null);
  const [isGone, setIsGone] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useGameInviteMatchListener();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialLoading) return;
    if (inviteId) {
      const foundInvite = sentInvites.find((inv) => inv.id === Number(inviteId));
      if (foundInvite) {
        setInvite(foundInvite);
        setIsGone(false);
      } else {
        if (!storeMatchMode || !matchLanguage) {
          if (!isGone) {
            setIsGone(true);
            setTimeout(() => {
              router.back();
            }, 500);
          }
        }
      }
    } else {
      if (sentInvites.length > 0) {
        setInvite(sentInvites[0]);
        setIsGone(false);
      } else if (!isGone && (!storeMatchMode || !matchLanguage)) {
        setIsGone(true);
        setTimeout(() => {
          router.back();
        }, 500);
      }
    }
  }, [sentInvites, inviteId, refreshInvites, isGone, isInitialLoading, storeMatchMode, matchLanguage]);

  const handleCancel = async () => {
    if (invite) {
      await cancelInvite(invite.id);
      setTimeout(() => {
        router.back();
      }, 300);
    } else {
      router.back();
    }
  };

  const matchModeInfo = matchMode ? AVALIABLE_MATCH_MODES[matchMode as keyof typeof AVALIABLE_MATCH_MODES] : null;

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-appBgWhite">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
          <Text className="text-base font-nunito-medium text-appMediumGrey mt-4">
            {t('friends.sendingInvite')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-appLightGrey rounded-3xl p-8 items-center w-full max-w-sm">
          <View className="w-24 h-24 bg-appYellow rounded-full items-center justify-center mb-6">
            <Ionicons name="game-controller" size={48} color={COLORS.appDarkGrey} />
          </View>

          <Text className="text-2xl font-nunito-bold text-appBlack mb-2 text-center">
            {t('friends.calling')}
          </Text>

          <Text className="text-lg font-nunito-medium text-appMediumGrey mb-6 text-center">
            {friendName || t('common.you')}
          </Text>

          {matchModeInfo && (
            <View className="bg-appBgBeige rounded-xl p-4 mb-6 w-full items-center">
              <Text className="text-base font-nunito-bold text-appBlack mb-1">
                {matchModeInfo.title}
              </Text>
              <Text className="text-sm font-nunito-regular text-appMediumGrey">
                {t('friends.waitingForResponse')}
              </Text>
            </View>
          )}

          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />

          <Text className="text-sm font-nunito-regular text-appMediumGrey mt-6 text-center">
            {t('friends.waitingForFriendToAccept')}
          </Text>

          <TouchableOpacity
            onPress={handleCancel}
            className="mt-8 bg-appMediumRed py-3 px-6 rounded-xl"
          >
            <Text className="text-white font-nunito-bold text-base">
              {t('friends.cancelInvite')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

