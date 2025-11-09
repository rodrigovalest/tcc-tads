import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useI18n from '../../hooks/useI18n';

interface ChatHeaderProps {
  friendId: number;
  friendName: string;
  friendPhoto: string | null;
  isOnline: boolean;
  onVideoCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  friendId,
  friendName,
  friendPhoto,
  isOnline,
  onVideoCall
}) => {
  const { t } = useI18n();

  return (
    <View className="flex-row items-center px-6 py-4 bg-white border-b border-appLighterGray shadow-sm">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-appLightGrey items-center justify-center mr-3"
      >
        <Ionicons name="arrow-back" size={18} color="#262B2A" />
      </TouchableOpacity>

      <View className="relative mr-3">
        <View className="w-12 h-12 bg-gradient-to-br from-appBlack to-appMediumGrey rounded-full items-center justify-center">
          {friendPhoto ? (
            <Image
              source={{ uri: friendPhoto }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="white" />
          )}
        </View>

        <View className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </View>
      
      <View className="flex-1">
        <Text className="text-lg font-nunito-bold text-appBlack">
          {friendName}
        </Text>
        <Text className="text-sm font-nunito-regular text-appMediumGrey">
          {isOnline ? t('friends.online') : t('friends.offline')}
        </Text>
      </View>
      {onVideoCall && (
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-appBlack items-center justify-center mr-2"
          onPress={onVideoCall}
        >
          <Ionicons name="videocam" size={20} color="#FEFBF4" />
        </TouchableOpacity>
      )}

      <TouchableOpacity className="w-10 h-10 rounded-full bg-appLightGrey items-center justify-center">
        <Ionicons name="ellipsis-vertical" size={18} color="#262B2A" />
      </TouchableOpacity>
    </View>
  );
};