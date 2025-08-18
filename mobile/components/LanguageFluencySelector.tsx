import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SUPPORTED_LANGUAGES } from "../constants/languages";
import useI18n from "../hooks/useI18n";

interface LanguageFluency {
  languageCode: string;
  fluencyLevel: number;
}

interface LanguageFluencySelectorProps {
  selectedLanguages: LanguageFluency[];
  onLanguagesChange: (languages: LanguageFluency[]) => void;
  error?: string;
}

const LanguageFluencySelector: React.FC<LanguageFluencySelectorProps> = ({
  selectedLanguages,
  onLanguagesChange,
  error,
}) => {
  const { t } = useI18n();
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

  const toggleLanguage = (languageCode: string) => {
    const isSelected = selectedLanguages.some(lang => lang.languageCode === languageCode);
    
    if (isSelected) {
      // Remove language
      onLanguagesChange(selectedLanguages.filter(lang => lang.languageCode !== languageCode));
      if (expandedLanguage === languageCode) {
        setExpandedLanguage(null);
      }
    } else {
      // Add language with default fluency level 3
      onLanguagesChange([...selectedLanguages, { languageCode, fluencyLevel: 3 }]);
      setExpandedLanguage(languageCode);
    }
  };

  const updateFluencyLevel = (languageCode: string, level: number) => {
    onLanguagesChange(
      selectedLanguages.map(lang =>
        lang.languageCode === languageCode
          ? { ...lang, fluencyLevel: level }
          : lang
      )
    );
  };

  const getLanguageName = (languageCode: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    return language ? language.name : languageCode;
  };

  const renderStars = (languageCode: string, currentLevel: number) => {
    return (
      <View className="flex-row space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => updateFluencyLevel(languageCode, level)}
          >
            <Ionicons
              name={level <= currentLevel ? "star" : "star-outline"}
              size={24}
              color={level <= currentLevel ? "#fbbf24" : "#d1d5db"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getLevelText = (level: number) => {
    return t(`register.languages.levels.${level}`);
  };

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        {t('register.languages.title')}
      </Text>
      
      <ScrollView className="max-h-64">
        {SUPPORTED_LANGUAGES.map((language) => {
          const isSelected = selectedLanguages.some(lang => lang.languageCode === language.code);
          const selectedLanguage = selectedLanguages.find(lang => lang.languageCode === language.code);
          const isExpanded = expandedLanguage === language.code;

          return (
            <View key={language.code} className="mb-3">
              <TouchableOpacity
                onPress={() => toggleLanguage(language.code)}
                className={`p-4 rounded-lg border-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-2xl">{language.emoji}</Text>
                    <Text className="text-lg font-medium text-gray-800">
                      {language.name}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                    size={24}
                    color={isSelected ? "#3b82f6" : "#9ca3af"}
                  />
                </View>
              </TouchableOpacity>

              {isSelected && isExpanded && (
                <View className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <Text className="text-sm text-gray-600 mb-2">
                    {t('register.languages.fluencyLevel')}
                  </Text>
                  {renderStars(language.code, selectedLanguage?.fluencyLevel || 3)}
                  <Text className="text-xs text-gray-500 mt-2">
                    {getLevelText(selectedLanguage?.fluencyLevel || 3)}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {error && (
        <Text className="text-red-500 text-sm mt-2">{error}</Text>
      )}

      <Text className="text-sm text-gray-600 mt-4">
        {t('register.languages.instruction')}
      </Text>
    </View>
  );
};

export default LanguageFluencySelector; 