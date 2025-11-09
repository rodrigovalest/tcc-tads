import { MatchLanguage } from "../../models/types/match-language.type";

type WordLevel = "basic" | "intermediate" | "advanced";

export interface LegacyBilingualDictionary {
  metadata: {
    source: string;
    target: string;
    words: number;
    level: string;
    version: string;
  };
  words: {
    [word: string]: string[]; // legacy format: array de traduções
  };
}

export interface NewBilingualDictionary {
  metadata: {
    source: string;
    target: string;
    words: number;
    level: string;
    version: string;
    generatedAt?: string;
    source_data?: string;
    levels?: { basic: number; intermediate: number; advanced: number };
  };
  words: {
    [word: string]: { translations: string[]; level: WordLevel };
  };
}

export type BilingualDictionary =
  | LegacyBilingualDictionary
  | NewBilingualDictionary;

interface DictionaryCache {
  [key: string]: BilingualDictionary;
}

// Cache de dicionários carregados
const dictionaryCache: DictionaryCache = {};

// Mapeamento dos arquivos de dicionários
const DICTIONARY_FILES: Record<string, any> = {
  "en-pt": require("../../assets/dictionaries/bilingual/en/pt.json"),
  "en-es": require("../../assets/dictionaries/bilingual/en/es.json"),
  "pt-en": require("../../assets/dictionaries/bilingual/pt/en.json"),
  "pt-es": require("../../assets/dictionaries/bilingual/pt/es.json"),
  "es-en": require("../../assets/dictionaries/bilingual/es/en.json"),
  "es-pt": require("../../assets/dictionaries/bilingual/es/pt.json"),
};

/**
 * Carrega um dicionário bilíngue do cache ou do arquivo
 */
export function loadDictionary(
  source: MatchLanguage,
  target: MatchLanguage
): BilingualDictionary {
  const key = `${source}-${target}`;

  // Retorna do cache se já foi carregado
  if (dictionaryCache[key]) {
    return dictionaryCache[key];
  }

  // Carrega do arquivo
  const dictFile = DICTIONARY_FILES[key];
  if (!dictFile) {
    console.warn(`Dictionary ${key} not found`);
    return {
      metadata: {
        source,
        target,
        words: 0,
        level: "basic",
        version: "1.0",
      },
      words: {},
    };
  }

  // Armazena no cache
  dictionaryCache[key] = dictFile;
  return dictFile;
}

/**
 * Normaliza texto para comparação (remove acentos, lowercase, trim)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove diacríticos (acentos)
}

/**
 * Traduz uma palavra do idioma fonte para o idioma alvo
 * @returns Array de traduções possíveis ou null se não encontrado
 */
export function translateWord(
  word: string,
  sourceLanguage: MatchLanguage,
  targetLanguage: MatchLanguage
): string[] | null {
  const dictionary = loadDictionary(sourceLanguage, targetLanguage);
  const normalizedWord = normalizeText(word);

  // Busca exata
  if ((dictionary as any).words[word]) {
    const entry: any = (dictionary as any).words[word];
    // Suporta formato novo ({ translations, level }) e antigo (string[])
    return Array.isArray(entry) ? entry : entry?.translations || null;
  }

  // Busca normalizada (sem acentos)
  for (const [dictWord, entry] of Object.entries((dictionary as any).words)) {
    if (normalizeText(dictWord) === normalizedWord) {
      const translations = Array.isArray(entry)
        ? (entry as string[])
        : (entry as any)?.translations;
      return translations || null;
    }
  }

  return null;
}

/**
 * Verifica se uma tradução está correta
 */
export function isTranslationCorrect(
  sourceWord: string,
  userTranslation: string,
  sourceLanguage: MatchLanguage,
  targetLanguage: MatchLanguage
): boolean {
  const correctTranslations = translateWord(
    sourceWord,
    sourceLanguage,
    targetLanguage
  );

  if (!correctTranslations) {
    return false;
  }

  const normalizedUserTranslation = normalizeText(userTranslation);

  // Verifica se a tradução do usuário corresponde a alguma tradução correta
  return correctTranslations.some(
    (translation) => normalizeText(translation) === normalizedUserTranslation
  );
}

/**
 * Retorna todas as palavras disponíveis para um par de idiomas
 */
export function getAvailableWords(
  sourceLanguage: MatchLanguage,
  targetLanguage: MatchLanguage,
  level?: WordLevel
): string[] {
  const dictionary = loadDictionary(sourceLanguage, targetLanguage) as any;
  const words: string[] = [];

  for (const [w, entry] of Object.entries(dictionary.words)) {
    if (!level) {
      words.push(w);
      continue;
    }
    if (Array.isArray(entry)) {
      // Dicionário legado não possui nível, inclui todas se nenhum nível ou assume 'basic' por padrão
      if (level === "basic") words.push(w);
    } else if (entry && typeof entry === "object") {
      if ((entry as any).level === level) words.push(w);
    }
  }
  return words;
}

export type { WordLevel };

/**
 * Retorna informações do dicionário
 */
export function getDictionaryInfo(
  sourceLanguage: MatchLanguage,
  targetLanguage: MatchLanguage
) {
  const dictionary = loadDictionary(sourceLanguage, targetLanguage);
  return dictionary.metadata;
}

/**
 * Limpa o cache de dicionários (útil para testes ou liberar memória)
 */
export function clearDictionaryCache(): void {
  Object.keys(dictionaryCache).forEach((key) => {
    delete dictionaryCache[key];
  });
}
