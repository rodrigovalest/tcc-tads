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
    <View className="bg-white rounded-xl p-5 mb-4 border border-appLightGrey shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 bg-appLightGrey rounded-full items-center justify-center mr-4 border-2 border-white shadow-sm">
          {request.addressee.photoUri ? (
            <Image
              source={{ uri: request.addressee.photoUri }}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="paper-plane" size={28} color={COLORS.appMediumGrey} />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-lg font-nunito-bold text-appBlack flex-1">
              {request.addressee.name}
            </Text>
            <Text className="text-sm">🐾</Text>
          </View>
          <Text className="text-sm font-nunito-medium text-appMediumGrey mb-1">
            @{request.addressee.username}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color={COLORS.appMediumGrey} />
            <Text className="text-sm font-nunito-regular text-appMediumGrey ml-1">
              {t('friends.sentOn')} {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <View className="w-2 h-2 bg-appYellow rounded-full mr-2"></View>
            <Text className="text-xs font-nunito-medium text-appDarkGrey uppercase tracking-wide">
              {t('friends.pending')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onCancel(request.id)}
        disabled={isCanceling}
        className="bg-white py-3 px-4 rounded-xl flex-row items-center justify-center shadow-sm border-2 border-appMediumGrey"
        style={{ opacity: isCanceling ? 0.5 : 1 }}
        activeOpacity={0.8}
      >
        {isCanceling ? (
          <ActivityIndicator size="small" color={COLORS.appDarkGrey} />
        ) : (
          <>
            <Ionicons name="close-circle" size={18} color={COLORS.appDarkGrey} />
            <Text className="text-appDarkGrey font-nunito-semibold text-base ml-2">
              {t('friends.cancelRequest')}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};