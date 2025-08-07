import { MatchLanguage } from "@/models/types/match-language.type";
import i18n from "../i18n/i18n";

export const AVALIABLE_MATCH_LANGUAGES: Record<MatchLanguage, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
};

export const getLocalizedMatchLanguages = (): Record<MatchLanguage, string> => {
  return {
    en: i18n.t('languages.en'),
    pt: i18n.t('languages.pt'),
    es: i18n.t('languages.es'),
  };
};
