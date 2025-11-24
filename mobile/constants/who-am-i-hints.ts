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
  },
  9: { // Taylor Swift
    pt: ["É uma cantora"],
    en: ["Is a singer"],
    es: ["Es una cantante"]
  },
  10: { // Michael Jackson
    pt: ["É um cantor"],
    en: ["Is a singer"],
    es: ["Es un cantante"]
  },
  11: { // Will Smith
    pt: ["É um ator"],
    en: ["Is an actor"],
    es: ["Es un actor"]
  },
  12: { // Albert Einstein
    pt: ["É um cientista"],
    en: ["Is a scientist"],
    es: ["Es un científico"]
  },
  13: { // Marie Curie
    pt: ["É uma cientista"],
    en: ["Is a scientist"],
    es: ["Es una científica"]
  },
  14: { // Steve Jobs
    pt: ["É um empresário"],
    en: ["Is a businessman"],
    es: ["Es un empresario"]
  },
  15: { // Alan Turing
    pt: ["É um cientista"],
    en: ["Is a scientist"],
    es: ["Es un científico"]
  },
  16: { // Neymar Jr
    pt: ["É um atleta"],
    en: ["Is an athlete"],
    es: ["Es un atleta"]
  },
  17: { // Serena Williams
    pt: ["É uma atleta"],
    en: ["Is an athlete"],
    es: ["Es una atleta"]
  },
  18: { // Usain Bolt
    pt: ["É um atleta"],
    en: ["Is an athlete"],
    es: ["Es un atleta"]
  },
  19: { // Tom Cruise
    pt: ["É um ator"],
    en: ["Is an actor"],
    es: ["Es un actor"]
  },
  20: { // Michael Jordan
    pt: ["É um atleta"],
    en: ["Is an athlete"],
    es: ["Es un atleta"]
  },
  21: { // Paul McCartney
    pt: ["É um músico"],
    en: ["Is a musician"],
    es: ["Es un músico"]
  },
  22: { // Oprah
    pt: ["É uma apresentadora"],
    en: ["Is a TV host"],
    es: ["Es una presentadora"]
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
