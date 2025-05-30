import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  KeyboardTypeOptions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { COLORS } from "../constants/colors";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: "text" | "numeric" | "password" | "email";
  error?: string;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  type = "text",
  error,
  onBlur,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  const getKeyboardType = (): KeyboardTypeOptions | undefined => {
    switch (type) {
      case "numeric":
        return "numeric";
      case "email":
        return "email-address";
      default:
        return "default";
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-appBlack font-semibold text-xl pl-2.5">
        {label}
      </Text>
      <View
        className={`flex-row items-center border rounded-lg bg-appLightGrey ${
          error ? "border-appMediumRed" : "border-black"
        }`}
      >
        <TextInput
          key={
            type === "password"
              ? isPasswordVisible
                ? "password-visible"
                : "password-hidden"
              : "input"
          }
          className={`flex-1 px-3 py-4 text-xl text-appDarkGrey ${
            type === "password" ? "pr-10" : ""
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.appMediumGrey}
          secureTextEntry={type === "password" && !isPasswordVisible}
          keyboardType={getKeyboardType()}
          autoCapitalize={
            type === "email" || type === "password" ? "none" : "sentences"
          }
          textContentType={type === "password" ? "oneTimeCode" : undefined}
          onBlur={onBlur}
        />
        {type === "password" && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="absolute right-3 h-full justify-center items-center"
            testID="password-visibility-toggle"
          >
            <Icon
              name={isPasswordVisible ? "eye" : "eye-slash"}
              size={24}
              color={COLORS.appMediumGrey}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-appMediumRed text-xs mt-1 ml-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default Input;
