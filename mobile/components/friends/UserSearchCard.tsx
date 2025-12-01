import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchUser } from '../../hooks/useUserSearch';
import useI18n from '../../hooks/useI18n';
import { COLORS } from '../../constants/colors';

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
          <View className="bg-appBgBeige py-3 px-4 rounded-xl flex-row items-center justify-center border border-appLightGrey">
            <Ionicons name="checkmark-circle" size={18} color={COLORS.appDarkGrey} />
            <Text className="text-appDarkGrey font-nunito-semibold text-sm ml-2">
              {t('friends.alreadyFriend')}
            </Text>
          </View>
        );

      case 'pending-sent':
        return (
          <View className="bg-appBgBeige py-3 px-4 rounded-xl flex-row items-center justify-center border border-appLightGrey">
            <Ionicons name="time-outline" size={18} color={COLORS.appDarkGrey} />
            <Text className="text-appDarkGrey font-nunito-semibold text-sm ml-2">
              {t('friends.requestSent')}
            </Text>
          </View>
        );

      case 'pending-received':
        return (
          <View className="bg-appLightGrey py-3 px-4 rounded-xl flex-row items-center justify-center border border-appLightGrey">
            <Ionicons name="mail-outline" size={18} color={COLORS.appDarkGrey} />
            <Text className="text-appDarkGrey font-nunito-semibold text-sm ml-2">
              {t('friends.requestReceived')}
            </Text>
          </View>
        );

      default:
        return (
          <TouchableOpacity
            onPress={() => onSendRequest(user)}
            disabled={isSending}
            className="bg-appDarkGrey py-3 px-4 rounded-xl flex-row items-center justify-center shadow-sm"
            style={{ opacity: isSending ? 0.5 : 1 }}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="person-add" size={18} color="white" />
                <Text className="text-white font-nunito-semibold text-sm ml-2">
                  {t('friends.sendRequest')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  };

  return (
    <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-appLightGrey">
      <View className="flex-row items-center justify-between">
        <View className="w-16 h-16 bg-appLightGrey rounded-full items-center justify-center mr-4 border-2 border-white shadow-sm">
          {user.photoUri ? (
            <Image
              source={{ uri: user.photoUri }}
              className="w-16 h-16 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={28} color={COLORS.appMediumGrey} />
          )}
        </View>
        
        <View className="flex-1 mr-4">
          <View className="flex-row items-center">
            <Text className="text-lg font-nunito-bold text-appBlack flex-1">
              {user.name}
            </Text>
            <Text className="text-sm">🐾</Text>
          </View>
          <Text className="text-sm font-nunito-medium text-appMediumGrey mb-2">
            @{user.username}
          </Text>
          
          {user.personalDescription && (
            <Text className="text-sm font-nunito-regular text-appMediumGrey mb-2" numberOfLines={2}>
              {user.personalDescription}
            </Text>
          )}
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={14} color={COLORS.appMediumGrey} />
            <Text className="text-sm font-nunito-regular text-appMediumGrey ml-1">
              {user.nationality}
            </Text>
          </View>
          
          {user.languages && user.languages.length > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="language-outline" size={14} color={COLORS.appMediumGrey} />
              <Text className="text-sm font-nunito-regular text-appMediumGrey ml-1">
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