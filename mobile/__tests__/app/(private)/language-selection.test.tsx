import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LanguageSelection from "@/app/(private)/language-selection";
import { useLocalSearchParams, router } from "expo-router";
import { useLanguageSelection } from "@/hooks/useLanguageSelection";

// Mock expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  router: {
    back: jest.fn(),
  },
}));

// Mock custom hook
jest.mock("@/hooks/useLanguageSelection", () => ({
  useLanguageSelection: jest.fn(),
}));

// Mock components
jest.mock(
  "@/components/Button",
  () =>
    ({ onPress, title, disabled, iconLeft, iconRight }: any) => {
      const { Text, TouchableOpacity } = require("react-native");
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          testID={`button-${title.toLowerCase().replace(/\s+/g, "-")}`}
          accessibilityState={{ disabled }}
        >
          <Text>
            {iconLeft && `[${iconLeft}] `}
            {title}
            {iconRight && ` [${iconRight}]`}
          </Text>
        </TouchableOpacity>
      );
    }
);

jest.mock(
  "@/components/LanguageSelector",
  () =>
    ({ languages, selectedLanguage, onLanguageSelect }: any) => {
      const { View, Text, TouchableOpacity } = require("react-native");
      return (
        <View testID="language-selector">
          {languages.map((lang: any) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => onLanguageSelect(lang)}
              testID={`language-option-${lang.code}`}
            >
              <Text>
                {lang.name} {selectedLanguage?.code === lang.code && "✓"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
);

jest.mock(
  "@/components/PlayerModeSelector",
  () =>
    ({ availablePlayerTypes, selectedPlayerType, onPlayerTypeSelect }: any) => {
      const { View, Text, TouchableOpacity } = require("react-native");
      return (
        <View testID="player-mode-selector">
          {availablePlayerTypes.map((type: string) => (
            <TouchableOpacity
              key={type}
              onPress={() => onPlayerTypeSelect(type)}
              testID={`player-type-${type}`}
            >
              <Text>
                {type} {selectedPlayerType === type && "✓"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
);

// Mock utils
jest.mock("@/utils/gameModesData", () => ({
  GAME_MODES_DATA: [
    {
      title: "Conversation Practice",
      playerTypes: ["solo", "multiplayer"],
    },
    {
      title: "Vocabulary Quiz",
      playerTypes: ["solo"],
    },
  ],
}));

const mockUseLanguageSelection = useLanguageSelection as jest.MockedFunction<
  typeof useLanguageSelection
>;
const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;

describe("LanguageSelection screen", () => {
  const mockLanguages = [
    { id: "1", code: "en", name: "English", flag: "🇺🇸" },
    { id: "2", code: "es", name: "Spanish", flag: "🇪🇸" },
  ];
  const defaultHookReturn = {
    languages: mockLanguages,
    selectedLanguage: mockLanguages[0],
    selectedPlayerType: "solo" as any,
    availablePlayerTypes: ["solo", "multiplayer"] as any,
    title: "Select Language",
    buttonText: "Start Practice",
    isButtonEnabled: true,
    handleLanguageSelect: jest.fn(),
    handlePlayerTypeSelect: jest.fn(),
    handleStartGame: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({
      gameMode: "Conversation Practice",
    });
    mockUseLanguageSelection.mockReturnValue(defaultHookReturn);
  });
  it("renders correctly with all components", () => {
    const { getByText, getByTestId } = render(<LanguageSelection />);

    expect(getByText("Select Language")).toBeTruthy();
    expect(getByText("Mode: Conversation Practice")).toBeTruthy();
    expect(getByTestId("button-back")).toBeTruthy();
    expect(getByTestId("button-start-practice")).toBeTruthy();
    expect(getByTestId("language-selector")).toBeTruthy();
    expect(getByTestId("player-mode-selector")).toBeTruthy();
  });

  it("calls router.back when back button is pressed", () => {
    const { getByTestId } = render(<LanguageSelection />);
    const backButton = getByTestId("button-back");

    fireEvent.press(backButton);

    expect(router.back).toHaveBeenCalled();
  });

  it("calls handleStartGame when start button is pressed", () => {
    const { getByTestId } = render(<LanguageSelection />);
    const startButton = getByTestId("button-start-practice");

    fireEvent.press(startButton);

    expect(defaultHookReturn.handleStartGame).toHaveBeenCalled();
  });

  it("renders languages from hook", () => {
    const { getByTestId } = render(<LanguageSelection />);

    expect(getByTestId("language-option-en")).toBeTruthy();
    expect(getByTestId("language-option-es")).toBeTruthy();
  });

  it("renders available player types correctly", () => {
    const { getByTestId } = render(<LanguageSelection />);

    expect(getByTestId("player-type-solo")).toBeTruthy();
    expect(getByTestId("player-type-multiplayer")).toBeTruthy();
  });

  it("handles language selection", () => {
    const { getByTestId } = render(<LanguageSelection />);
    const englishOption = getByTestId("language-option-en");

    fireEvent.press(englishOption);

    expect(defaultHookReturn.handleLanguageSelect).toHaveBeenCalledWith(
      mockLanguages[0]
    );
  });

  it("handles player type selection", () => {
    const { getByTestId } = render(<LanguageSelection />);
    const multiplayerOption = getByTestId("player-type-multiplayer");

    fireEvent.press(multiplayerOption);

    expect(defaultHookReturn.handlePlayerTypeSelect).toHaveBeenCalledWith(
      "multiplayer"
    );
  });
  it("disables start button when not enabled", () => {
    mockUseLanguageSelection.mockReturnValue({
      ...defaultHookReturn,
      isButtonEnabled: false,
    });

    const { getByTestId } = render(<LanguageSelection />);
    const startButton = getByTestId("button-start-practice");

    expect(startButton.props.accessibilityState.disabled).toBe(true);
  });

  it("shows correct button text and icon based on player type", () => {
    mockUseLanguageSelection.mockReturnValue({
      ...defaultHookReturn,
      selectedPlayerType: "multiplayer" as any,
      buttonText: "Find Match",
    });

    const { getByText } = render(<LanguageSelection />);

    expect(getByText("Find Match [search]")).toBeTruthy();
  });

  it("shows play icon for solo mode", () => {
    mockUseLanguageSelection.mockReturnValue({
      ...defaultHookReturn,
      selectedPlayerType: "solo",
      buttonText: "Start Practice",
    });

    const { getByText } = render(<LanguageSelection />);

    expect(getByText("Start Practice [play]")).toBeTruthy();
  });

  it("handles game mode without available player types", () => {
    mockUseLocalSearchParams.mockReturnValue({ gameMode: "Unknown Mode" });

    const { getByTestId } = render(<LanguageSelection />);

    expect(getByTestId("player-type-solo")).toBeTruthy();
  });

  it("displays correct title and game mode", () => {
    mockUseLanguageSelection.mockReturnValue({
      ...defaultHookReturn,
      title: "Choose Your Language",
    });

    const { getByText } = render(<LanguageSelection />);
    expect(getByText("Choose Your Language")).toBeTruthy();
    expect(getByText("Mode: Conversation Practice")).toBeTruthy();
  });
});
