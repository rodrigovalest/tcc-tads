import { MatchLanguage } from "../models/types/match-language.type";

export const getMatchLanguageInfo = (
  code: MatchLanguage
): { name: string; flag: string } => {
  const languageMap = {
    en: { name: "English", flag: "🇺🇸" },
    pt: { name: "Português", flag: "🇧🇷" },
    es: { name: "Español", flag: "🇪🇸" },
  };

  return languageMap[code] || { name: code, flag: "🏳️" };
};

export const getMatchLanguageFlag = (code: MatchLanguage): string => {
  return getMatchLanguageInfo(code).flag;
};

export const getMatchLanguageName = (code: MatchLanguage): string => {
  return getMatchLanguageInfo(code).name;
};
