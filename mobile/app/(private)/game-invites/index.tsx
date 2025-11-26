import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../../../components/BottomNavigation';
import { ScreenHeader } from '../../../components/friends/ScreenHeader';
import { GameInviteCard } from '../../../components/game-invites/GameInviteCard';
import { EmptyState } from '../../../components/friends/EmptyState';
import { useGameInvites } from '../../../hooks/useGameInvites';
import { COLORS } from '../../../constants/colors';
import useI18n from '../../../hooks/useI18n';

export default function GameInvites() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending');
  const {
    pendingInvites,
    sentInvites,
    loading,
    acceptInvite,
    rejectInvite,
    cancelInvite,
    refreshInvites,
  } = useGameInvites();

  if (loading) {
    return (
      <View className="flex-1 bg-appBgWhite">
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
          <Text className="text-lg font-nunito-medium text-appBlack mt-4">
            Carregando convites...
          </Text>
        </SafeAreaView>
        <BottomNavigation />
      </View>
    );
  }

  const invites = activeTab === 'pending' ? pendingInvites : sentInvites;

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <ScreenHeader title="Convites de Jogo" />

        {/* Tabs */}
        <View className="flex-row bg-appLightGrey rounded-xl p-1 mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-4 rounded-lg ${
              activeTab === 'pending' ? 'bg-appYellow' : ''
            }`}
          >
            <Text
              className={`text-center font-nunito-bold ${
                activeTab === 'pending'
                  ? 'text-appDarkGrey'
                  : 'text-appMediumGrey'
              }`}
            >
              Recebidos ({pendingInvites.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('sent')}
            className={`flex-1 py-3 px-4 rounded-lg ${
              activeTab === 'sent' ? 'bg-appYellow' : ''
            }`}
          >
            <Text
              className={`text-center font-nunito-bold ${
                activeTab === 'sent'
                  ? 'text-appDarkGrey'
                  : 'text-appMediumGrey'
              }`}
            >
              Enviados ({sentInvites.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {invites.length === 0 ? (
            <EmptyState
              icon="mail-outline"
              title={
                activeTab === 'pending'
                  ? 'Nenhum convite recebido'
                  : 'Nenhum convite enviado'
              }
              description={
                activeTab === 'pending'
                  ? 'Você não tem convites pendentes no momento'
                  : 'Você não enviou nenhum convite'
              }
            />
          ) : (
            invites.map((invite) => (
              <GameInviteCard
                key={invite.id}
                invite={invite}
                isReceived={activeTab === 'pending'}
                onAccept={acceptInvite}
                onReject={rejectInvite}
                onCancel={cancelInvite}
              />
            ))
          )}
          <View className="h-4" />
        </ScrollView>
      </SafeAreaView>

      <BottomNavigation />
    </View>
  );
}

