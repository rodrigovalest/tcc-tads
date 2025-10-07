import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  iconColor = COLORS.appMediumGrey
}) => {
  return (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name={icon} size={64} color={iconColor} />
      <Text className="text-lg font-nunito-medium text-appMediumGrey mt-4 text-center">
        {title}
      </Text>
      <Text className="text-sm font-nunito-regular text-appMediumGrey mt-2 text-center px-8">
        {description}
      </Text>
    </View>
  );
};