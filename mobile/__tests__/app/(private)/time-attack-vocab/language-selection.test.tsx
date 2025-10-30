import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import TimeAttackVocabLanguageSelection from "@/app/(private)/time-attack-vocab/language-selection";
import useTimeAttackVocabStore from "@/store/time-attack-vocab-store";
import { useRouter } from "expo-router";
import { useI18n } from "@/hooks/useI18n";

// Mocks
jest.mock("@/store/time-attack-vocab-store");
jest.mock("expo-router");
jest.mock("@/hooks/useI18n");
jest.mock("@/components/MatchLanguageSelector", () => () => null);
jest.mock("@/components/InputModeSelector", () => () => null);
jest.mock("@/components/VocabularyLevelSelector", () => () => null);
jest.mock("react-native-toast-message", () => ({
  default: {
    show: jest.fn(),
  },
}));

const mockUseStore = useTimeAttackVocabStore as jest.MockedFunction<
  typeof useTimeAttackVocabStore
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

describe("TimeAttackVocab language-selection", () => {
  const mockNavigate = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      navigate: mockNavigate,
      back: mockBack,
    } as any);

    mockUseI18n.mockReturnValue({
      t: (key: string) => key,
    } as any);
  });

  it("redirects to global language selection when sourceLanguage is missing", () => {
    mockUseStore.mockReturnValue({
      sourceLanguage: null,
      targetLanguage: null,
      inputMode: null,
      level: null,
      setTargetLanguage: jest.fn(),
      setInputMode: jest.fn(),
      setLevel: jest.fn(),
      resetTimeAttackVocab: jest.fn(),
    } as any);

    const { toJSON } = render(<TimeAttackVocabLanguageSelection />);
    // Component renders null when redirecting
    expect(toJSON()).toBeNull();
  });

  it("renders setup title and play button when sourceLanguage is set", () => {
    mockUseStore.mockReturnValue({
      sourceLanguage: "en",
      targetLanguage: null,
      inputMode: null,
      level: "basic",
      setTargetLanguage: jest.fn(),
      setInputMode: jest.fn(),
      setLevel: jest.fn(),
      resetTimeAttackVocab: jest.fn(),
    } as any);

    const { getByText } = render(<TimeAttackVocabLanguageSelection />);
    expect(getByText("timeAttackVocab.setup")).toBeTruthy();
    expect(getByText("common.play")).toBeTruthy();
  });

  it("navigates to game when all selections are made and Play is pressed", async () => {
    mockUseStore.mockReturnValue({
      sourceLanguage: "en",
      targetLanguage: "pt",
      inputMode: "typing",
      level: "basic",
      setTargetLanguage: jest.fn(),
      setInputMode: jest.fn(),
      setLevel: jest.fn(),
      resetTimeAttackVocab: jest.fn(),
    } as any);

    const { getByText } = render(<TimeAttackVocabLanguageSelection />);
    const play = getByText("common.play");
    fireEvent.press(play);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/time-attack-vocab/solo/game");
    });
  });
});
