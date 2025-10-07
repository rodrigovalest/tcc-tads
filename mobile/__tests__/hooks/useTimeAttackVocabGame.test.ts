import { renderHook, act } from "@testing-library/react-native";
import { useTimeAttackVocabGame } from "../../hooks/useTimeAttackVocabGame";

// Mock the services
const mockCreateSoloMatch = jest.fn();
const mockCompleteSoloMatch = jest.fn();
const mockGetRandomWord = jest.fn(() => "hello");
const mockGetTranslation = jest.fn(() => "olá");
const mockValidateTranslation = jest.fn(
  (word, answer) => answer.toLowerCase() === "olá"
);

jest.mock("../../services/match-service", () => ({
  default: {
    createSoloMatch: mockCreateSoloMatch,
    completeSoloMatch: mockCompleteSoloMatch,
  },
}));

jest.mock("../../services/translation-service", () => ({
  __esModule: true,
  default: {
    getRandomWord: mockGetRandomWord,
    getTranslation: mockGetTranslation,
    validateTranslation: mockValidateTranslation,
  },
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
    mockGetRandomWord.mockReturnValue("hello");
    mockGetTranslation.mockReturnValue("olá");
    mockValidateTranslation.mockImplementation(
      (word, answer) => answer.toLowerCase() === "olá"
    );
  });

  describe("Initialization", () => {
    it("should initialize game with correct initial state", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      expect(result.current.gameState.isGameActive).toBe(false);
      expect(result.current.gameState.correctAnswers).toBe(0);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.isCountingDown).toBe(false);
      expect(result.current.gameState.timeLeft).toBe(60);
    });

    it("should initialize game when initializeGame is called", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      act(() => {
        result.current.initializeGame();
      });

      expect(result.current.isCountingDown).toBe(true);
      expect(result.current.gameState.currentWord).toBe("hello");
      expect(result.current.gameState.currentTranslation).toBe("olá");
    });

    it("should set fixed fromLanguage for game session", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      act(() => {
        result.current.initializeGame();
      });

      const initialFromLanguage = result.current.gameState.fromLanguage;
      expect(["en", "es"]).toContain(initialFromLanguage);

      // After multiple word generations, fromLanguage should remain the same
      act(() => {
        result.current.startGame();
      });

      act(() => {
        result.current.submitAnswer("olá");
      });

      expect(result.current.gameState.fromLanguage).toBe(initialFromLanguage);
    });
  });

  describe("Answer submission", () => {
    it("should handle correct answers and update score", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

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
      expect(result.current.gameState.bestStreak).toBe(1);
    });

    it("should handle incorrect answers and reset streak", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      act(() => {
        result.current.initializeGame();
      });

      act(() => {
        result.current.startGame();
      });

      // First correct answer to build streak
      act(() => {
        result.current.submitAnswer("olá");
      });

      // Then wrong answer
      act(() => {
        result.current.submitAnswer("wrong");
      });

      expect(result.current.gameState.incorrectAnswers).toBe(1);
      expect(result.current.gameState.streak).toBe(0);
      expect(result.current.gameState.bestStreak).toBe(1); // Should maintain best streak
    });

    it("should calculate bonus points for streaks", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      act(() => {
        result.current.initializeGame();
      });

      act(() => {
        result.current.startGame();
      });

      // First correct answer (base 10 points)
      act(() => {
        result.current.submitAnswer("olá");
      });

      expect(result.current.gameState.score).toBe(10);
      expect(result.current.gameState.streak).toBe(1);

      // Second correct answer (10 + 1 bonus = 11 points)
      act(() => {
        result.current.submitAnswer("olá");
      });

      expect(result.current.gameState.score).toBe(21);
      expect(result.current.gameState.streak).toBe(2);
    });
  });

  describe("Game lifecycle", () => {
    it("should create match when game starts", async () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      act(() => {
        result.current.initializeGame();
      });

      await act(async () => {
        await result.current.startGame();
      });

      expect(mockCreateSoloMatch).toHaveBeenCalledWith(
        "time-attack-vocab",
        expect.any(String)
      );
    });

    it("should handle exit game flow", () => {
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      act(() => {
        result.current.initializeGame();
      });

      act(() => {
        result.current.startGame();
      });

      // Test exit modal
      act(() => {
        result.current.handleExitGame();
      });

      expect(result.current.showExitModal).toBe(true);

      // Test confirm exit
      act(() => {
        result.current.confirmExitGame();
      });

      expect(result.current.gameState.isGameActive).toBe(false);
      expect(result.current.gameResult).not.toBeNull();
    });
  });

  describe("Timer functionality", () => {
    it("should update timer with millisecond precision", () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useTimeAttackVocabGame("pt"));

      act(() => {
        result.current.initializeGame();
      });

      act(() => {
        result.current.startGame();
      });

      const initialTime = result.current.gameState.timeLeft;

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Time should decrease by approximately 0.1 seconds (100ms)
      expect(result.current.gameState.timeLeft).toBeLessThan(initialTime);

      jest.useRealTimers();
    });
  });
});
