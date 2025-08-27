import { useState, useMemo } from "react";
import { LanguageFluency } from "../models/types/register.types";

export interface LanguageSelectionActions {
  toggleLanguage: (languageCode: string) => void;
  updateFluencyLevel: (languageCode: string, level: number) => void;
}

export const useLanguageSelection = (
  selectedLanguages: LanguageFluency[],
  onLanguagesChange: (languages: LanguageFluency[]) => void
): LanguageSelectionActions => {
  const toggleLanguage = (languageCode: string) => {
    const isSelected = selectedLanguages.some(lang => lang.languageCode === languageCode);
    
    if (isSelected) {
      onLanguagesChange(selectedLanguages.filter(lang => lang.languageCode !== languageCode));
    } else {
      onLanguagesChange([...selectedLanguages, { languageCode, fluencyLevel: 3 }]);
    }
  };

  const updateFluencyLevel = (languageCode: string, level: number) => {
    onLanguagesChange(
      selectedLanguages.map(lang =>
        lang.languageCode === languageCode
          ? { ...lang, fluencyLevel: level }
          : lang
      )
    );
  };

  return {
    toggleLanguage,
    updateFluencyLevel,
  };
};
