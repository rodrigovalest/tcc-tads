import React from "react";
import { TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { COLORS } from "../constants/colors";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Pesquisar...",
  value,
  onChangeText,
  onBlur,
}) => {
  return (
    <View className="flex-row items-center border rounded-lg bg-appLightGrey border-gray-300">
      <View className="pl-3 pr-2">
        <Icon name="search" size={20} color={COLORS.appMediumGrey} />
      </View>
      <TextInput
        className="flex-1 px-2 py-4 text-lg text-appDarkGrey"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.appMediumGrey}
        onBlur={onBlur}
        autoCapitalize="none"
      />
    </View>
  );
};

export default SearchInput;
