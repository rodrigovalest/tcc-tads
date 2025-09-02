import { CountryCode } from "@/models/types/country-code.type";
import React from "react";
import { SvgProps } from "react-native-svg";

export interface LanguageConfig {
  code: string;
  name: string;
  countryCode: CountryCode;
  emoji: string;
  svgComponent: React.FC<SvgProps>;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "pt-BR",
    name: "Português",
    countryCode: "br",
    emoji: "🇧🇷",
    svgComponent: require("../assets/images/flags_svg/br.svg").default,
  },
  {
    code: "en-GB",
    name: "English",
    countryCode: "gb",
    emoji: "🇬🇧",
    svgComponent: require("../assets/images/flags_svg/gb.svg").default,
  },
  {
    code: "es-ES",
    name: "Español",
    countryCode: "es",
    emoji: "🇪🇸",
    svgComponent: require("../assets/images/flags_svg/es.svg").default,
  },
  {
    code: "fr-FR",
    name: "Français",
    countryCode: "fr",
    emoji: "🇫🇷",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "de-DE",
    name: "Deutsch",
    countryCode: "de",
    emoji: "🇩🇪",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "it-IT",
    name: "Italiano",
    countryCode: "it",
    emoji: "🇮🇹",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "ja-JP",
    name: "日本語",
    countryCode: "jp",
    emoji: "🇯🇵",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "ko-KR",
    name: "한국어",
    countryCode: "kr",
    emoji: "🇰🇷",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "zh-CN",
    name: "中文",
    countryCode: "cn",
    emoji: "🇨🇳",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "ru-RU",
    name: "Русский",
    countryCode: "ru",
    emoji: "🇷🇺",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "ar-SA",
    name: "العربية",
    countryCode: "sa",
    emoji: "🇸🇦",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "hi-IN",
    name: "हिन्दी",
    countryCode: "in",
    emoji: "🇮🇳",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "nl-NL",
    name: "Nederlands",
    countryCode: "nl",
    emoji: "🇳🇱",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "sv-SE",
    name: "Svenska",
    countryCode: "se",
    emoji: "🇸🇪",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "no-NO",
    name: "Norsk",
    countryCode: "no",
    emoji: "🇳🇴",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "da-DK",
    name: "Dansk",
    countryCode: "dk",
    emoji: "🇩🇰",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "fi-FI",
    name: "Suomi",
    countryCode: "fi",
    emoji: "🇫🇮",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "pl-PL",
    name: "Polski",
    countryCode: "pl",
    emoji: "🇵🇱",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "cs-CZ",
    name: "Čeština",
    countryCode: "cz",
    emoji: "🇨🇿",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "tr-TR",
    name: "Türkçe",
    countryCode: "tr",
    emoji: "🇹🇷",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
  {
    code: "th-TH",
    name: "ไทย",
    countryCode: "th",
    emoji: "🇹🇭",
    svgComponent: require("../assets/images/flags_svg/br.svg").default, // Placeholder
  },
];

export function getLanguageByCountryCode(
  countryCode: CountryCode
): LanguageConfig | null {
  return (
    SUPPORTED_LANGUAGES.find(
      (lang) => lang.countryCode.toLowerCase() === countryCode.toLowerCase()
    ) || null
  );
}

export function getLanguageByCode(languageCode: string): LanguageConfig | null {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode) || null;
}

export interface FlagDisplay {
  type: "svg" | "emoji" | "none";
  svgComponent?: React.FC<SvgProps>;
  emoji?: string;
}

export function getFlagDisplay(countryCode: CountryCode): FlagDisplay {
  const language = getLanguageByCountryCode(countryCode);

  if (language) {
    return {
      type: "svg",
      svgComponent: language.svgComponent,
      emoji: language.emoji,
    };
  }

  return { type: "none" };
}
