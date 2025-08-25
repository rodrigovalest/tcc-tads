// Word validation service using nspell loading real Hunspell assets (.aff/.dic)
import type { MatchLanguage } from "../../models/types/match-language.type";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
// @ts-ignore - nspell sem tipos completos
const nspell = require("nspell");

interface LoadedDictionary {
  aff: string;
  dic: string;
}
interface DictionaryAssets {
  [lang: string]: LoadedDictionary;
}

// Cache spell checkers + raw assets
let spellCheckerCache: Record<string, any> = {};
let assetsCache: DictionaryAssets | null = null;
if (!assetsCache) assetsCache = {} as DictionaryAssets;

// Word result cache (LRU simples)
const WORD_CACHE_LIMIT = 5000;
const wordValidityCache: Record<string, Map<string, boolean>> = {};

function getWordCache(lang: MatchLanguage) {
  if (!wordValidityCache[lang]) wordValidityCache[lang] = new Map();
  return wordValidityCache[lang];
}
function cacheWord(lang: MatchLanguage, w: string, v: boolean) {
  const c = getWordCache(lang);
  if (c.has(w)) return;
  c.set(w, v);
  if (c.size > WORD_CACHE_LIMIT) {
    const remove = Math.ceil(WORD_CACHE_LIMIT * 0.2);
    const it = c.keys();
    for (let i = 0; i < remove; i++) {
      const k = it.next();
      if (k.done) break;
      c.delete(k.value);
    }
  }
}

// Mapeamento dos arquivos reais (bundled assets)
// IMPORTANT: manter caminhos estáticos para o bundler
const DICT_FILES: Record<MatchLanguage, { aff: number; dic: number }> = {
  en: {
    aff: require("../../assets/dictionaries/en.aff"),
    dic: require("../../assets/dictionaries/en.dic"),
  },
  pt: {
    aff: require("../../assets/dictionaries/pt.aff"),
    dic: require("../../assets/dictionaries/pt.dic"),
  },
  es: {
    aff: require("../../assets/dictionaries/es.aff"),
    dic: require("../../assets/dictionaries/es.dic"),
  },
};

// Fallback mínimo caso assets falhem (pequeno para não pesar bundle)
const MIN_FALLBACK: Record<MatchLanguage, LoadedDictionary> = {
  en: {
    aff: "SET UTF-8\nSFX S Y 1\nSFX S 0 s .",
    dic: "10\ncat\ncats\ndog\ndogs\nword\nwords\nplay\nplays\nrun\nruns",
  },
  pt: {
    aff: "SET UTF-8\nSFX S Y 1\nSFX S 0 s .",
    dic: "10\namor\ncaso\ncasos\nvida\nvidas\nandar\nandar\nluz\nvez\nvezes",
  },
  es: {
    aff: "SET UTF-8\nSFX S Y 1\nSFX S 0 s .",
    dic: "10\namor\ncaso\ncasos\nvida\nvidas\nandar\nandar\nluz\nvez\nveces",
  },
};

// NOVO: carregamento lazy por idioma (evita baixar todos e falhar em um bloqueando os demais)
async function loadDictionaryForLanguage(
  language: MatchLanguage
): Promise<LoadedDictionary> {
  if (assetsCache && assetsCache[language]) return assetsCache[language];
  const files = DICT_FILES[language];
  if (!files) return MIN_FALLBACK[language];
  try {
    const affAsset = Asset.fromModule(files.aff);
    const dicAsset = Asset.fromModule(files.dic);
    // downloadAsync garante localUri (em desenvolvimento pode servir via packager; ainda assim chamamos)
    await Promise.all([affAsset.downloadAsync(), dicAsset.downloadAsync()]);

    async function readAsset(a: Asset): Promise<string> {
      if (a.localUri) {
        return await FileSystem.readAsStringAsync(a.localUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }
      // fallback: tentar via fetch (raro quando já possui localUri)
      return await fetch(a.uri).then((r) => r.text());
    }

    const [affText, dicText] = await Promise.all([
      readAsset(affAsset),
      readAsset(dicAsset),
    ]);
    const loaded = { aff: affText, dic: dicText };
    assetsCache![language] = loaded;
    if (__DEV__)
      console.log(`[WordValidation] Loaded dictionary for ${language}`);
    return loaded;
  } catch (e) {
    console.warn(
      `[WordValidation] Failed to load dictionary for ${language}, using minimal fallback`,
      e
    );
    const fb = MIN_FALLBACK[language];
    assetsCache![language] = fb;
    return fb;
  }
}

// Substitui função antiga (mantemos nome para compat se usada em outro lugar)
async function loadDictionaryAssets(): Promise<DictionaryAssets> {
  // carrega sob demanda; aqui apenas retorna cache atual
  return assetsCache || {};
}

async function getSpellChecker(lang: MatchLanguage) {
  if (spellCheckerCache[lang]) return spellCheckerCache[lang];
  try {
    const dict = await loadDictionaryForLanguage(lang);
    const checker = nspell(dict.aff, dict.dic);
    spellCheckerCache[lang] = checker;
    return checker;
  } catch (e) {
    console.warn(`[WordValidation] Cannot create spellChecker for ${lang}`, e);
    return null;
  }
}

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function fallbackValidation(word: string, language: MatchLanguage): boolean {
  if (word.length < 3) return false;
  if (/(.)\1{2,}/.test(word)) return false;
  const patterns = {
    en: /^[a-z]+$/,
    pt: /^[a-záéíóúâêôãõç]+$/,
    es: /^[a-záéíóúñü]+$/,
  } as const;
  return !!patterns[language]?.test(word);
}

function performCheck(
  normalizedWord: string,
  language: MatchLanguage,
  spellChecker: any | null
): boolean {
  if (normalizedWord.length < 2) return false;
  if (/(.)\1{2,}/.test(normalizedWord)) return false;
  if (spellChecker) {
    try {
      return !!spellChecker.correct(normalizedWord);
    } catch {
      /* ignore */
    }
  }
  return fallbackValidation(normalizedWord, language);
}

export async function validateWord(
  word: string,
  language: MatchLanguage
): Promise<boolean> {
  if (!word) return false;
  const norm = normalize(word);
  const cache = getWordCache(language);
  if (cache.has(norm)) return cache.get(norm)!;
  const checker = await getSpellChecker(language);
  const ok = performCheck(norm, language, checker);
  cacheWord(language, norm, ok);
  return ok;
}

export async function validateWords(
  words: string[],
  language: MatchLanguage
): Promise<{ word: string; isValid: boolean }[]> {
  if (!words.length) return [];
  const checker = await getSpellChecker(language);
  const cache = getWordCache(language);
  return words.map((w) => {
    const norm = normalize(w);
    if (cache.has(norm)) return { word: w, isValid: cache.get(norm)! };
    const isValid = performCheck(norm, language, checker);
    cacheWord(language, norm, isValid);
    return { word: w, isValid };
  });
}

export function clearSpellCheckerCache(langs?: MatchLanguage[]) {
  if (!langs) {
    spellCheckerCache = {};
    assetsCache = null;
    Object.values(wordValidityCache).forEach((m) => m.clear());
    return;
  }
  for (const l of langs) {
    delete spellCheckerCache[l];
    if (wordValidityCache[l]) wordValidityCache[l].clear();
  }
}
export async function preloadSpellCheckers(langs: MatchLanguage[]) {
  await Promise.all(langs.map((l) => getSpellChecker(l)));
}

// Legacy names
export const validateWordWithDictionary = validateWord;
export const bulkValidateWords = validateWords;
