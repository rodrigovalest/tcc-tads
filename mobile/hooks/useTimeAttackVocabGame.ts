import { useState, useEffect, useRef, useCallback } from "react";
import {
  ITimeAttackVocabGame,
  ITimeAttackVocabGameResult,
  IWordTranslationEvaluation,
} from "../models/interfaces/time_attack_vocab_game";
import { MatchLanguage } from "../models/types/match-language.type";
import matchService from "../services/match-service";

const GAME_DURATION = 60;
const POINTS_PER_CORRECT_WORD = 10;

const WORD_TRANSLATIONS: Record<
  string,
  Record<string, Record<string, string[]>>
> = {
  en: {
    pt: {
      cat: ["gato", "gata"],
      dog: ["cachorro", "cão"],
      house: ["casa"],
      tree: ["árvore", "arvore"],
      water: ["água", "agua"],
      food: ["comida", "alimento"],
      book: ["livro"],
      car: ["carro", "automóvel"],
      phone: ["telefone", "celular"],
      computer: ["computador"],
      hello: ["olá", "oi", "ola"],
      world: ["mundo"],
      time: ["tempo", "hora"],
      love: ["amor"],
      life: ["vida"],
      happy: ["feliz", "alegre"],
      good: ["bom", "boa"],
      work: ["trabalho", "trabalhar"],
    },
    es: {
      cat: ["gato"],
      dog: ["perro"],
      house: ["casa"],
      tree: ["árbol", "arbol"],
      water: ["agua"],
      food: ["comida", "alimento"],
      book: ["libro"],
      car: ["coche", "carro"],
      phone: ["teléfono", "telefono", "móvil", "movil"],
      computer: ["computadora", "ordenador"],
      hello: ["hola"],
      world: ["mundo"],
      time: ["tiempo", "hora"],
      love: ["amor"],
      life: ["vida"],
      happy: ["feliz", "alegre"],
      good: ["bueno", "bien"],
      work: ["trabajo", "trabajar"],
    },
  },
  pt: {
    en: {
      gato: ["cat"],
      cachorro: ["dog"],
      casa: ["house"],
      árvore: ["tree"],
      água: ["water"],
      comida: ["food"],
      livro: ["book"],
      carro: ["car"],
      telefone: ["phone"],
      computador: ["computer"],
    },
    es: {
      gato: ["gato"],
      cachorro: ["perro"],
      casa: ["casa"],
      árvore: ["árbol", "arbol"],
      água: ["agua"],
      comida: ["comida"],
      livro: ["libro"],
      carro: ["coche", "carro"],
      telefone: ["teléfono", "telefono"],
      computador: ["computadora"],
    },
  },
  es: {
    en: {
      gato: ["cat"],
      perro: ["dog"],
      casa: ["house"],
      árbol: ["tree"],
      agua: ["water"],
      comida: ["food"],
      libro: ["book"],
      coche: ["car"],
      teléfono: ["phone"],
      computadora: ["computer"],
    },
    pt: {
      gato: ["gato"],
      perro: ["cachorro"],
      casa: ["casa"],
      árbol: ["árvore", "arvore"],
      agua: ["água", "agua"],
      comida: ["comida"],
      libro: ["livro"],
      coche: ["carro"],
      teléfono: ["telefone"],
      computadora: ["computador"],
    },
  },
};

const MOCK_WORDS: Record<string, Record<string, string[]>> = {
  en: {
    pt: [
      "cat",
      "dog",
      "house",
      "tree",
      "water",
      "food",
      "book",
      "car",
      "phone",
      "computer",
      "hello",
      "world",
      "time",
      "love",
      "life",
      "happy",
      "good",
      "work",
    ],
    es: [
      "cat",
      "dog",
      "house",
      "tree",
      "water",
      "food",
      "book",
      "car",
      "phone",
      "computer",
      "hello",
      "world",
      "time",
      "love",
      "life",
      "happy",
      "good",
      "work",
    ],
  },
  pt: {
    en: [
      "gato",
      "cachorro",
      "casa",
      "árvore",
      "água",
      "comida",
      "livro",
      "carro",
      "telefone",
      "computador",
    ],
    es: [
      "gato",
      "cachorro",
      "casa",
      "árvore",
      "água",
      "comida",
      "livro",
      "carro",
      "telefone",
      "computador",
    ],
  },
  es: {
    en: [
      "gato",
      "perro",
      "casa",
      "árbol",
      "agua",
      "comida",
      "libro",
      "coche",
      "teléfono",
      "computadora",
    ],
    pt: [
      "gato",
      "perro",
      "casa",
      "árbol",
      "agua",
      "comida",
      "libro",
      "coche",
      "teléfono",
      "computadora",
    ],
  },
};

