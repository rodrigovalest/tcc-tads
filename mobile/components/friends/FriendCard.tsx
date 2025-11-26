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
  onInviteToGame?: (friendId: number) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friendship,
  removing,
  onStartChat,
  onRemoveFriend,
  onInviteToGame,
}) => {
  const { t } = useI18n();
  const isRemoving = removing === friendship.friend.id;

  return (
    <View className="bg-white rounded-xl p-5 mb-4 border border-appLightGrey shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 bg-appLightGrey rounded-full items-center justify-center mr-4 border-2 border-white shadow-sm">
          {friendship.friend.photoUri ? (
            <Image
              source={{ uri: friendship.friend.photoUri }}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={28} color={COLORS.appMediumGrey} />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-lg font-nunito-bold text-appBlack flex-1">
              {friendship.friend.name}
            </Text>
            <Text className="text-sm">🐾</Text>
          </View>
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
          className="flex-1 bg-appDarkGrey py-3 px-4 rounded-xl flex-row items-center justify-center mr-2 shadow-sm"
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="white" />
          <Text className="text-white font-nunito-semibold text-base ml-2">
            {t('friends.startChat')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onRemoveFriend(friendship.friend.id, friendship.friend.username)}
          disabled={isRemoving}
          className="flex-1 bg-white py-3 px-4 rounded-xl flex-row items-center justify-center ml-2 shadow-sm border-2 border-appMediumGrey"
          style={{ opacity: isRemoving ? 0.5 : 1 }}
          activeOpacity={0.8}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color={COLORS.appDarkGrey} />
          ) : (
            <>
              <Ionicons name="person-remove" size={18} color={COLORS.appDarkGrey} />
              <Text className="text-appDarkGrey font-nunito-semibold text-base ml-2">
                {t('friends.remove')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};