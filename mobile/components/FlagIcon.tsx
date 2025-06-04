import React from "react";
import { Text } from "react-native";

interface FlagIconProps {
  countryCode: string;
  size?: number;
}

const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, size = 24 }) => {
  const getFlagEmoji = (code: string): string => {
    const flagEmojis: Record<string, string> = {
      br: "🇧🇷", // Brasil
      gb: "🇬🇧", // Reino Unido
      es: "🇪🇸", // Espanha
      us: "🇺🇸", // Estados Unidos
      fr: "🇫🇷", // França
      de: "🇩🇪", // Alemanha
      it: "🇮🇹", // Itália
      jp: "🇯🇵", // Japão
      kr: "🇰🇷", // Coreia do Sul
      cn: "🇨🇳", // China
    };

    return flagEmojis[code.toLowerCase()] || "🏳️";
  };

  return (
    <Text style={{ fontSize: size, lineHeight: size + 4 }}>
      {getFlagEmoji(countryCode)}
    </Text>
  );
};

export default FlagIcon;