import { useState, useEffect, useRef, useCallback } from "react";
import {
  ITimeAttackVocabGame,
  ITimeAttackGameResult,
  ITimeAttackAnswer,
} from "../models/interfaces/time_attack_vocab_game";
import { MatchLanguage } from "../models/types/match-language.type";
import translationService from "../services/translation-service";
import matchService from "../services/match-service";

const GAME_DURATION = 60;

export const useTimeAttackVocabGame = (
  targetLanguage: MatchLanguage | null
) => {
  const safeTargetLanguage: MatchLanguage = (targetLanguage ||
    "pt") as MatchLanguage;

  const [currentFromLanguage, setCurrentFromLanguage] =
    useState<MatchLanguage>("en");

  const getRandomFromLanguage = (): MatchLanguage => {
    const availableLanguages: MatchLanguage[] = ["en", "pt", "es"];
    const possibleSources = availableLanguages.filter(
      (lang) => lang !== safeTargetLanguage
    );
    return possibleSources[Math.floor(Math.random() * possibleSources.length)];
  };

  const [gameState, setGameState] = useState<ITimeAttackVocabGame>({
    currentWord: "",
    currentTranslation: "",
    fromLanguage: "en",
    toLanguage: safeTargetLanguage,
    timeLeft: GAME_DURATION,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalAnswers: 0,
    score: 0,
    isGameActive: false,
    streak: 0,
    bestStreak: 0,
  });

  const [gameResult, setGameResult] = useState<ITimeAttackGameResult | null>(
    null
  );
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const endedRef = useRef<boolean>(false);
  const answersRef = useRef<ITimeAttackAnswer[]>([]);
  const matchIdRef = useRef<string | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  const generateNewWord = useCallback(
    (fromLang?: MatchLanguage) => {
      const sourceLanguage = fromLang || currentFromLanguage;
      const word = translationService.getRandomWord(sourceLanguage);
      const translation = translationService.getTranslation(
        word,
        sourceLanguage,
        safeTargetLanguage
      );

      return {
        word,
        translation: translation || "",
        fromLanguage: sourceLanguage,
      };
    },
    [currentFromLanguage, safeTargetLanguage]
  );

  const initializeGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    endedRef.current = false;
    answersRef.current = [];
    matchIdRef.current = null;
    startTimeRef.current = 0;

    // Set a fixed from language for this game session
    const newFromLanguage = getRandomFromLanguage();
    setCurrentFromLanguage(newFromLanguage);

    const firstWord = generateNewWord(newFromLanguage);
    const word = firstWord.word;
    const translation = firstWord.translation;

    setGameResult(null);
    setShowExitModal(false);
    setIsCountingDown(true);
    setGameState({
      currentWord: word,
      currentTranslation: translation || "",
      fromLanguage: newFromLanguage,
      toLanguage: safeTargetLanguage,
      timeLeft: GAME_DURATION,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalAnswers: 0,
      score: 0,
      isGameActive: false,
      streak: 0,
      bestStreak: 0,
    });
  }, [safeTargetLanguage]);

  const finalizeGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const snapshotAnswers = [...answersRef.current];
    const actualTimePlayed =
      startTimeRef.current > 0
        ? Math.max(
            0,
            Math.min(GAME_DURATION, (Date.now() - startTimeRef.current) / 1000)
          )
        : GAME_DURATION;

    const correctCount = snapshotAnswers.filter((a) => a.isCorrect).length;
    const incorrectCount = snapshotAnswers.filter((a) => !a.isCorrect).length;
    const totalAnswers = snapshotAnswers.length;
    const accuracy = totalAnswers > 0 ? (correctCount / totalAnswers) * 100 : 0;
    const averageTime =
      totalAnswers > 0
        ? snapshotAnswers.reduce((sum, a) => sum + a.timeSpent, 0) /
          totalAnswers
        : 0;

    const result: ITimeAttackGameResult = {
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      totalAnswers,
      score: correctCount * 10,
      totalTime: actualTimePlayed,
      averageTimePerAnswer: averageTime,
      accuracy,
      bestStreak: gameState.bestStreak,
      answers: snapshotAnswers,
      fromLanguage: gameState.fromLanguage,
      toLanguage: safeTargetLanguage,
    };

    setGameResult(result);
    setGameState((prev) => ({ ...prev, isGameActive: false }));

    if (matchIdRef.current) {
      try {
        await matchService.completeSoloMatch(matchIdRef.current);
      } catch (error) {
        console.error("Failed to complete match:", error);
      }
    }
  }, [gameState.bestStreak, gameState.fromLanguage, safeTargetLanguage]);

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
    endedRef.current = false;
    questionStartTimeRef.current = currentTime;

    try {
      const response = await matchService.createSoloMatch(
        "time-attack-vocab",
        safeTargetLanguage
      );
      matchIdRef.current = response.matchId;
    } catch (error) {
      console.error("Failed to create match:", error);
    }

    timerRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      if (remainingMs <= 0) {
        setGameState((prev) => ({ ...prev, timeLeft: 0 }));
        finalizeGame();
        return;
      }
      const timeLeftSeconds = Math.max(0, remainingMs / 1000);
      setGameState((prev) => ({
        ...prev,
        timeLeft: timeLeftSeconds,
      }));
    }, 100);
  }, [finalizeGame, safeTargetLanguage]);

  const submitAnswer = useCallback(
    (userAnswer: string) => {
      if (!gameState.isGameActive || endedRef.current) return;

      const currentTime = Date.now();
      const timeSpent = (currentTime - questionStartTimeRef.current) / 1000;

      const isCorrect = translationService.validateTranslation(
        gameState.currentWord,
        userAnswer,
        gameState.fromLanguage,
        safeTargetLanguage
      );
      const answer: ITimeAttackAnswer = {
        originalWord: gameState.currentWord,
        userAnswer,
        correctAnswer: gameState.currentTranslation,
        isCorrect,
        timeSpent,
      };

      answersRef.current.push(answer);

      const newStreak = isCorrect ? gameState.streak + 1 : 0;
      const newBestStreak = Math.max(gameState.bestStreak, newStreak);

      setGameState((prev) => {
        const newCorrect = prev.correctAnswers + (isCorrect ? 1 : 0);
        const newIncorrect = prev.incorrectAnswers + (isCorrect ? 0 : 1);
        const newTotal = prev.totalAnswers + 1;
        const newScore = newCorrect * 10 + newStreak * 2; // Bonus for streaks

        return {
          ...prev,
          correctAnswers: newCorrect,
          incorrectAnswers: newIncorrect,
          totalAnswers: newTotal,
          score: newScore,
          streak: newStreak,
          bestStreak: newBestStreak,
        };
      });

      // Generate next word
      setTimeout(() => {
        if (!endedRef.current) {
          const { word, translation, fromLanguage } = generateNewWord();
          setGameState((prev) => ({
            ...prev,
            currentWord: word,
            currentTranslation: translation,
            fromLanguage,
          }));
          questionStartTimeRef.current = Date.now();
        }
      }, 500); // Brief pause to show result
    },
    [
      gameState.isGameActive,
      gameState.currentWord,
      gameState.streak,
      gameState.bestStreak,
      gameState.fromLanguage,
      safeTargetLanguage,
      generateNewWord,
    ]
  );

  const handleExitGame = useCallback(() => {
    if (gameState.isGameActive) {
      setShowExitModal(true);
    }
  }, [gameState.isGameActive]);

  const confirmExitGame = useCallback(async () => {
    setShowExitModal(false);
    await finalizeGame();
  }, [finalizeGame]);

  const cancelExitGame = useCallback(() => {
    setShowExitModal(false);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    endedRef.current = true;
  }, []);

  useEffect(() => {
    return () => {
      resetGame();
    };
  }, [resetGame]);

  return {
    gameState,
    gameResult,
    isCountingDown,
    showExitModal,
    initializeGame,
    startGame,
    submitAnswer,
    handleExitGame,
    confirmExitGame,
    cancelExitGame,
    resetGame,
  };
};
