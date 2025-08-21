import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

interface IconButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  className?: string;
  testID?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  iconName,
  onPress,
  size = 24,
  backgroundColor = COLORS.appDarkGrey,
  iconColor = COLORS.appBgWhite,
  className = "",
  testID,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full p-3 ${className}`}
      style={{ backgroundColor }}
      testID={testID}
    >
      <Ionicons name={iconName} size={size} color={iconColor} />
    </TouchableOpacity>
  );
};

export default IconButton;
