import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GameScreen from "../../../../app/(private)/time-attack-vocab/game";

// Mock navigation and route
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRoute = {
  params: {
    targetLanguage: "pt",
    inputMode: "text",
  },
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

// Mock the game hook
const mockGameHook = {
  gameState: {
    currentWord: "hello",
    currentTranslation: "olá",
    fromLanguage: "en" as const,
    toLanguage: "pt" as const,
    timeLeft: 45.5,
    correctAnswers: 5,
    incorrectAnswers: 2,
    totalAnswers: 7,
    score: 60,
    streak: 2,
    bestStreak: 4,
    isGameActive: true,
  },
  gameResult: null as any,
  isCountingDown: false,
  showExitModal: false,
  initializeGame: jest.fn(),
  startGame: jest.fn(),
  submitAnswer: jest.fn(),
  handleExitGame: jest.fn(),
  confirmExitGame: jest.fn(),
  cancelExitGame: jest.fn(),
  resetGame: jest.fn(),
};

jest.mock("../../../../hooks/useTimeAttackVocabGame", () => ({
  useTimeAttackVocabGame: () => mockGameHook,
}));

// Mock language utility
jest.mock("../../../../utils/language-utils", () => ({
  getMatchLanguageInfo: jest.fn((lang) => ({
    name: lang === "en" ? "English" : lang === "pt" ? "Portuguese" : "Spanish",
  })),
}));

// Mock useI18n hook
const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    "timeAttackVocab.from": "From",
    "timeAttackVocab.to": "to",
    "timeAttackVocab.playAgain": "Play Again",
    "timeAttackVocab.backToMenu": "Back to Menu",
    "common.exit": "Exit",
    "common.cancel": "Cancel",
  };
  return translations[key] || key;
});

jest.mock("../../../../hooks/useI18n", () => ({
  __esModule: true,
  default: () => ({
    t: mockT,
  }),
}));

// Mock components
jest.mock("../../../../components/GameHeader", () => {
  const { View, Text } = require("react-native");
  return ({ timeLeft, onExit }: any) => (
    <View testID="game-header">
      <Text>Game Header - Time: {timeLeft}s</Text>
    </View>
  );
});

jest.mock("../../../../components/TimeAttackStats", () => {
  const { View, Text } = require("react-native");
  return ({ score, streak, correctAnswers, timeLeft }: any) => (
    <View testID="time-attack-stats">
      <Text>Score: {score}</Text>
      <Text>Streak: {streak}</Text>
      <Text>Correct: {correctAnswers}</Text>
      <Text>Time: {timeLeft}s</Text>
    </View>
  );
});

jest.mock("../../../../components/TranslationInput", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({
    onSubmitTranslation,
    wordToTranslate,
    fromLanguage,
    toLanguage,
  }: any) => (
    <TouchableOpacity
      testID="translation-input"
      onPress={() => onSubmitTranslation("test-answer")}
    >
      <Text>Translation Input</Text>
      <Text>Word: {wordToTranslate}</Text>
      <Text>
        From {fromLanguage} to {toLanguage}
      </Text>
    </TouchableOpacity>
  );
});

jest.mock("../../../../components/VoiceInput", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onSubmitWord, isGameActive, language }: any) => (
    <TouchableOpacity
      testID="voice-input"
      onPress={() => onSubmitWord("test-answer")}
    >
      <Text>Voice Input - {language}</Text>
      <Text>Active: {isGameActive ? "Yes" : "No"}</Text>
    </TouchableOpacity>
  );
});

