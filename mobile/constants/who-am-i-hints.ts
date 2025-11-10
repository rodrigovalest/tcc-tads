import { MatchLanguage } from '../models/types/match-language.type';

type HintsByLanguage = Record<MatchLanguage, string[]>;

export const WHO_AM_I_HINTS: Record<number, HintsByLanguage> = {
  1: { // Cristiano Ronaldo
    pt: ["É um atleta"],
    en: ["Is an athlete"],
    es: ["Es un atleta"]
  },
  2: { // Messi
    pt: ["É um atleta"],
    en: ["Is an athlete"],
    es: ["Es un atleta"]
  },
  3: { // The Rock
    pt: ["É um ator"],
    en: ["Is an actor"],
    es: ["Es un actor"]
  },
  4: { // Elon Musk
    pt: ["É um empresário"],
    en: ["Is a businessman"],
    es: ["Es un empresario"]
  },
  5: { // Mark Zuckerberg
    pt: ["É um empresário"],
    en: ["Is a businessman"],
    es: ["Es un empresario"]
  },
  6: { // Leonardo DiCaprio
    pt: ["É um ator"],
    en: ["Is an actor"],
    es: ["Es un actor"]
  },
  7: { // Donald Trump
    pt: ["É um político"],
    en: ["Is a politician"],
    es: ["Es un político"]
  },
  8: { // Barack Obama
    pt: ["É um político"],
    en: ["Is a politician"],
    es: ["Es un político"]
  }
};

/**
 * Retorna as dicas de um personagem no idioma especificado
 */
export const getHintsForLanguage = (characterId: number, language: MatchLanguage): string[] => {
  const hints = WHO_AM_I_HINTS[characterId];
  if (!hints) {
    return [];
  }
  return hints[language] || hints.pt; // Fallback para português se o idioma não existir
};
