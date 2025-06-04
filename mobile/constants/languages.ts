import React from "react";
import { SvgProps } from "react-native-svg";

export interface LanguageConfig {
  code: string;
  name: string;
  countryCode: string;
  emoji: string;
  svgComponent: React.FC<SvgProps>;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "pt-BR",
    name: "Português",
    countryCode: "br",
    emoji: "🇧🇷",
    svgComponent: require("@/assets/images/flags_svg/br.svg").default,
  },
  {
    code: "en-GB",
    name: "English",
    countryCode: "gb", 
    emoji: "🇬🇧",
    svgComponent: require("@/assets/images/flags_svg/gb.svg").default,
  },
  {
    code: "es-ES",
    name: "Español",
    countryCode: "es",
    emoji: "🇪🇸", 
    svgComponent: require("@/assets/images/flags_svg/es.svg").default,
  },
];

export function getLanguageByCountryCode(countryCode: string): LanguageConfig | null {
  return SUPPORTED_LANGUAGES.find(lang => lang.countryCode.toLowerCase() === countryCode.toLowerCase()) || null;
}

export function getLanguageByCode(languageCode: string): LanguageConfig | null {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode) || null;
}

export interface FlagDisplay {
  type: 'svg' | 'emoji' | 'none';
  svgComponent?: React.FC<SvgProps>;
  emoji?: string;
}

export function getFlagDisplay(countryCode: string): FlagDisplay {
  const language = getLanguageByCountryCode(countryCode);
  
  if (language) {
    return { 
      type: 'svg', 
      svgComponent: language.svgComponent,
      emoji: language.emoji 
    };
  }
  
  return { type: 'none' };
}
