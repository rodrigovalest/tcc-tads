import React, { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Language } from "@/hooks/useLanguageSelection";
import FlagDisplay from "@/components/FlagDisplay";

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: Language | null;
  onLanguageSelect: (language: Language) => void;
}

const LanguageSelector = ({
  languages,
  selectedLanguage,
  onLanguageSelect,
}: LanguageSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLanguageSelect = (language: Language) => {
    onLanguageSelect(language);
    setIsDropdownOpen(false);
  };
  return (
    <View className="px-6">
      <View className="relative">
        <TouchableOpacity
          testID="language-selector-dropdown"
          className={`flex-row items-center justify-between p-4 bg-white border-2 border-black ${
            isDropdownOpen ? "rounded-t-xl rounded-b-none" : "rounded-xl"
          }`}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.7}
        >
          {selectedLanguage ? (
            <View className="flex-row items-center">
              <View className="mr-3">
                <FlagDisplay countryCode={selectedLanguage.flag} size={32} />
              </View>
              <Text className="text-lg font-semibold text-black">
                {selectedLanguage.name}
              </Text>
            </View>
          ) : (
            <Text className="text-lg text-gray-500">Select a language</Text>
          )}
          <Icon
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
          />
        </TouchableOpacity>
        {isDropdownOpen && (
          <View className="absolute top-full left-0 right-0 bg-white border-2 border-t-0 border-black rounded-b-xl z-50">
            <ScrollView
              className="max-h-64"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.id}
                  className={`flex-row items-center p-4 ${
                    index !== languages.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  } ${
                    selectedLanguage?.id === language.id ? "bg-gray-50" : ""
                  }`}
                  onPress={() => handleLanguageSelect(language)}
                  activeOpacity={0.7}
                >
                  <View className="mr-3">
                    <FlagDisplay countryCode={language.flag} size={28} />
                  </View>
                  <Text className="text-lg font-medium text-gray-800 flex-1">
                    {language.name}
                  </Text>
                  {selectedLanguage?.id === language.id && (
                    <Icon name="check" size={16} color="#000" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {isDropdownOpen && (
          <TouchableOpacity
            className="absolute -inset-96 bg-transparent"
            onPress={() => setIsDropdownOpen(false)}
            activeOpacity={1}
            style={{ zIndex: 10 }}
          />
        )}
      </View>
    </View>
  );
};

export default LanguageSelector;
