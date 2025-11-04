import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Friendship } from '../../types/friendship.types';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';

interface FriendCardProps {
  friendship: Friendship;
  removing: number | null;
  onStartChat: (friendId: number) => void;
  onRemoveFriend: (friendId: number, friendName: string) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friendship,
  removing,
  onStartChat,
  onRemoveFriend
}) => {
  const { t } = useI18n();
  const isRemoving = removing === friendship.friend.id;

  return (
    <View className="bg-appLightGrey rounded-xl p-5 mb-4">
      <View className="flex-row items-center mb-4">
        <View className="w-14 h-14 bg-appMediumGrey rounded-full items-center justify-center mr-4">
          {friendship.friend.photoUri ? (
            <Image
              source={{ uri: friendship.friend.photoUri }}
              className="w-14 h-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="white" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-nunito-bold text-appBlack">
            {friendship.friend.name}
          </Text>
          <Text className="text-sm font-nunito-medium text-appMediumGrey mb-1">
            @{friendship.friend.username}
          </Text>
          
          {friendship.friend.languages && friendship.friend.languages.length > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="language-outline" size={14} color={COLORS.appMediumGrey} />
              <Text className="text-sm font-nunito-regular text-appMediumGrey ml-1">
                {friendship.friend.languages.map((lang: any) => lang.language).join(' • ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row">
        <TouchableOpacity
          onPress={() => onStartChat(friendship.friend.id)}
          className="flex-1 bg-appBlack py-3 px-4 rounded-xl flex-row items-center justify-center mr-2"
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="white" />
          <Text className="text-white font-nunito-bold text-base ml-2">
            {t('friends.startChat')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onRemoveFriend(friendship.friend.id, friendship.friend.username)}
          disabled={isRemoving}
          className="flex-1 bg-appMediumRed py-3 px-4 rounded-xl flex-row items-center justify-center ml-2"
          style={{ opacity: isRemoving ? 0.5 : 1 }}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="person-remove" size={18} color="white" />
              <Text className="text-white font-nunito-bold text-base ml-2">
                {t('friends.remove')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};