import React from 'react';
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ChatHeader } from '../../../../components/chat/ChatHeader';
import { ChatMessages } from '../../../../components/chat/ChatMessages';
import MessageInput from '../../../../components/MessageInput';
import { useChatConversation } from '../../../../hooks/useChatConversation';
import useI18n from '../../../../hooks/useI18n';
import { COLORS } from '../../../../constants/colors';

export default function ChatScreen() {
  const { t } = useI18n();
  const { friendId } = useLocalSearchParams();
  const friendIdNumber = Number(friendId);
  
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}