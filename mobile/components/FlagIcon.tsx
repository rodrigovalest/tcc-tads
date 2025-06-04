import React from "react";
import { getLanguageByCountryCode } from "@/constants/languages";

interface FlagIconProps {
  countryCode: string;
  size?: number;
}

const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, size = 24 }) => {
  const language = getLanguageByCountryCode(countryCode);

  if (!language) {
    return null;
  }

  const FlagComponent = language.svgComponent;

  return (
    <FlagComponent
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
};

export default FlagIcon;
