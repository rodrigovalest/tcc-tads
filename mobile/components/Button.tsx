import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { COLORS } from "../constants/colors";
import Icon from "react-native-vector-icons/FontAwesome";

interface ButtonProps {
  title: string;
  onPress: () => void;
  bgColor?: string;
  bgColorActivate?: string;
  borderColor?: string;
  borderColorActivate?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textColor?: string;
  textColorActivate?: string;
  textSize?: string;
  iconLeft?: string;
  iconRight?: string;
  iconLeftSize?: number;
  iconRightSize?: number;
  iconLeftColor?: string;
  iconLeftColorActivate?: string;
  iconRightColor?: string;
  iconRightColorActivate?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = "",
  textColor = "white",
  bgColor = "bg-white",
  bgColorActivate = "bg-black",
  textColorActivate = "white",
  borderColor = "border-black",
  borderColorActivate = "border-gray-500",
  textSize = "base",
  iconLeft = null,
  iconRight = null,
  iconLeftSize = 24,
  iconRightSize = 24,
  iconLeftColor = "black",
  iconLeftColorActivate = "white",
  iconRightColor = "black",
  iconRightColorActivate = "white",
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const currentBgColor =
    isPressed && !disabled && !loading && bgColorActivate
      ? bgColorActivate
      : bgColor;
  const currentTextColor =
    isPressed && !disabled && !loading && textColorActivate
      ? textColorActivate
      : textColor;
  const currentBorderColor =
    isPressed && !disabled && !loading && borderColorActivate
      ? borderColorActivate
      : borderColor;
  const currentIconLeftColor =
    isPressed && !disabled && !loading && iconLeftColorActivate
      ? iconLeftColorActivate
      : iconLeftColor;
  const currentIconRightColor =
    isPressed && !disabled && !loading && iconRightColorActivate
      ? iconRightColorActivate
      : iconRightColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || loading}
      className={`py-3.5 px-4 rounded-lg items-center justify-center border-2 ${className} ${currentBorderColor} 
      ${currentBgColor} ${disabled || loading ? "opacity-50" : ""}`}
      activeOpacity={1} // Use 1 to make background color change the primary feedback
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.appBlack} />
      ) : (
        <View className="flex flex-row items-center justify-between w-full">
          {iconLeft ? (
            <View className="justify-center items-center px-4">
              <Icon
                name={iconLeft}
                size={iconLeftSize}
                color={currentIconLeftColor}
              />
            </View>
          ) : (
            <View className="px-4" style={{ width: 24 }} />
          )}
          <View className="flex-1 items-center justify-center">
            <Text
              className={`font-semibold text-center text-${textSize} text-${currentTextColor}`}
            >
              {title}
            </Text>
          </View>
          {iconRight ? (
            <View className="justify-center items-center px-4">
              <Icon
                name={iconRight}
                size={iconRightSize}
                color={currentIconRightColor}
              />
            </View>
          ) : (
            <View className="px-4" style={{ width: 24 }} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
