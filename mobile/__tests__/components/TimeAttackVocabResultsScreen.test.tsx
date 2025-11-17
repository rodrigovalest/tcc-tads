import React from "react";
import { render } from "@testing-library/react-native";
import TimeAttackVocabResultsScreen from "@/components/TimeAttackVocabResultsScreen";
import { useI18n } from "@/hooks/useI18n";
import type { ITimeAttackVocabGameResult } from "@/models/interfaces/time_attack_vocab_game";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/hooks/useI18n");

const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

describe("TimeAttackVocabResultsScreen", () => {
  beforeEach(() => {
    mockUseI18n.mockReturnValue({
      t: (key: string) => key,
    } as any);
  });

  it("renders core stats and buttons", () => {
    const gameResult: ITimeAttackVocabGameResult = {
      wordsTranslated: 10,
      correctTranslations: 7,
      incorrectTranslations: 3,
      evaluations: [
        {
          word: "can",
          userTranslation: "poder",
          correctTranslation: "poder",
          isCorrect: true,
          timeSpent: 1.2,
        },
        {
          word: "bank",
          userTranslation: "banco",
          correctTranslation: "banco",
          isCorrect: true,
          timeSpent: 1.5,
        },
        {
          word: "dog",
          userTranslation: "perro",
          correctTranslation: "perro",
          isCorrect: true,
          timeSpent: 0.9,
        },
      ],
      score: 1200,
      totalTime: 60,
      sourceLanguage: "en",
      targetLanguage: "pt",
      averageTimePerWord: 2.5,
    };

    const client = new QueryClient();
    const { getByText } = render(
      <QueryClientProvider client={client}>
        <TimeAttackVocabResultsScreen
          gameResult={gameResult}
          onPlayAgain={jest.fn()}
          onBackToMenu={jest.fn()}
        />
      </QueryClientProvider>
    );

    expect(getByText("timeAttackVocab.gameOver")).toBeTruthy();
    expect(getByText("timeAttackVocab.finalScore:")).toBeTruthy();
    expect(getByText("timeAttackVocab.wordsTranslated:")).toBeTruthy();
    expect(getByText("timeAttackVocab.correctTranslations:")).toBeTruthy();
    expect(getByText("timeAttackVocab.incorrectTranslations:")).toBeTruthy();
    expect(getByText("timeAttackVocab.avgTimePerWord:")).toBeTruthy();

    expect(getByText("timeAttackVocab.playAgain")).toBeTruthy();
    expect(getByText("timeAttackVocab.backToMenu")).toBeTruthy();
  });
});
