import React from "react";
import { View, Text, TextInput } from "react-native";
import useI18n from "../hooks/useI18n";

interface PersonalDescriptionProps {
  description: string;
  onDescriptionChange: (description: string) => void;
  error?: string;
  showOptionalMessage?: boolean;
}

const PersonalDescription: React.FC<PersonalDescriptionProps> = ({
  description,
  onDescriptionChange,
  error,
  showOptionalMessage = true,
}) => {
  const { t } = useI18n();

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-800 text-center">
        {t('register.description.title')}
      </Text>
      
      <Text className="text-sm text-gray-600 text-center mb-4">
        {t('register.description.subtitle')}
      </Text>

      <View className="space-y-2">
        <Text className="text-sm font-medium text-gray-700 mt-2">
          {t('register.description.label')}
        </Text>
        <TextInput
          value={description}
          onChangeText={onDescriptionChange}
          placeholder={t('register.description.placeholder')}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="p-4 border-2 border-gray-300 rounded-lg bg-white text-gray-800"
          style={{ minHeight: 120 }}
        />
        <Text className="text-xs text-gray-500 mb-4">
          {description.length}/500 {t('register.description.charactersCount')}
        </Text>
        {error && (
          <Text className="text-red-500 text-sm">{error}</Text>
        )}
      </View>

      {showOptionalMessage && (
        <Text className="text-xs text-gray-500 text-center mt-4">
          {t('register.description.optional')}
        </Text>
      )}
    </View>
  );
};

export default PersonalDescription; 