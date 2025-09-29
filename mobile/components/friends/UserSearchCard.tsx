import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchUser } from '../../hooks/useUserSearch';
import useI18n from '../../hooks/useI18n';

interface UserSearchCardProps {
  user: SearchUser;
  sendingRequests: Set<number>;
  onSendRequest: (user: SearchUser) => void;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({
  user,
  sendingRequests,
  onSendRequest
}) => {
  const { t } = useI18n();

  const renderActionButton = () => {
    const isSending = sendingRequests.has(user.id);

    switch (user.relationshipStatus) {
      case 'friend':
        return (
          <View className="bg-green-100 py-3 px-4 rounded-xl flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text className="text-green-700 font-nunito-bold text-base ml-2">
              {t('friends.alreadyFriend')}
            </Text>
          </View>
        );

      case 'pending-sent':
        return (
          <View className="bg-yellow-100 py-3 px-4 rounded-xl flex-row items-center justify-center">
            <Ionicons name="time-outline" size={18} color="#D97706" />
            <Text className="text-yellow-700 font-nunito-bold text-base ml-2">
              {t('friends.requestSent')}
            </Text>
          </View>
        );

      case 'pending-received':
        return (
          <View className="bg-blue-100 py-3 px-4 rounded-xl flex-row items-center justify-center">
            <Ionicons name="mail-outline" size={18} color="#2563EB" />
            <Text className="text-blue-700 font-nunito-bold text-base ml-2">
              {t('friends.requestReceived')}
            </Text>
          </View>
        );

      default:
        return (
          <TouchableOpacity
            onPress={() => onSendRequest(user)}
            disabled={isSending}
            className="bg-appBlack py-3 px-4 rounded-xl flex-row items-center justify-center"
            style={{ opacity: isSending ? 0.5 : 1 }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="person-add" size={18} color="white" />
                <Text className="text-white font-nunito-bold text-base ml-2">
                  {t('friends.sendRequest')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  };

  return (
    <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="w-14 h-14 bg-appMediumGrey rounded-full items-center justify-center mr-4">
          {user.photoUri ? (
            <Image
              source={{ uri: user.photoUri }}
              className="w-14 h-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="white" />
          )}
        </View>
        
        <View className="flex-1 mr-4">
          <Text className="text-lg font-nunito-bold text-appBlack mb-2">
            {user.username}
          </Text>
          
          {user.personalDescription && (
            <Text className="text-sm font-nunito-regular text-appMediumGrey mb-2" numberOfLines={2}>
              {user.personalDescription}
            </Text>
          )}
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-sm font-nunito-regular text-gray-600 ml-1">
              {user.nationality}
            </Text>
          </View>
          
          {user.languages && user.languages.length > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="language-outline" size={14} color="#6B7280" />
              <Text className="text-sm font-nunito-regular text-gray-600 ml-1">
                {user.languages.map((lang: any) => lang.language).join(' • ') || t('general.noLanguages')}
              </Text>
            </View>
          )}
        </View>
        
        <View className="items-end">
          {renderActionButton()}
        </View>
      </View>
    </View>
  );
};