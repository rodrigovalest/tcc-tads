import { useState, useEffect, useRef, useCallback } from "react";
import {
  ITimeAttackVocabGame,
  ITimeAttackVocabGameResult,
  IWordTranslationEvaluation,
} from "../models/interfaces/time_attack_vocab_game";
import { MatchLanguage } from "../models/types/match-language.type";
import matchService from "../services/match-service";
import {
  createWordPool,
  isTranslationCorrect,
  translateWord,
  WordPool,
} from "../services/translation";
import type { WordLevel } from "../services/translation/translation-service";

const GAME_DURATION = 60;
const POINTS_PER_CORRECT_WORD = 10;

export const useTimeAttackVocabGame = (
  sourceLanguage: MatchLanguage | null,
  targetLanguage: MatchLanguage | null,
  level?: WordLevel | null
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
  const wordPoolRef = useRef<WordPool | null>(null);

  // Inicializa o word pool
  const initializeWordPool = useCallback(() => {
    if (wordPoolRef.current) {
      wordPoolRef.current.reset();
    } else {
      wordPoolRef.current = createWordPool(
        safeSourceLanguage,
        safeTargetLanguage,
        level || undefined
      );
    }
  }, [safeSourceLanguage, safeTargetLanguage, level]);

  const getRandomWord = useCallback(() => {
    if (!wordPoolRef.current) {
      initializeWordPool();
    }
    return wordPoolRef.current!.getNextWord();
  }, [initializeWordPool]);

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

    // Inicializa o word pool
    initializeWordPool();
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
  }, [
    getRandomWord,
    safeSourceLanguage,
    safeTargetLanguage,
    initializeWordPool,
  ]);

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

      // Usa o novo sistema de tradução
      const isCorrect = isTranslationCorrect(
        gameState.currentWord,
        translation.trim(),
        safeSourceLanguage,
        safeTargetLanguage
      );

      // Pega a primeira tradução correta para exibir
      const correctTranslations = translateWord(
        gameState.currentWord,
        safeSourceLanguage,
        safeTargetLanguage
      );

      const evaluation: IWordTranslationEvaluation = {
        word: gameState.currentWord,
        userTranslation: translation.trim(),
        correctTranslation: correctTranslations?.[0] || "N/A",
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
    [
      gameState.isGameActive,
      gameState.currentWord,
      getRandomWord,
      safeSourceLanguage,
      safeTargetLanguage,
    ]
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

    // Reseta o word pool
    if (wordPoolRef.current) {
      wordPoolRef.current.reset();
    }

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
