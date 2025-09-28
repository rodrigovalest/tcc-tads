import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types/friendship.types';
import MessageBubble from '../MessageBubble';
import TypingIndicator from '../TypingIndicator';
import useI18n from '../../hooks/useI18n';

interface ChatMessagesProps {
  messages: Message[];
  friendId: number;
  typingUser: string | null;
  scrollViewRef: React.RefObject<ScrollView | null>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  friendId,
  typingUser,
  scrollViewRef
}) => {
  const { t } = useI18n();

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <View className="w-24 h-24 bg-appLightGrey rounded-full items-center justify-center mb-6">
        <Ionicons name="chatbubble-outline" size={48} color="#7C7C7F" />
      </View>
      <Text className="text-xl font-nunito-bold text-appBlack mb-2 text-center">
        {t('friends.noMessagesYet')}
      </Text>
      <Text className="text-base font-nunito-regular text-appMediumGrey text-center px-8">
        {t('friends.startConversation')}
      </Text>
    </View>
  );

  const renderMessages = () => (
    <>
      {messages.map((message, index) => {
        const isOwnMessage = message.sender.id !== friendId;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id;
        
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            showAvatar={showAvatar}
            onLongPress={() => {
            }}
          />
        );
      })}
      
      {typingUser && (
        <TypingIndicator username={typingUser} isVisible={true} />
      )}
    </>
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 px-4 py-4 bg-gray-50"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {messages.length === 0 ? renderEmptyState() : renderMessages()}
    </ScrollView>
  );
};