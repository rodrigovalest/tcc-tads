import { MatchLanguage } from "../types/match-language.type";

export interface ITimeAttackVocabGame {
  currentWord: string;
  currentTranslation: string;
  fromLanguage: MatchLanguage;
  toLanguage: MatchLanguage;
  timeLeft: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalAnswers: number;
  score: number;
  isGameActive: boolean;
  streak: number;
  bestStreak: number;
}

export interface ITimeAttackAnswer {
  originalWord: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface ITimeAttackGameResult {
  correctAnswers: number;
  incorrectAnswers: number;
  totalAnswers: number;
  score: number;
  totalTime: number;
  averageTimePerAnswer: number;
  accuracy: number;
  bestStreak: number;
  answers: ITimeAttackAnswer[];
  fromLanguage: MatchLanguage;
  toLanguage: MatchLanguage;
}
