import { renderHook, act } from "@testing-library/react-native";
import { useTimeAttackVocabGame } from "../../hooks/useTimeAttackVocabGame";

// Mock the services
const mockCreateSoloMatch = jest.fn();
const mockCompleteSoloMatch = jest.fn();

jest.mock("../../services/match-service", () => ({
  default: {
    createSoloMatch: mockCreateSoloMatch,
    completeSoloMatch: mockCompleteSoloMatch,
  },
}));

jest.mock("../../services/translation-service", () => ({
  getRandomWord: jest.fn(() => "hello"),
  getTranslation: jest.fn(() => "olá"),
  validateTranslation: jest.fn(
    (word, answer) => answer.toLowerCase() === "olá"
  ),
}));

describe("useTimeAttackVocabGame", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSoloMatch.mockResolvedValue({
      matchId: "test-match-id",
    });
    mockCompleteSoloMatch.mockResolvedValue({
      success: true,
    });
  });

  describe("Initialization", () => {
    it("should initialize game with correct initial state", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("en", "pt"));

      expect(result.current.gameState.fromLanguage).toBe("en");
      expect(result.current.gameState.toLanguage).toBe("pt");
      expect(result.current.gameState.isGameActive).toBe(false);
      expect(result.current.gameState.correctAnswers).toBe(0);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.isCountingDown).toBe(false);
    });

    it("should initialize game when initializeGame is called", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("en", "pt"));

      act(() => {
        result.current.initializeGame();
      });

      expect(result.current.isCountingDown).toBe(true);
      expect(result.current.gameState.currentWord).toBe("hello");
      expect(result.current.gameState.currentTranslation).toBe("olá");
    });
  });

  describe("Answer submission", () => {
    it("should handle correct answers", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("en", "pt"));

      act(() => {
        result.current.initializeGame();
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.submitAnswer("olá");
      });

      expect(result.current.gameState.correctAnswers).toBe(1);
      expect(result.current.gameState.score).toBe(10);
      expect(result.current.gameState.streak).toBe(1);
    });

    it("should handle incorrect answers", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("en", "pt"));

      act(() => {
        result.current.initializeGame();
      });

      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.submitAnswer("wrong");
      });

      expect(result.current.gameState.incorrectAnswers).toBe(1);
      expect(result.current.gameState.streak).toBe(0);
    });
  });

  describe("Game lifecycle", () => {
    it("should create match when game starts", async () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("en", "pt"));

      act(() => {
        result.current.initializeGame();
      });

      await act(async () => {
        await result.current.startGame();
      });

      expect(mockCreateSoloMatch).toHaveBeenCalledWith(
        "time-attack-vocab",
        "en"
      );
    });
  });
});
