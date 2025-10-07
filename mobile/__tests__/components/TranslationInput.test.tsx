import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import TranslationInput from "../../components/TranslationInput";

// Mock useI18n hook
const mockT = jest.fn((key: string) => {
  const translations: { [key: string]: string } = {
    "timeAttackVocab.translateWord": "Translate the word:",
    "timeAttackVocab.from": "From",
    "timeAttackVocab.to": "to",
    "timeAttackVocab.enterTranslation": "Enter translation",
    "timeAttackVocab.submit": "Submit",
  };
  return translations[key] || key;
});

jest.mock("../../hooks/useI18n", () => ({
  __esModule: true,
  default: () => ({
    t: mockT,
  }),
}));

// Mock Button component
jest.mock("../../components/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return ({ title, onPress, disabled, className, testID }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      testID={testID || "button"}
      className={className}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe("TranslationInput", () => {
  const defaultProps = {
    onSubmitTranslation: jest.fn(),
    isGameActive: true,
    wordToTranslate: "hello",
    fromLanguage: "English",
    toLanguage: "Portuguese",
    placeholder: "Enter translation",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render correctly with all props", () => {
      render(<TranslationInput {...defaultProps} />);

      expect(screen.getByText("Translate the word:")).toBeTruthy();
      expect(screen.getByText("hello")).toBeTruthy();
      expect(screen.getByText("From English to Portuguese")).toBeTruthy();
      expect(screen.getByDisplayValue("")).toBeTruthy();
      expect(screen.getByText("Submit")).toBeTruthy();
    });

    it("should display placeholder text", () => {
      render(<TranslationInput {...defaultProps} />);

      const textInput = screen.getByPlaceholderText("Enter translation");
      expect(textInput).toBeTruthy();
    });

    it("should show word to translate prominently", () => {
      render(<TranslationInput {...defaultProps} />);

      expect(screen.getByText("hello")).toBeTruthy();
    });

    it("should show language direction", () => {
      render(<TranslationInput {...defaultProps} />);

      expect(screen.getByText("From English to Portuguese")).toBeTruthy();
    });
  });

  describe("User interaction", () => {
    it("should handle text input correctly", () => {
      render(<TranslationInput {...defaultProps} />);

      const textInput = screen.getByPlaceholderText("Enter translation");

      fireEvent.changeText(textInput, "olá");

      expect(textInput.props.value).toBe("olá");
    });

    it("should filter out invalid characters", () => {
      render(<TranslationInput {...defaultProps} />);

      const textInput = screen.getByPlaceholderText("Enter translation");

      fireEvent.changeText(textInput, "ol@á123!");

      expect(textInput.props.value).toBe("olá");
    });

    it("should allow accented characters", () => {
      render(<TranslationInput {...defaultProps} />);

      const textInput = screen.getByPlaceholderText("Enter translation");

      fireEvent.changeText(textInput, "olá éíóúàèìòù âêîôû ãõñç");

      expect(textInput.props.value).toBe("olá éíóúàèìòù âêîôû ãõñç");
    });

    it("should call onSubmitTranslation when submit button is pressed", () => {
      const onSubmitTranslation = jest.fn();
      render(
        <TranslationInput
          {...defaultProps}
          onSubmitTranslation={onSubmitTranslation}
        />
      );

      const textInput = screen.getByPlaceholderText("Enter translation");
      const submitButton = screen.getByText("Submit");

      fireEvent.changeText(textInput, "olá");
      fireEvent.press(submitButton);

      expect(onSubmitTranslation).toHaveBeenCalledWith("olá");
    });

    it("should call onSubmitTranslation when enter is pressed", () => {
      const onSubmitTranslation = jest.fn();
      render(
        <TranslationInput
          {...defaultProps}
          onSubmitTranslation={onSubmitTranslation}
        />
      );

      const textInput = screen.getByPlaceholderText("Enter translation");

      fireEvent.changeText(textInput, "olá");
      fireEvent(textInput, "submitEditing");

      expect(onSubmitTranslation).toHaveBeenCalledWith("olá");
    });

    it("should clear input after submission", () => {
      const onSubmitTranslation = jest.fn();
      render(
        <TranslationInput
          {...defaultProps}
          onSubmitTranslation={onSubmitTranslation}
        />
      );

      const textInput = screen.getByPlaceholderText("Enter translation");
      const submitButton = screen.getByText("Submit");

      fireEvent.changeText(textInput, "olá");
      fireEvent.press(submitButton);

      expect(textInput.props.value).toBe("");
    });

    it("should not submit empty translations", () => {
      const onSubmitTranslation = jest.fn();
      render(
        <TranslationInput
          {...defaultProps}
          onSubmitTranslation={onSubmitTranslation}
        />
      );

      const submitButton = screen.getByText("Submit");

      fireEvent.press(submitButton);

      expect(onSubmitTranslation).not.toHaveBeenCalled();
    });

    it("should not submit when game is inactive", () => {
      const onSubmitTranslation = jest.fn();
      render(
        <TranslationInput
          {...defaultProps}
          isGameActive={false}
          onSubmitTranslation={onSubmitTranslation}
        />
      );

      const textInput = screen.getByPlaceholderText("Enter translation");
      const submitButton = screen.getByText("Submit");

      fireEvent.changeText(textInput, "olá");
      fireEvent.press(submitButton);

      expect(onSubmitTranslation).not.toHaveBeenCalled();
    });
  });

  describe("Button state", () => {
    it("should disable submit button when game is inactive", () => {
      render(<TranslationInput {...defaultProps} isGameActive={false} />);

      const submitButton = screen.getByTestId("button");

      expect(submitButton.props.disabled).toBe(true);
    });

    it("should disable submit button when input is empty", () => {
      render(<TranslationInput {...defaultProps} />);

      const submitButton = screen.getByTestId("button");

      expect(submitButton.props.disabled).toBe(true);
    });

    it("should enable submit button when input has text and game is active", () => {
      render(<TranslationInput {...defaultProps} />);

      const textInput = screen.getByPlaceholderText("Enter translation");
      const submitButton = screen.getByTestId("button");

      fireEvent.changeText(textInput, "olá");

      expect(submitButton.props.disabled).toBe(false);
    });
  });

  describe("Input validation", () => {
    it("should trim whitespace from input", () => {
      const onSubmitTranslation = jest.fn();
      render(
        <TranslationInput
          {...defaultProps}
          onSubmitTranslation={onSubmitTranslation}
        />
      );

      const textInput = screen.getByPlaceholderText("Enter translation");
      const submitButton = screen.getByText("Submit");

      fireEvent.changeText(textInput, "  olá  ");
      fireEvent.press(submitButton);

      expect(onSubmitTranslation).toHaveBeenCalledWith("olá");
    });

    it("should not submit only whitespace", () => {
      const onSubmitTranslation = jest.fn();
      render(
        <TranslationInput
          {...defaultProps}
          onSubmitTranslation={onSubmitTranslation}
        />
      );

      const textInput = screen.getByPlaceholderText("Enter translation");
      const submitButton = screen.getByText("Submit");

      fireEvent.changeText(textInput, "   ");
      fireEvent.press(submitButton);

      expect(onSubmitTranslation).not.toHaveBeenCalled();
    });
  });
});
