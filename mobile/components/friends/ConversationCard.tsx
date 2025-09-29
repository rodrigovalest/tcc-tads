import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '../../types/friendship.types';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';

interface ConversationCardProps {
  conversation: Conversation;
  onPress: (friendId: number) => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onPress
}) => {
  const { t } = useI18n();
  const hasUnread = conversation.unreadCount > 0;

  const formatLastSeen = (lastMessageDate?: string) => {
    if (!lastMessageDate) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(lastMessageDate).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 5) return t('friends.justNow');
    if (minutes < 60) return t('friends.minutesAgo', { minutes });
    if (hours < 24) return t('friends.hoursAgo', { hours });
    return t('friends.daysAgo', { days });
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(conversation.friend.id)}
      className="bg-appLightGrey rounded-xl p-5 mb-4"
    >
      <View className="flex-row items-center">
        <View className="relative mr-4">
          <View className="w-14 h-14 bg-appMediumGrey rounded-full items-center justify-center">
            {conversation.friend.photoUri ? (
              <Image
                source={{ uri: conversation.friend.photoUri }}
                className="w-14 h-14 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={24} color="white" />
            )}
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-nunito-bold text-appBlack">
              {conversation.friend.username}
            </Text>
            
            {hasUnread && (
              <View className="bg-appMediumRed rounded-full w-6 h-6 items-center justify-center">
                <Text className="text-xs font-nunito-bold text-white">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-sm font-nunito-regular text-appMediumGrey mr-2" numberOfLines={1}>
              {conversation.lastMessage || t('friends.noMessages')}
            </Text>
            
            <Text className="text-xs font-nunito-regular text-appMediumGrey">
              {formatLastSeen(conversation.lastMessageDate)}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={COLORS.appMediumGrey} className="ml-2" />
      </View>
    </TouchableOpacity>
  );
};