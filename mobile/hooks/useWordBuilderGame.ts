import { useState, useEffect, useRef, useCallback } from "react";
import {
  IWordBuilderGame,
  IWordBuilderGameResult,
} from "../models/interfaces/word_builder_game";
import { MatchLanguage } from "../models/types/match-language.type";

const GAME_DURATION = 60; // seconds
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Mock word validation function - In production, use a real API
const validateWord = async (
  word: string,
  language: MatchLanguage,
  startingLetter: string
): Promise<boolean> => {
  // Mock validation logic
  // For now, we'll accept words that:
  // 1. Start with the correct letter
  // 2. Are at least 3 characters long
  // 3. Don't contain numbers or special characters

  const cleanWord = word.toLowerCase().trim();
  const letterLower = startingLetter.toLowerCase();
  if (cleanWord.length < 3) return false;
  if (!cleanWord.startsWith(letterLower)) return false;
  if (!/^[a-zA-ZáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ]+$/.test(cleanWord))
    return false;

  // Mock dictionary check based on language
  const mockDictionary = {
    en: [
      "apple",
      "about",
      "animal",
      "answer",
      "always",
      "another",
      "after",
      "again",
      "against",
      "all",
    ],
    pt: [
      "amor",
      "animal",
      "amigo",
      "água",
      "azul",
      "alto",
      "antes",
      "aqui",
      "ainda",
      "apenas",
    ],
    es: [
      "amor",
      "animal",
      "amigo",
      "agua",
      "azul",
      "alto",
      "antes",
      "aquí",
      "aún",
      "apenas",
    ],
  };
  const dictionary = mockDictionary[language] || mockDictionary.en;
  return dictionary.includes(cleanWord) || cleanWord.length >= 4;
};

export const useWordBuilderGame = (language: MatchLanguage | null) => {
  const safeLanguage: MatchLanguage = (language || "en") as MatchLanguage;
  const [gameState, setGameState] = useState<IWordBuilderGame>({
    currentLetter: "",
    timeLeft: GAME_DURATION, // seconds (float)
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
  const endTimeRef = useRef<number>(0); // timestamp in ms when game ends
  const endedRef = useRef<boolean>(false);

  const generateRandomLetter = useCallback((): string => {
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }, []);

  const initializeGame = useCallback(() => {
    endedRef.current = false;
    const letter = generateRandomLetter();
    setGameState({
      currentLetter: letter,
      timeLeft: GAME_DURATION,
      wordsFound: [],
      score: 0,
      isGameActive: false,
      gameMode: "letter",
    });
    setGameResult(null);
    setIsCountingDown(true);
    setShowExitModal(false);
  }, [generateRandomLetter]);

  const internalEndGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameState((prev) => ({ ...prev, isGameActive: false, timeLeft: 0 }));

    // Validate words
    const correctWords: string[] = [];
    const incorrectWords: string[] = [];
    for (const word of gameState.wordsFound) {
      const isValid = await validateWord(
        word,
        safeLanguage,
        gameState.currentLetter
      );
      if (isValid) correctWords.push(word);
      else incorrectWords.push(word);
    }
    const finalScore = correctWords.length * 10;
    const totalTime = GAME_DURATION; // full duration
    const result: IWordBuilderGameResult = {
      wordsFound: gameState.wordsFound,
      correctWords,
      incorrectWords,
      score: finalScore,
      totalTime,
      gameMode: gameState.gameMode,
      startingLetter: gameState.currentLetter,
      language: safeLanguage,
    };
    setGameResult(result);
    console.log("Mock: Saving game result to history:", result); // mock persistence
  }, [gameState, safeLanguage]);

  const startGame = useCallback(() => {
    setIsCountingDown(false);
    setGameState((prev) => ({
      ...prev,
      isGameActive: true,
      timeLeft: GAME_DURATION,
    }));
    endTimeRef.current = Date.now() + GAME_DURATION * 1000;

    timerRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      if (remainingMs <= 0) {
        setGameState((prev) => ({ ...prev, timeLeft: 0 }));
        internalEndGame();
        return;
      }
      // keep two decimals (centiseconds)
      const remainingSec = Math.max(0, remainingMs / 1000);
      setGameState((prev) => ({ ...prev, timeLeft: remainingSec }));
    }, 100);
  }, [internalEndGame]);

  const endGame = useCallback(() => {
    internalEndGame();
  }, [internalEndGame]);

  const addWord = useCallback(
    (word: string) => {
      if (!gameState.isGameActive || endedRef.current) return;
      const cleanWord = word.toLowerCase().trim();
      if (!cleanWord) return;
      if (gameState.wordsFound.includes(cleanWord)) return;
      setGameState((prev) => ({
        ...prev,
        wordsFound: [...prev.wordsFound, cleanWord],
      }));
    },
    [gameState.isGameActive, gameState.wordsFound]
  );

  const handleExitGame = useCallback(() => {
    setShowExitModal(true);
  }, []);
  const confirmExitGame = useCallback(() => {
    endGame();
  }, [endGame]);
  const cancelExitGame = useCallback(() => {
    setShowExitModal(false);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    endedRef.current = false;
    setGameState({
      currentLetter: "",
      timeLeft: GAME_DURATION,
      wordsFound: [],
      score: 0,
      isGameActive: false,
      gameMode: "letter",
    });
    setGameResult(null);
    setIsCountingDown(false);
    setShowExitModal(false);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    []
  );

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
