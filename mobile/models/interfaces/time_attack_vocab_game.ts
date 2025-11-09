import { MatchLanguage } from "../types/match-language.type";

export interface ITimeAttackVocabGame {
  currentWord: string;
  timeLeft: number;
  wordsTranslated: number;
  score: number;
  isGameActive: boolean;
  sourceLanguage: MatchLanguage;
  targetLanguage: MatchLanguage;
}

export interface IWordTranslationEvaluation {
  word: string;
  userTranslation: string;
  correctTranslation: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface ITimeAttackVocabGameResult {
  wordsTranslated: number;
  correctTranslations: number;
  incorrectTranslations: number;
  evaluations: IWordTranslationEvaluation[];
  score: number;
  totalTime: number;
  sourceLanguage: MatchLanguage;
  targetLanguage: MatchLanguage;
  averageTimePerWord: number;
}

export interface ITimeAttackVocabHistory {
  id: string;
  date: string;
  gameMode: "time-attack-vocab";
  result: ITimeAttackVocabGameResult;
}
