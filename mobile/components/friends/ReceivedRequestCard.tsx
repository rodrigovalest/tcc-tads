import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FriendshipRequest } from '../../types/friendship.types';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';

interface ReceivedRequestCardProps {
  request: FriendshipRequest;
  responding: number | null;
  onRespond: (requestId: number, status: 'accepted' | 'rejected') => void;
}

export const ReceivedRequestCard: React.FC<ReceivedRequestCardProps> = ({
  request,
  responding,
  onRespond
}) => {
  const { t } = useI18n();
  const isResponding = responding === request.id;

  return (
    <View className="bg-appLightGrey rounded-xl p-5 mb-4">
      <View className="flex-row items-center mb-4">
        <View className="w-14 h-14 bg-appMediumGrey rounded-full items-center justify-center mr-4">
          <Ionicons name="person-add" size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-nunito-bold text-appBlack mb-1">
            {request.requester.username}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color={COLORS.appMediumGrey} />
            <Text className="text-sm font-nunito-regular text-appMediumGrey ml-1">
              {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row">
        <TouchableOpacity
          onPress={() => onRespond(request.id, 'accepted')}
          disabled={isResponding}
          className="flex-1 bg-appBlack py-3 px-4 rounded-xl flex-row items-center justify-center mr-2"
        >
          {isResponding ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text className="text-white font-nunito-bold text-base ml-2">
                {t('friends.accept')}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onRespond(request.id, 'rejected')}
          disabled={isResponding}
          className="flex-1 bg-appMediumRed py-3 px-4 rounded-xl flex-row items-center justify-center ml-2"
        >
          {isResponding ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="close-circle" size={18} color="white" />
              <Text className="text-white font-nunito-bold text-base ml-2">
                {t('friends.reject')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};