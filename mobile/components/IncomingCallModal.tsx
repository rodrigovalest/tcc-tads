import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useI18n from '../hooks/useI18n';

interface IncomingCallModalProps {
  visible: boolean;
  callerName: string;
  callerPhoto?: string | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  visible,
  callerName,
  callerPhoto,
  onAccept,
  onDecline,
}) => {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <View className="bg-appBgWhite rounded-3xl p-8 w-full max-w-sm items-center shadow-2xl">
          <View className="w-24 h-24 rounded-full bg-appLightGrey items-center justify-center mb-4 overflow-hidden border-4 border-appBlack">
            {callerPhoto ? (
              <Image
                source={{ uri: callerPhoto }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={48} color="#4F4F47" />
            )}
          </View>
          <Text className="text-2xl font-nunito-bold text-appBlack mb-2">
            {callerName}
          </Text>
          <View className="flex-row items-center mb-6">
            <Ionicons name="videocam" size={20} color="#4F4F47" />
            <Text className="text-base font-nunito-medium text-appMediumGrey ml-2">
              {t('justChilling.videoCall')}
            </Text>
          </View>
          <View className="flex-row w-full justify-around mt-4">
            <TouchableOpacity
              onPress={onDecline}
              className="bg-appMediumRed rounded-full w-16 h-16 items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={32} color="#FEFBF4" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onAccept}
              className="bg-green-500 rounded-full w-16 h-16 items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={32} color="#FEFBF4" />
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-nunito-regular text-appMediumGrey mt-6 text-center">
            {t('justChilling.incomingCallDescription')}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
