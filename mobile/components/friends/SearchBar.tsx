import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  searching: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  searching,
  placeholder,
  autoFocus = false
}) => {
  const { t } = useI18n();

  return (
    <View className="mb-6">
      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-appLightGrey shadow-sm">
        <Ionicons name="search" size={20} color={COLORS.appMediumGrey} />
        <TextInput
          className="flex-1 ml-3 text-base font-nunito-regular text-appBlack"
          placeholder={placeholder || t('friends.enterUsername')}
          placeholderTextColor={COLORS.appMediumGrey}
          value={searchTerm}
          onChangeText={onSearchTermChange}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity
          onPress={onSearch}
          disabled={searching || !searchTerm.trim()}
          className="w-10 h-10 rounded-full bg-appDarkGrey items-center justify-center ml-2 shadow-sm"
          style={{ 
            opacity: (searching || !searchTerm.trim()) ? 0.5 : 1,
            backgroundColor: COLORS.appDarkGrey 
          }}
          activeOpacity={0.7}
        >
          {searching ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="search" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};