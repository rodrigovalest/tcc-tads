import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatHeader } from '../../../../components/chat/ChatHeader';
import { ChatMessages } from '../../../../components/chat/ChatMessages';
import MessageInput from '../../../../components/MessageInput';
import { useChatConversation } from '../../../../hooks/useChatConversation';
import { useGameInvites } from '../../../../hooks/useGameInvites';
import { MatchMode } from '../../../../models/types/match-mode.type';
import { MatchLanguage } from '../../../../models/types/match-language.type';
import { AVALIABLE_MATCH_MODES } from '../../../../constants/available-match-modes';
import useI18n from '../../../../hooks/useI18n';
import { COLORS } from '../../../../constants/colors';
import { useGameInviteMatchListener } from '../../../../hooks/useGameInviteMatchListener';

export default function ChatScreen() {
  const { t } = useI18n();
  const { friendId } = useLocalSearchParams();
  const friendIdNumber = Number(friendId);
  const [showModeSelector, setShowModeSelector] = useState(false);
  
  const {
    messages,
    loading,
    sending,
    friendName,
    friendPhoto,
    isOnline,
    typingUser,
    scrollViewRef,
    handleSendMessage,
    handleTypingStart,
    handleTypingStop,
  } = useChatConversation(friendIdNumber);

  const { sendInvite } = useGameInvites();
  useGameInviteMatchListener();

  const handleInviteToGame = () => {
    setShowModeSelector(true);
  };

  const handleSelectMode = async (matchMode: MatchMode, matchLanguage: MatchLanguage) => {
    setShowModeSelector(false);
    const inviteId = await sendInvite(friendIdNumber, matchMode, matchLanguage);
    
    if (inviteId) {
      router.push({
        pathname: '/(private)/game-invites/waiting',
        params: {
          inviteId: String(inviteId),
          friendName,
          matchMode,
        },
      });
    }
  };

  const duoModes = Object.values(AVALIABLE_MATCH_MODES).filter(
    (mode) => mode.matchFormat.includes('duo'),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-appBgWhite justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.appDarkGrey} />
        <Text className="text-lg font-nunito-medium text-appBlack mt-4">
          {t('friends.loadingMessages')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ChatHeader
          friendName={friendName}
          friendPhoto={friendPhoto}
          isOnline={isOnline}
          friendId={friendIdNumber}
          onInviteToGame={handleInviteToGame}
        />

        <ChatMessages
          messages={messages}
          friendId={friendIdNumber}
          typingUser={typingUser}
          scrollViewRef={scrollViewRef}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          disabled={sending}
          placeholder={t('friends.typeMessage')}
          maxLength={1000}
        />

        <Modal
          visible={showModeSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModeSelector(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-appBgWhite rounded-t-3xl p-6 max-h-[80%]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-nunito-bold text-appBlack">
                  {t('friends.selectGameMode')}
                </Text>
                <TouchableOpacity onPress={() => setShowModeSelector(false)}>
                  <Ionicons name="close" size={24} color={COLORS.appDarkGrey} />
                </TouchableOpacity>
              </View>

              <View className="max-h-96">
                {duoModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.matchMode}
                    onPress={() => handleSelectMode(mode.matchMode as MatchMode, 'pt')}
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
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}