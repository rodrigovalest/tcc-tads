import React from "react";
import { Text } from "react-native";
import FlagIcon from "./FlagIcon";
import { getFlagDisplay } from "../constants/languages";

interface FlagDisplayProps {
  countryCode: string;
  size?: number;
  fallbackToEmoji?: boolean;
}

const FlagDisplay: React.FC<FlagDisplayProps> = ({
  countryCode,
  size = 24,
  fallbackToEmoji = true,
}) => {
  const flagDisplay = getFlagDisplay(countryCode);

  switch (flagDisplay.type) {
    case "svg":
      return <FlagIcon countryCode={countryCode} size={size} />;

    case "emoji":
      if (fallbackToEmoji && flagDisplay.emoji) {
        return (
          <Text style={{ fontSize: size, lineHeight: size + 4 }}>
            {flagDisplay.emoji}
          </Text>
        );
      }
      return null;

    case "none":
    default:
      if (fallbackToEmoji) {
        return <Text style={{ fontSize: size, lineHeight: size + 4 }}>🏳️</Text>;
      }
      return null;
  }
};

export default FlagDisplay;
