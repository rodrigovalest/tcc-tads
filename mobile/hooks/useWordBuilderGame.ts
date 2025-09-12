import { useState, useEffect, useRef, useCallback } from "react";
import {
  IWordBuilderGame,
  IWordBuilderGameResult,
  IWordEvaluation,
} from "../models/interfaces/word_builder_game";
import { MatchLanguage } from "../models/types/match-language.type";
import { validateWords } from "../services/word-validation";
import matchService from "../services/match-service";

const GAME_DURATION = 60;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const useWordBuilderGame = (language: MatchLanguage | null) => {
  const safeLanguage: MatchLanguage = (language || "en") as MatchLanguage;

  const [gameState, setGameState] = useState<IWordBuilderGame>({
    currentLetter: "",
    timeLeft: GAME_DURATION,
    wordsFound: [],
    score: 0,
    isGameActive: false,
    gameMode: "letter",
  });
  const [gameResult, setGameResult] = useState<IWordBuilderGameResult | null>(
    null
  );
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const endedRef = useRef<boolean>(false);
  const wordsRef = useRef<string[]>([]);
  const letterRef = useRef<string>("");
  const matchIdRef = useRef<string | null>(null);

  const generateRandomLetter = useCallback(() => {
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }, []);

  const initializeGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    endedRef.current = false;
    wordsRef.current = [];
    matchIdRef.current = null;
    startTimeRef.current = 0;
    const newLetter = generateRandomLetter();
    letterRef.current = newLetter;
    setGameResult(null);
    setShowExitModal(false);
    setIsCountingDown(true);
    setGameState({
      currentLetter: newLetter,
      timeLeft: GAME_DURATION,
      wordsFound: [],
      score: 0,
      isGameActive: false,
      gameMode: "letter",
    });
  }, [generateRandomLetter]);

  const finalizeGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const snapshotWords = [...wordsRef.current];
    const startingLetter = letterRef.current;

    const dictEvaluations = await validateWords(snapshotWords, safeLanguage);

    const letterLower = startingLetter.toLowerCase();
    const evaluations: IWordEvaluation[] = dictEvaluations.map(
      (w: { word: string; isValid: boolean }) => {
        const startsWith = w.word.startsWith(letterLower);
        const minLen = w.word.length >= 3;
        return { word: w.word, isCorrect: startsWith && minLen && w.isValid };
      }
    );

    const correctWords = evaluations
      .filter((e) => e.isCorrect)
      .map((e) => e.word);
    const incorrectWords = evaluations
      .filter((e) => !e.isCorrect)
      .map((e) => e.word);
    const score = correctWords.length * 10;

    const actualTimePlayed =
      startTimeRef.current > 0
        ? Math.max(
            0,
            Math.min(GAME_DURATION, (Date.now() - startTimeRef.current) / 1000)
          )
        : GAME_DURATION;

    const result: IWordBuilderGameResult = {
      wordsFound: snapshotWords,
      correctWords,
      incorrectWords,
      evaluations,
      score,
      totalTime: actualTimePlayed,
      gameMode: gameState.gameMode,
      startingLetter,
      language: safeLanguage,
    };

    setGameResult(result);
    setGameState((prev) => ({ ...prev, isGameActive: false, score }));

    if (matchIdRef.current) {
      try {
        await matchService.completeSoloMatch(matchIdRef.current);
      } catch (error) {
        console.error("Failed to complete match:", error);
      }
    }
  }, [gameState.gameMode, safeLanguage]);

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

    try {
      const response = await matchService.createSoloMatch(
        "word-builder",
        safeLanguage
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
      setGameState((prev) => ({ ...prev, timeLeft: timeLeftSeconds }));
    }, 100);
  }, [finalizeGame, safeLanguage]);

  const addWord = useCallback(
    (word: string) => {
      if (endedRef.current) return;
      if (!gameState.isGameActive) return;
      const clean = word.toLowerCase().trim();
      if (!clean) return;
      if (clean.length < 2) return;
      if (wordsRef.current.includes(clean)) return;

      wordsRef.current = [...wordsRef.current, clean];
      setGameState((prev) => ({ ...prev, wordsFound: wordsRef.current }));
    },
    [gameState.isGameActive]
  );

  const endGame = useCallback(() => {
    finalizeGame();
  }, [finalizeGame]);

  const handleExitGame = useCallback(() => setShowExitModal(true), []);
  const confirmExitGame = useCallback(() => finalizeGame(), [finalizeGame]);
  const cancelExitGame = useCallback(() => setShowExitModal(false), []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    endedRef.current = false;
    wordsRef.current = [];
    letterRef.current = "";
    matchIdRef.current = null;
    startTimeRef.current = 0;
    setGameResult(null);
    setIsCountingDown(false);
    setShowExitModal(false);
    setGameState({
      currentLetter: "",
      timeLeft: GAME_DURATION,
      wordsFound: [],
      score: 0,
      isGameActive: false,
      gameMode: "letter",
    });
  }, []);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, currentLetter: letterRef.current }));
  }, [isCountingDown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    gameState,
    gameResult,
    isCountingDown,
    showExitModal,
    initializeGame,
    startGame,
    endGame,
    addWord,
    handleExitGame,
    confirmExitGame,
    cancelExitGame,
    resetGame,
  };
};