jest.mock("../../../../components/ExitGameModal", () => {
  const { View, Text, TouchableOpacity } = require("react-native");
  return ({ visible, onConfirm, onCancel }: any) => {
    if (!visible) return null;
    return (
      <View testID="exit-modal">
        <Text>Exit Game Modal</Text>
        <TouchableOpacity testID="confirm-exit" onPress={onConfirm}>
          <Text>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="cancel-exit" onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock("../../../../components/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ title, onPress, disabled, testID }: any) => (
    <TouchableOpacity
      testID={testID || "button"}
      onPress={onPress}
      disabled={disabled}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

// Mock CountdownScreen
jest.mock("../../../../components/CountdownScreen", () => {
  const { View, Text } = require("react-native");
  return ({ onCountdownComplete }: any) => {
    React.useEffect(() => {
      setTimeout(onCountdownComplete, 100);
    }, [onCountdownComplete]);

    return (
      <View testID="countdown-screen">
        <Text>Countdown Screen</Text>
      </View>
    );
  };
});

// Mock GameResultsScreen
jest.mock("../../../../components/GameResultsScreen", () => {
  const { View, Text } = require("react-native");
  return ({ result, onPlayAgain, onBackToMenu }: any) => (
    <View testID="game-results-screen">
      <Text>Game Results</Text>
      <Text>Score: {result?.score}</Text>
    </View>
  );
});

// Create navigation wrapper
const Stack = createNativeStackNavigator();

const NavigationWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Game" component={() => <>{children}</>} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe("GameScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("should show countdown screen initially", () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      expect(screen.getByTestId("countdown-screen")).toBeTruthy();
    });

    it("should initialize game on mount", () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      expect(mockGameHook.initializeGame).toHaveBeenCalled();
    });
  });

  describe("Game Interface", () => {
    beforeEach(() => {
      mockGameHook.isCountingDown = false;
      mockGameHook.gameResult = null;
    });

    it("should render game interface after countdown", async () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      // Wait for countdown to complete
      await waitFor(() => {
        expect(screen.getByTestId("game-header")).toBeTruthy();
      });

      expect(screen.getByTestId("time-attack-stats")).toBeTruthy();
      expect(screen.getByText("From English to Portuguese")).toBeTruthy();
    });

    it("should show translation input in text mode", async () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("translation-input")).toBeTruthy();
      });
    });

    it("should show voice input in voice mode", async () => {
      mockRoute.params.inputMode = "voice";

      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId("voice-input")).toBeTruthy();
      });
    });

    it("should display current word and translation direction", async () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Word: hello")).toBeTruthy();
        expect(screen.getByText("From English to Portuguese")).toBeTruthy();
      });
    });

    it("should display game stats", async () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Score: 60")).toBeTruthy();
        expect(screen.getByText("Streak: 2")).toBeTruthy();
        expect(screen.getByText("Correct: 5")).toBeTruthy();
      });
    });
  });

  describe("Game Interaction", () => {
    beforeEach(() => {
      mockGameHook.isCountingDown = false;
      mockGameHook.gameResult = null;
    });

    it("should submit answer when translation input is used", async () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      await waitFor(() => {
        const translationInput = screen.getByTestId("translation-input");
        fireEvent.press(translationInput);
      });

      expect(mockGameHook.submitAnswer).toHaveBeenCalledWith("test-answer");
    });

    it("should submit answer when voice input is used", async () => {
      mockRoute.params.inputMode = "voice";

      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      await waitFor(() => {
        const voiceInput = screen.getByTestId("voice-input");
        fireEvent.press(voiceInput);
      });

      expect(mockGameHook.submitAnswer).toHaveBeenCalledWith("test-answer");
    });
  });

  describe("Game Results", () => {
    beforeEach(() => {
      mockGameHook.isCountingDown = false;
      mockGameHook.gameResult = {
        score: 100,
        correctAnswers: 8,
        incorrectAnswers: 2,
        totalAnswers: 10,
        accuracy: 80,
        bestStreak: 5,
        totalTime: 60,
        averageTimePerAnswer: 6,
        answers: [],
        fromLanguage: "en" as const,
        toLanguage: "pt" as const,
      };
    });

    it("should show results screen when game ends", () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      expect(screen.getByTestId("game-results-screen")).toBeTruthy();
      expect(screen.getByText("Score: 100")).toBeTruthy();
    });
  });

  describe("Exit Game", () => {
    beforeEach(() => {
      mockGameHook.isCountingDown = false;
      mockGameHook.gameResult = null;
      mockGameHook.showExitModal = false;
    });

    it("should show exit modal when exit is requested", () => {
      mockGameHook.showExitModal = true;

      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      expect(screen.getByTestId("exit-modal")).toBeTruthy();
    });

    it("should handle exit confirmation", () => {
      mockGameHook.showExitModal = true;

      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      const confirmButton = screen.getByTestId("confirm-exit");
      fireEvent.press(confirmButton);

      expect(mockGameHook.confirmExitGame).toHaveBeenCalled();
    });

    it("should handle exit cancellation", () => {
      mockGameHook.showExitModal = true;

      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-exit");
      fireEvent.press(cancelButton);

      expect(mockGameHook.cancelExitGame).toHaveBeenCalled();
    });
  });

  describe("Navigation", () => {
    it("should navigate correctly based on route params", () => {
      render(
        <NavigationWrapper>
          <GameScreen />
        </NavigationWrapper>
      );

      // Component should use route params for targetLanguage and inputMode
      expect(mockGameHook.initializeGame).toHaveBeenCalled();
    });
  });
});
