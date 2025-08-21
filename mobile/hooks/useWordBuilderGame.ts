import { useState, useEffect, useRef, useCallback } from "react";
import {
  IWordBuilderGame,
  IWordBuilderGameResult,
  IWordEvaluation,
} from "../models/interfaces/word_builder_game";
import { MatchLanguage } from "../models/types/match-language.type";
import { validateWords } from "../services/word-validation";

const GAME_DURATION = 60; // seconds
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const useWordBuilderGame = (language: MatchLanguage | null) => {
  const safeLanguage: MatchLanguage = (language || "en") as MatchLanguage;

  // React state (UI binding)
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

  // Refs (fonte de verdade para lógica / timers)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);
  const endedRef = useRef<boolean>(false);
  const wordsRef = useRef<string[]>([]); // evita closures antigas
  const letterRef = useRef<string>("");

  /* Util */
  const generateRandomLetter = useCallback(() => {
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }, []);

  /* Inicialização */
  const initializeGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    endedRef.current = false;
    wordsRef.current = [];
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

  /* Encerrar jogo (usa refs) */
  const finalizeGame = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const snapshotWords = [...wordsRef.current];
    const startingLetter = letterRef.current;

    console.log("[end] Letter:", startingLetter, "Words:", snapshotWords);

    // Validação por dicionário (retorna apenas isValid lexical)
    const dictEvaluations = await validateWords(snapshotWords, safeLanguage);

    // Regras adicionais: começa com a letra + tamanho >=3
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

    const result: IWordBuilderGameResult = {
      wordsFound: snapshotWords,
      correctWords,
      incorrectWords,
      evaluations,
      score,
      totalTime: GAME_DURATION,
      gameMode: gameState.gameMode,
      startingLetter,
      language: safeLanguage,
    };

    console.log("[end] Result:", result);
    setGameResult(result);
    setGameState((prev) => ({ ...prev, isGameActive: false, score }));
  }, [gameState.gameMode, safeLanguage]);

  /* Start após contagem */
  const startGame = useCallback(() => {
    setIsCountingDown(false);
    setGameState((prev) => ({
      ...prev,
      isGameActive: true,
      timeLeft: GAME_DURATION,
    }));
    endTimeRef.current = Date.now() + GAME_DURATION * 1000;
    endedRef.current = false;

    timerRef.current = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      if (remainingMs <= 0) {
        setGameState((prev) => ({ ...prev, timeLeft: 0 }));
        finalizeGame();
        return;
      }
      setGameState((prev) => ({ ...prev, timeLeft: remainingMs / 1000 }));
    }, 100);
  }, [finalizeGame]);

  /* Adicionar palavra */
  const addWord = useCallback(
    (word: string) => {
      if (endedRef.current) return;
      if (!gameState.isGameActive) return;
      const clean = word.toLowerCase().trim();
      if (!clean) return;
      if (clean.length < 2) return; // pequena filtragem
      if (wordsRef.current.includes(clean)) return; // evitar duplicatas

      wordsRef.current = [...wordsRef.current, clean];
      setGameState((prev) => ({ ...prev, wordsFound: wordsRef.current }));
      console.log("[addWord]", clean, wordsRef.current);
    },
    [gameState.isGameActive]
  );

  /* Encerrar antecipadamente */
  const endGame = useCallback(() => {
    finalizeGame();
  }, [finalizeGame]);

  /* Modal de saída */
  const handleExitGame = useCallback(() => setShowExitModal(true), []);
  const confirmExitGame = useCallback(() => finalizeGame(), [finalizeGame]);
  const cancelExitGame = useCallback(() => setShowExitModal(false), []);

  /* Reset completo (ex: unmount) */
  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    endedRef.current = false;
    wordsRef.current = [];
    letterRef.current = "";
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

  /* Atualizar currentLetter visual se letterRef mudar (apenas inicialização) */
  useEffect(() => {
    setGameState((prev) => ({ ...prev, currentLetter: letterRef.current }));
  }, [isCountingDown]);

  /* Cleanup */
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
