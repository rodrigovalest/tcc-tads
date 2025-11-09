import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useI18n from '../hooks/useI18n';

interface OutgoingCallModalProps {
  visible: boolean;
  friendName: string;
  friendPhoto?: string | null;
  onCancel: () => void;
}

export const OutgoingCallModal: React.FC<OutgoingCallModalProps> = ({
  visible,
  friendName,
  friendPhoto,
  onCancel,
}) => {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-appBgWhite rounded-3xl p-8 w-full max-w-sm items-center shadow-2xl">
          <View className="relative mb-6">
            <View className="w-24 h-24 rounded-full bg-appLightGrey items-center justify-center overflow-hidden border-4 border-appBlack">
              {friendPhoto ? (
                <Image
                  source={{ uri: friendPhoto }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={48} color="#4F4F47" />
              )}
            </View>
            <View className="absolute inset-0 rounded-full border-4 border-green-500 opacity-50 animate-ping" />
          </View>
          <Text className="text-2xl font-nunito-bold text-appBlack mb-2">
            {friendName}
          </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="videocam" size={20} color="#4F4F47" />
            <Text className="text-base font-nunito-medium text-appMediumGrey ml-2">
              {t('justChilling.calling')}
            </Text>
          </View>
          <View className="flex-row mb-8">
            <View className="w-2 h-2 rounded-full bg-appMediumGrey mx-1 animate-bounce" />
            <View className="w-2 h-2 rounded-full bg-appMediumGrey mx-1 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <View className="w-2 h-2 rounded-full bg-appMediumGrey mx-1 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </View>
          <TouchableOpacity
            onPress={onCancel}
            className="bg-appMediumRed rounded-full w-16 h-16 items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={32} color="#FEFBF4" />
          </TouchableOpacity>

          <Text className="text-sm font-nunito-regular text-appMediumGrey mt-6 text-center">
            {t('justChilling.waitingForResponse')}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
