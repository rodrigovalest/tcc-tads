import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FriendshipRequest } from '../../types/friendship.types';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';

interface SentRequestCardProps {
  request: FriendshipRequest;
  canceling: number | null;
  onCancel: (requestId: number) => void;
}

export const SentRequestCard: React.FC<SentRequestCardProps> = ({
  request,
  canceling,
  onCancel
}) => {
  const { t } = useI18n();
  const isCanceling = canceling === request.id;

  return (
    <View className="bg-appLightGrey rounded-xl p-5 mb-4">
      <View className="flex-row items-center mb-4">
        <View className="w-14 h-14 bg-appMediumGrey rounded-full items-center justify-center mr-4">
          {request.addressee.photoUri ? (
            <Image
              source={{ uri: request.addressee.photoUri }}
              className="w-14 h-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="paper-plane" size={24} color="white" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-nunito-bold text-appBlack mb-1">
            {request.addressee.username}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color={COLORS.appMediumGrey} />
            <Text className="text-sm font-nunito-regular text-appMediumGrey ml-1">
              {t('friends.sentOn')} {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <View className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></View>
            <Text className="text-xs font-nunito-medium text-yellow-700 uppercase tracking-wide">
              {t('friends.pending')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onCancel(request.id)}
        disabled={isCanceling}
        className="bg-appMediumRed py-3 px-4 rounded-xl flex-row items-center justify-center"
        style={{ opacity: isCanceling ? 0.5 : 1 }}
      >
        {isCanceling ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="close-circle" size={18} color="white" />
            <Text className="text-white font-nunito-bold text-base ml-2">
              {t('friends.cancelRequest')}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};