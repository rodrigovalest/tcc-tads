import { renderHook, act } from "@testing-library/react-native";
import { useWordBuilderGame } from "../../hooks/useWordBuilderGame";

// Mock dos serviços
const mockCreateSoloMatch = jest.fn();
const mockCompleteSoloMatch = jest.fn();
const mockValidateWords = jest.fn();

jest.mock("../../services/word-validation", () => ({
  validateWords: mockValidateWords,
}));

jest.mock("../../services/match-service", () => ({
  default: {
    createSoloMatch: mockCreateSoloMatch,
    completeSoloMatch: mockCompleteSoloMatch,
  },
}));

describe("useWordBuilderGame", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockValidateWords.mockResolvedValue([
      { word: "apple", isValid: true },
      { word: "amazing", isValid: true },
    ]);
    
    mockCreateSoloMatch.mockResolvedValue({
      matchId: "test-match-id",
    });
    
    mockCompleteSoloMatch.mockResolvedValue({
      success: true,
    });
  });

  describe("Initialization", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));

      expect(result.current.gameState).toEqual({
        currentLetter: "",
        timeLeft: 60,
        wordsFound: [],
        score: 0,
        isGameActive: false,
        gameMode: "letter",
      });
      expect(result.current.gameResult).toBeNull();
      expect(result.current.isCountingDown).toBe(false);
      expect(result.current.showExitModal).toBe(false);
    });

    it("should use default language when null is provided", () => {
      const { result } = renderHook(() => useWordBuilderGame(null));
      
      act(() => {
        result.current.initializeGame();
      });

      expect(result.current.gameState.currentLetter).toMatch(/^[A-Z]$/);
      expect(result.current.isCountingDown).toBe(true);
    });
  });

  describe("Game initialization", () => {
    it("should initialize game with random letter and countdown", () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));

      act(() => {
        result.current.initializeGame();
      });

      expect(result.current.gameState.currentLetter).toMatch(/^[A-Z]$/);
      expect(result.current.gameState.timeLeft).toBe(60);
      expect(result.current.gameState.wordsFound).toEqual([]);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.isGameActive).toBe(false);
      expect(result.current.isCountingDown).toBe(true);
      expect(result.current.gameResult).toBeNull();
      expect(result.current.showExitModal).toBe(false);
    });
  });

  describe("Word adding", () => {
    it("should add valid words to the game", async () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));
      
      act(() => {
        result.current.initializeGame();
      });

      await act(async () => {
        await result.current.startGame();
      });

      act(() => {
        result.current.addWord("apple");
        result.current.addWord("amazing");
      });

      expect(result.current.gameState.wordsFound).toEqual(["apple", "amazing"]);
    });

    it("should ignore duplicate words", async () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));
      
      act(() => {
        result.current.initializeGame();
      });

      await act(async () => {
        await result.current.startGame();
      });

      act(() => {
        result.current.addWord("apple");
        result.current.addWord("apple"); // duplicate
        result.current.addWord("APPLE"); // case insensitive duplicate
      });

      expect(result.current.gameState.wordsFound).toEqual(["apple"]);
    });

    it("should not add words when game is not active", () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));

      act(() => {
        result.current.addWord("apple");
      });

      expect(result.current.gameState.wordsFound).toEqual([]);
    });
  });

  describe("Exit modal functionality", () => {
    it("should show exit modal when handleExitGame is called", () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));

      act(() => {
        result.current.handleExitGame();
      });

      expect(result.current.showExitModal).toBe(true);
    });

    it("should hide exit modal when cancelExitGame is called", () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));

      act(() => {
        result.current.handleExitGame();
      });

      expect(result.current.showExitModal).toBe(true);

      act(() => {
        result.current.cancelExitGame();
      });

      expect(result.current.showExitModal).toBe(false);
    });
  });

  describe("Reset functionality", () => {
    it("should reset all game state", () => {
      const { result } = renderHook(() => useWordBuilderGame("en"));
      
      act(() => {
        result.current.initializeGame();
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState).toEqual({
        currentLetter: "",
        timeLeft: 60,
        wordsFound: [],
        score: 0,
        isGameActive: false,
        gameMode: "letter",
      });
      expect(result.current.gameResult).toBeNull();
      expect(result.current.isCountingDown).toBe(false);
      expect(result.current.showExitModal).toBe(false);
    });
  });
});
