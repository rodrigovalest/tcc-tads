import React, { useEffect, ReactNode } from 'react';
import { View, Text } from 'react-native';
import useLanguageStore from '../store/language-store';
import useI18n from '../hooks/useI18n';
import '../i18n/i18n'; // Initialize i18n

interface I18nProviderProps {
  children: ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { initializeLanguage, isLoading } = useLanguageStore();
  const { t } = useI18n();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-appBgWhite">
        <Text className="text-lg font-nunito-medium text-appDarkGrey">
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default I18nProvider;
