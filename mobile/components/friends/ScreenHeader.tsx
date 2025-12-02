import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  showBackButton = true
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center mb-6">
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBack}
          className="w-12 h-12 rounded-full bg-appLightGrey items-center justify-center mr-4 shadow-sm"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.appDarkGrey} />
        </TouchableOpacity>
      )}
      <View className="flex-row items-center flex-1">
        <Text className="text-2xl font-nunito-bold text-appBlack flex-1">
          {title}
        </Text>
        <Text className="text-xl ml-2">🐾</Text>
      </View>
    </View>
  );
};