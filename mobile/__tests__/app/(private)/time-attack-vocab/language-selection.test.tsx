import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LanguageSelection from "../../../../app/(private)/time-attack-vocab/language-selection";

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock language store
const mockLanguageStore = {
  selectedLanguage: "pt",
};

jest.mock("../../../../store/language-store", () => ({
  useLanguageStore: () => mockLanguageStore,
}));

// Mock useI18n hook
const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    "timeAttackVocab.selectTargetLanguage": "Select Target Language",
    "timeAttackVocab.selectLanguageToLearn":
      "Select the language you want to learn",
    "timeAttackVocab.selectInputMode": "Select Input Mode",
    "timeAttackVocab.selectInputModeDescription":
      "Choose how you want to input your answers",
    "timeAttackVocab.playGame": "Play Game",
    "common.back": "Back",
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
jest.mock("../../../../components/LanguageSelector", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({
    selectedLanguage,
    onLanguageSelect,
    availableLanguages,
    testID,
  }: any) => (
    <TouchableOpacity
      testID={testID || "language-selector"}
      onPress={() => onLanguageSelect("en")}
    >
      <Text>Language Selector - {selectedLanguage || "None"}</Text>
      <Text>{availableLanguages?.join(", ")}</Text>
    </TouchableOpacity>
  );
});

jest.mock("../../../../components/InputModeSelector", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ selectedMode, onModeSelect, testID }: any) => (
    <TouchableOpacity
      testID={testID || "input-mode-selector"}
      onPress={() => onModeSelect("text")}
    >
      <Text>Input Mode Selector - {selectedMode || "None"}</Text>
    </TouchableOpacity>
  );
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

// Create a wrapper component for navigation
const Stack = createNativeStackNavigator();

const NavigationWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="LanguageSelection"
        component={() => <>{children}</>}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

describe("LanguageSelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render correctly with all elements", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      expect(screen.getByText("Select Target Language")).toBeTruthy();
      expect(
        screen.getByText("Select the language you want to learn")
      ).toBeTruthy();
      expect(screen.getByText("Select Input Mode")).toBeTruthy();
      expect(screen.getByText("Select Input Mode")).toBeTruthy();
      expect(screen.getByText("Play Game")).toBeTruthy();
    });

    it("should show language selector", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      expect(screen.getByTestId("language-selector")).toBeTruthy();
    });

    it("should show input mode selector", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      expect(screen.getByTestId("input-mode-selector")).toBeTruthy();
    });

    it("should show play button initially disabled", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const playButton = screen.getByTestId("button");
      expect(playButton.props.disabled).toBe(true);
    });
  });

  describe("Language selection", () => {
    it("should handle language selection", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const languageSelector = screen.getByTestId("language-selector");
      fireEvent.press(languageSelector);

      // Should trigger onLanguageSelect
      expect(screen.getByText("Language Selector - en")).toBeTruthy();
    });

    it("should filter out selected system language from options", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const languageSelector = screen.getByTestId("language-selector");

      // Should show available languages excluding Portuguese (system language)
      expect(screen.getByText(/en, es/)).toBeTruthy();
    });
  });

  describe("Input mode selection", () => {
    it("should handle input mode selection", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const inputModeSelector = screen.getByTestId("input-mode-selector");
      fireEvent.press(inputModeSelector);

      // Should trigger onModeSelect
      expect(screen.getByText("Input Mode Selector - text")).toBeTruthy();
    });
  });

  describe("Play button", () => {
    it("should enable play button when both language and input mode are selected", async () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const languageSelector = screen.getByTestId("language-selector");
      const inputModeSelector = screen.getByTestId("input-mode-selector");

      // Select language
      fireEvent.press(languageSelector);

      // Select input mode
      fireEvent.press(inputModeSelector);

      await waitFor(() => {
        const playButton = screen.getByTestId("button");
        expect(playButton.props.disabled).toBe(false);
      });
    });

    it("should navigate to game screen when play button is pressed", async () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const languageSelector = screen.getByTestId("language-selector");
      const inputModeSelector = screen.getByTestId("input-mode-selector");

      // Select language and input mode
      fireEvent.press(languageSelector);
      fireEvent.press(inputModeSelector);

      await waitFor(() => {
        const playButton = screen.getByTestId("button");
        fireEvent.press(playButton);
      });

      expect(mockNavigate).toHaveBeenCalledWith("game", {
        targetLanguage: "en",
        inputMode: "text",
      });
    });
  });

  describe("Navigation", () => {
    it("should handle back navigation", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      // This would need to be tested with proper header button setup
      // For now, we can test that the component renders without navigation errors
      expect(screen.getByText("Select Target Language")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have proper screen title", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      expect(screen.getByText("Select Target Language")).toBeTruthy();
    });

    it("should have descriptive text for selections", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      expect(
        screen.getByText("Select the language you want to learn")
      ).toBeTruthy();
      expect(
        screen.getByText("Choose how you want to input your answers")
      ).toBeTruthy();
    });
  });

  describe("State management", () => {
    it("should maintain selected language state", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const languageSelector = screen.getByTestId("language-selector");
      fireEvent.press(languageSelector);

      // Should show selected language
      expect(screen.getByText("Language Selector - en")).toBeTruthy();
    });

    it("should maintain selected input mode state", () => {
      render(
        <NavigationWrapper>
          <LanguageSelection />
        </NavigationWrapper>
      );

      const inputModeSelector = screen.getByTestId("input-mode-selector");
      fireEvent.press(inputModeSelector);

      // Should show selected input mode
      expect(screen.getByText("Input Mode Selector - text")).toBeTruthy();
    });
  });
});
