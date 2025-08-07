import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useI18n from '../hooks/useI18n';
import { AppLanguage } from '../lib/i18n';

interface LanguageSelectorProps {
  showLabel?: boolean;
  variant?: 'full' | 'compact';
  onLanguageChange?: (language: AppLanguage) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  showLabel = true,
  variant = 'full',
  onLanguageChange,
}) => {
  const { t, currentLanguage, changeLanguage, availableLanguages } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageSelect = async (language: AppLanguage) => {
    try {
      await changeLanguage(language);
      onLanguageChange?.(language);
      setModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLanguageData = availableLanguages.find(
    lang => lang.code === currentLanguage
  );

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        className="flex-row items-center justify-center px-3 py-2 bg-appLightGrey rounded-lg"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-lg mr-2">{currentLanguageData?.flag}</Text>
        <Text className="text-sm font-nunito-medium text-appDarkGrey">
          {currentLanguageData?.code.toUpperCase()}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#7C7C7F" />
        
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View className="bg-white rounded-lg p-4 w-4/5 max-w-sm">
              <Text className="text-lg font-nunito-bold text-appBlack mb-4 text-center">
                {t('settings.selectLanguage')}
              </Text>
              
              <FlatList
                data={availableLanguages}
                keyExtractor={item => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`flex-row items-center p-3 rounded-lg mb-2 ${
                      item.code === currentLanguage ? 'bg-appLightGrey' : 'bg-transparent'
                    }`}
                    onPress={() => handleLanguageSelect(item.code)}
                  >
                    <Text className="text-2xl mr-3">{item.flag}</Text>
                    <Text className="text-base font-nunito-medium text-appBlack flex-1">
                      {item.name}
                    </Text>
                    {item.code === currentLanguage && (
                      <Ionicons name="checkmark" size={20} color="#262B2A" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </TouchableOpacity>
    );
  }

  return (
    <View className="mb-4">
      {showLabel && (
        <Text className="text-lg font-nunito-bold text-appBlack mb-3">
          {t('settings.language')}
        </Text>
      )}
      
      <TouchableOpacity
        className="flex-row items-center justify-between p-4 bg-appLightGrey rounded-lg"
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">{currentLanguageData?.flag}</Text>
          <Text className="text-base font-nunito-medium text-appBlack">
            {currentLanguageData?.name}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#7C7C7F" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-nunito-bold text-appBlack">
                {t('settings.selectLanguage')}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#262B2A" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableLanguages}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center p-4 rounded-lg mb-2 ${
                    item.code === currentLanguage ? 'bg-appLightGrey' : 'bg-transparent'
                  }`}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <Text className="text-2xl mr-4">{item.flag}</Text>
                  <Text className="text-lg font-nunito-medium text-appBlack flex-1">
                    {item.name}
                  </Text>
                  {item.code === currentLanguage && (
                    <Ionicons name="checkmark-circle" size={24} color="#262B2A" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default LanguageSelector;