export const useTimeAttackVocabGame = (
  sourceLanguage: MatchLanguage | null,
  targetLanguage: MatchLanguage | null
) => {
  const safeSourceLanguage: MatchLanguage = (sourceLanguage ||
    "en") as MatchLanguage;
  const safeTargetLanguage: MatchLanguage = (targetLanguage ||
    "pt") as MatchLanguage;

  const [gameState, setGameState] = useState<ITimeAttackVocabGame>({
    currentWord: "",
    timeLeft: GAME_DURATION,
    wordsTranslated: 0,
    score: 0,
    isGameActive: false,
    sourceLanguage: safeSourceLanguage,
    targetLanguage: safeTargetLanguage,
  });

  const [gameResult, setGameResult] =
    useState<ITimeAttackVocabGameResult | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const endedRef = useRef<boolean>(false);
  const evaluationsRef = useRef<IWordTranslationEvaluation[]>([]);
  const currentWordTimeRef = useRef<number>(0);
  const matchIdRef = useRef<string | null>(null);

  const getRandomWord = useCallback(() => {
    const words =
      MOCK_WORDS[safeSourceLanguage]?.[safeTargetLanguage] || MOCK_WORDS.en.pt;
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];
    return word;
  }, [safeSourceLanguage, safeTargetLanguage]);

  const finalizeGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const evaluations = evaluationsRef.current;
    const correctTranslations = evaluations.filter((e) => e.isCorrect).length;
    const incorrectTranslations = evaluations.filter(
      (e) => !e.isCorrect
    ).length;
    const score = correctTranslations * POINTS_PER_CORRECT_WORD;

    const actualTimePlayed =
      startTimeRef.current > 0
        ? Math.max(
            0,
            Math.min(GAME_DURATION, (Date.now() - startTimeRef.current) / 1000)
          )
        : GAME_DURATION;

    const averageTimePerWord =
      evaluations.length > 0 ? actualTimePlayed / evaluations.length : 0;

    const result: ITimeAttackVocabGameResult = {
      wordsTranslated: evaluations.length,
      correctTranslations,
      incorrectTranslations,
      evaluations,
      score,
      totalTime: actualTimePlayed,
      sourceLanguage: safeSourceLanguage,
      targetLanguage: safeTargetLanguage,
      averageTimePerWord,
    };

    setGameResult(result);
    setGameState((prev) => ({ ...prev, isGameActive: false, score }));

    if (matchIdRef.current) {
      try {
        await matchService.completeSoloMatch(matchIdRef.current);
      } catch (error) {
        console.error(
          "[useTimeAttackVocabGame] Failed to complete match:",
          error
        );
      }
    }
  }, [safeSourceLanguage, safeTargetLanguage]);

  const initializeGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    endedRef.current = false;
    evaluationsRef.current = [];
    matchIdRef.current = null;
    startTimeRef.current = 0;
    currentWordTimeRef.current = 0;

    const newWord = getRandomWord();

    setGameResult(null);
    setShowExitModal(false);
    setIsCountingDown(true);
    setGameState({
      currentWord: newWord,
      timeLeft: GAME_DURATION,
      wordsTranslated: 0,
      score: 0,
      isGameActive: false,
      sourceLanguage: safeSourceLanguage,
      targetLanguage: safeTargetLanguage,
    });
  }, [getRandomWord, safeSourceLanguage, safeTargetLanguage]);

  const startGame = useCallback(async () => {
    setIsCountingDown(false);
    setGameState((prev) => ({
      ...prev,
      isGameActive: true,
      timeLeft: GAME_DURATION,
    }));

    const currentTime = Date.now();
    startTimeRef.current = currentTime;
    endTimeRef.current = currentTime + GAME_DURATION * 1000;
    currentWordTimeRef.current = currentTime;
    endedRef.current = false;

    try {
      const response = await matchService.createSoloMatch(
        "time-attack-vocab",
        safeSourceLanguage
      );
      matchIdRef.current = response.matchId;
    } catch (error) {
      console.error("[useTimeAttackVocabGame] Failed to create match:", error);
    }

    timerRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      if (remainingMs <= 0) {
        setGameState((prev) => ({ ...prev, timeLeft: 0 }));
        finalizeGame();
        return;
      }
      const timeLeftSeconds = Math.max(0, remainingMs / 1000);
      setGameState((prev) => ({ ...prev, timeLeft: timeLeftSeconds }));
    }, 100);
  }, [finalizeGame, safeSourceLanguage]);

  const submitTranslation = useCallback(
    (translation: string) => {
      if (endedRef.current) return;
      if (!gameState.isGameActive) return;
      if (!translation.trim()) return;

      const currentTime = Date.now();
      const timeSpent = (currentTime - currentWordTimeRef.current) / 1000;

      const normalizeText = (text: string) =>
        text
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

      const normalizedTranslation = normalizeText(translation);
      const correctTranslations =
        WORD_TRANSLATIONS[safeSourceLanguage]?.[safeTargetLanguage]?.[
          gameState.currentWord
        ] || [];

      const isCorrect = correctTranslations.some(
        (correct) => normalizeText(correct) === normalizedTranslation
      );

      const evaluation: IWordTranslationEvaluation = {
        word: gameState.currentWord,
        userTranslation: translation.trim(),
        correctTranslation: correctTranslations[0] || "N/A",
        isCorrect,
        timeSpent,
      };

      evaluationsRef.current = [...evaluationsRef.current, evaluation];

      const newWord = getRandomWord();
      currentWordTimeRef.current = currentTime;

      setGameState((prev) => ({
        ...prev,
        currentWord: newWord,
        wordsTranslated: prev.wordsTranslated + 1,
        score: isCorrect ? prev.score + POINTS_PER_CORRECT_WORD : prev.score,
      }));
    },
    [gameState.isGameActive, gameState.currentWord, getRandomWord]
  );

  const handleExitGame = useCallback(() => {
    setShowExitModal(true);
  }, []);

  const confirmExitGame = useCallback(() => {
    finalizeGame();
  }, [finalizeGame]);

  const cancelExitGame = useCallback(() => {
    setShowExitModal(false);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    endedRef.current = false;
    evaluationsRef.current = [];
    matchIdRef.current = null;
    startTimeRef.current = 0;
    currentWordTimeRef.current = 0;
    setGameResult(null);
    setShowExitModal(false);
    setIsCountingDown(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    gameState,
    gameResult,
    isCountingDown,
    showExitModal,
    initializeGame,
    startGame,
    submitTranslation,
    handleExitGame,
    confirmExitGame,
    cancelExitGame,
    resetGame,
  };
};
