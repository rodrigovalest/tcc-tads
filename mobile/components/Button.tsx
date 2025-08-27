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
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = "",
  textColor = "text-white",
  bgColor = "bg-white",
  bgColorActivate = "bg-black",
  textColorActivate = "text-white",
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
  testID,
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
      className={`py-4 px-6 rounded-lg items-center justify-center border-2 min-h-[52px] ${className} ${currentBorderColor} 
      ${currentBgColor} ${disabled || loading ? "opacity-50" : ""}`}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={COLORS.appBlack}
          testID="button-activity-indicator"
        />
      ) : (
        <View className="flex-row items-center">
          {iconLeft && (
            <Icon
              name={iconLeft}
              size={iconLeftSize}
              color={currentIconLeftColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className={`font-semibold text-center ${textSize === 'base' ? 'text-base' : `text-${textSize}`} ${currentTextColor}`}
          >
            {title}
          </Text>
          {iconRight && (
            <Icon
              name={iconRight}
              size={iconRightSize}
              color={currentIconRightColor}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
