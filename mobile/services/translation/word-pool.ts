import { MatchLanguage } from "../../models/types/match-language.type";
import { getAvailableWords, WordLevel } from "./translation-service";

/**
 * Sistema de pool de palavras que evita repetições e gerencia palavras já vistas
 */
export class WordPool {
  private availableWords: string[];
  private usedWords: Set<string>;
  private currentPool: string[];
  private sourceLanguage: MatchLanguage;
  private targetLanguage: MatchLanguage;
  private level?: WordLevel;

  constructor(
    sourceLanguage: MatchLanguage,
    targetLanguage: MatchLanguage,
    level?: WordLevel
  ) {
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.level = level;
    this.availableWords = getAvailableWords(
      sourceLanguage,
      targetLanguage,
      level
    );
    this.usedWords = new Set();
    this.currentPool = [];
    this.refillPool();
  }

  /**
   * Preenche o pool com palavras não usadas recentemente
   * Usa algoritmo de embaralhamento (Fisher-Yates)
   */
  private refillPool(): void {
    // Palavras que não foram usadas nesta sessão
    const unusedWords = this.availableWords.filter(
      (word) => !this.usedWords.has(word)
    );

    // Se usou todas as palavras, reseta o conjunto de usadas
    // mas mantém as últimas 20% para evitar repetição imediata
    if (unusedWords.length === 0) {
      const recentWords = Array.from(this.usedWords).slice(
        -Math.ceil(this.availableWords.length * 0.2)
      );
      this.usedWords = new Set(recentWords);
      this.currentPool = this.shuffleArray(
        this.availableWords.filter((word) => !this.usedWords.has(word))
      );
    } else {
      this.currentPool = this.shuffleArray(unusedWords);
    }
  }

  /**
   * Embaralha um array usando Fisher-Yates shuffle
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Retorna a próxima palavra do pool
   */
  getNextWord(): string {
    // Se o pool está vazio, reabastece
    if (this.currentPool.length === 0) {
      this.refillPool();
    }

    // Pega a primeira palavra do pool
    const word = this.currentPool.shift();
    if (!word) {
      // Fallback: retorna palavra aleatória se algo der errado
      return this.availableWords[
        Math.floor(Math.random() * this.availableWords.length)
      ];
    }

    // Marca como usada
    this.usedWords.add(word);
    return word;
  }

  /**
   * Retorna múltiplas palavras de uma vez
   */
  getNextWords(count: number): string[] {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      words.push(this.getNextWord());
    }
    return words;
  }

  /**
   * Reseta o pool (útil para começar nova partida)
   */
  reset(): void {
    this.usedWords.clear();
    this.currentPool = [];
    this.refillPool();
  }

  /**
   * Retorna estatísticas do pool
   */
  getStats() {
    return {
      totalWords: this.availableWords.length,
      usedWords: this.usedWords.size,
      remainingInPool: this.currentPool.length,
      unusedWords: this.availableWords.length - this.usedWords.size,
    };
  }

  /**
   * Verifica se ainda há palavras não usadas
   */
  hasUnusedWords(): boolean {
    return (
      this.usedWords.size < this.availableWords.length ||
      this.currentPool.length > 0
    );
  }
}

/**
 * Factory function para criar um novo WordPool
 */
export function createWordPool(
  sourceLanguage: MatchLanguage,
  targetLanguage: MatchLanguage,
  level?: WordLevel
): WordPool {
  return new WordPool(sourceLanguage, targetLanguage, level);
}
