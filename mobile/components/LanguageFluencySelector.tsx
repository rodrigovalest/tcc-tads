import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
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
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getDisplayName = (code: string, defaultName: string): string => {
    const langPrefix = code.split('-')[0];
    const translatedName = t(`languages.${langPrefix}`);
    return translatedName !== `languages.${langPrefix}` ? translatedName : defaultName;
  };

  const toggleLanguage = (languageCode: string) => {
    const isSelected = selectedLanguages.some(lang => lang.languageCode === languageCode);
    
    if (isSelected) {
      onLanguagesChange(selectedLanguages.filter(lang => lang.languageCode !== languageCode));
    } else {
      onLanguagesChange([...selectedLanguages, { languageCode, fluencyLevel: 3 }]);
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

  const getLanguageData = (languageCode: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode) || null;
  };

  const renderStars = (languageCode: string, currentLevel: number, size: number = 20) => {
    return (
      <View className="flex-row" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => updateFluencyLevel(languageCode, level)}
          >
            <Ionicons
              name={level <= currentLevel ? "star" : "star-outline"}
              size={size}
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

  const filteredLanguages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(lang => {
      const translatedName = getDisplayName(lang.code, lang.name);
      return lang.name.toLowerCase().includes(query) ||
             lang.code.toLowerCase().includes(query) ||
             translatedName.toLowerCase().includes(query);
    });
  }, [searchQuery, t]);

  const sortedFilteredLanguages = useMemo(() => {
    return filteredLanguages.sort((a, b) => {
      const nameA = getDisplayName(a.code, a.name);
      const nameB = getDisplayName(b.code, b.name);
      return nameA.localeCompare(nameB);
    });
  }, [filteredLanguages, t]);

  const unselectedLanguages = useMemo(() => {
    const selectedCodes = new Set(selectedLanguages.map(l => l.languageCode));
    return sortedFilteredLanguages.filter(l => !selectedCodes.has(l.code));
  }, [sortedFilteredLanguages, selectedLanguages]);

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-800 mb-2">
        {t('register.languages.title')}
      </Text>
      
      <View className="flex-row items-center px-3 py-2 bg-white rounded-lg border border-gray-300">
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.search')}
          className="flex-1 ml-2 text-base"
          placeholderTextColor="#9ca3af"
        />
      </View>
      
      {selectedLanguages.length > 0 && (
        <View className="mt-4">
          <Text className="text-sm text-gray-600 mb-2">{t('common.select')}:</Text>
          {selectedLanguages.map(({ languageCode, fluencyLevel }) => {
            const data = getLanguageData(languageCode);
            if (!data) return null;
            return (
              <View key={languageCode} className="flex-row items-center justify-between p-3 rounded-lg bg-appLightGrey mb-2">
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{data.emoji}</Text>
                  <Text className="text-base font-medium text-gray-800">{getDisplayName(data.code, data.name)}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-28 items-end">
                    {renderStars(languageCode, fluencyLevel, 18)}
                  </View>
                  <TouchableOpacity onPress={() => toggleLanguage(languageCode)} className="ml-2 p-1">
                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <ScrollView className="max-h-64 mt-4" showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {unselectedLanguages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => toggleLanguage(language.code)}
            className="p-4 rounded-lg border-2 border-gray-200 bg-white mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{language.emoji}</Text>
                <Text className="text-lg font-medium text-gray-800">{getDisplayName(language.code, language.name)}</Text>
              </View>
              <Ionicons name="add-circle-outline" size={24} color="#262B2A" />
            </View>
          </TouchableOpacity>
        ))}
        {unselectedLanguages.length === 0 && (
          <Text className="text-center text-sm text-gray-500 py-2">{t('common.search')}</Text>
        )}
      </ScrollView>

      {error && (
        <Text className="text-red-500 text-sm mt-2">{error}</Text>
      )}

      <Text className="text-sm text-gray-600 mt-2">
        {t('register.languages.instruction')}
      </Text>
    </View>
  );
};

export default LanguageFluencySelector; 