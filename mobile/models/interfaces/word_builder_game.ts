export interface IWordBuilderGame {
  currentLetter: string;
  timeLeft: number;
  wordsFound: string[];
  score: number;
  isGameActive: boolean;
  gameMode: "letter" | "syllable";
}

export interface IWordBuilderGameResult {
  wordsFound: string[];
  correctWords: string[];
  incorrectWords: string[];
  score: number;
  totalTime: number;
  gameMode: "letter" | "syllable";
  startingLetter: string;
  language: string;
}

export interface IGameHistory {
  id: string;
  date: string;
  gameMode: "word-builder";
  result: IWordBuilderGameResult;
}
