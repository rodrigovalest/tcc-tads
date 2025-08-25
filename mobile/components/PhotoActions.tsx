import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useI18n from "../hooks/useI18n";

interface PhotoActionsProps {
  isLoading: boolean;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
}
export const PhotoActions: React.FC<PhotoActionsProps> = ({
  isLoading,
  onTakePhoto,
  onPickFromGallery,
}) => {
  const { t } = useI18n();

  return (
    <View className="mt-6">
      <TouchableOpacity
        onPress={onTakePhoto}
        disabled={isLoading}
        className="flex-row items-center justify-center space-x-2 bg-appDarkGrey p-4 rounded-lg mb-6"
        accessibilityLabel={t('register.photo.takePhoto')}
        accessibilityRole="button"
      >
        <Ionicons name="camera" size={20} color="white" />
        <Text className="text-white font-medium text-lg">
          {isLoading ? t('register.photo.loading') : t('register.photo.takePhoto')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onPickFromGallery}
        disabled={isLoading}
        className="flex-row items-center justify-center space-x-2 bg-gray-500 p-4 rounded-lg"
        accessibilityLabel={t('register.photo.chooseFromGallery')}
        accessibilityRole="button"
      >
        <Ionicons name="images" size={20} color="white" />
        <Text className="text-white font-medium text-lg">
          {isLoading ? t('register.photo.loading') : t('register.photo.chooseFromGallery')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
