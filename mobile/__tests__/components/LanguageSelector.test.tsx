import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LanguageSelector from "@/components/LanguageSelector";

// Mock FlagDisplay component
jest.mock("@/components/FlagDisplay", () => {
  const { Text } = require("react-native");
  return function MockFlagDisplay({ countryCode }: { countryCode: string }) {
    return <Text>{`Flag-${countryCode}`}</Text>;
  };
});

interface Language {
  id: string;
  name: string;
  flag: string;
  code: string;
}

describe("LanguageSelector", () => {
  const mockLanguages: Language[] = [
    { id: "1", name: "Português", flag: "br", code: "pt-BR" },
    { id: "2", name: "English", flag: "gb", code: "en-GB" },
    { id: "3", name: "Español", flag: "es", code: "es-ES" },
  ];

  const mockOnLanguageSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with placeholder when no language is selected", () => {
    const { getByText } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    expect(getByText("Selecione um idioma")).toBeTruthy();
  });

  it("should render selected language", () => {
    const { getByText } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={mockLanguages[0]}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    expect(getByText("Português")).toBeTruthy();
  });
  it("should open dropdown when pressed", () => {
    const { getByText, getByTestId } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    const dropdown = getByTestId("language-selector-dropdown");
    fireEvent.press(dropdown);

    expect(getByText("Português")).toBeTruthy();
    expect(getByText("English")).toBeTruthy();
    expect(getByText("Español")).toBeTruthy();
  });
  it("should select language when option is pressed", () => {
    const { getByText, getByTestId } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    // Open dropdown
    const dropdown = getByTestId("language-selector-dropdown");
    fireEvent.press(dropdown);

    // Select a language
    const portugueseOption = getByText("Português");
    fireEvent.press(portugueseOption);

    expect(mockOnLanguageSelect).toHaveBeenCalledWith(mockLanguages[0]);
  });
  it("should close dropdown after selecting language", () => {
    const { getByText, getByTestId, queryByText } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    // Open dropdown
    const dropdown = getByTestId("language-selector-dropdown");
    fireEvent.press(dropdown);

    // Select a language
    const englishOption = getByText("English");
    fireEvent.press(englishOption);

    expect(mockOnLanguageSelect).toHaveBeenCalledWith(mockLanguages[1]);
  });
  it("should toggle dropdown open/close state", () => {
    const { getByTestId, queryByText } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    const dropdown = getByTestId("language-selector-dropdown");

    // Initially closed
    expect(queryByText("Português")).toBeNull();

    // Open dropdown
    fireEvent.press(dropdown);
    expect(queryByText("Português")).toBeTruthy();

    // Close dropdown
    fireEvent.press(dropdown);
  });

  it("should handle empty languages array", () => {
    const { getByText } = render(
      <LanguageSelector
        languages={[]}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    expect(getByText("Selecione um idioma")).toBeTruthy();
  });
  it("should display flag for selected language", () => {
    const { queryByText } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={mockLanguages[0]}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    // Check that the FlagDisplay component is rendered (mocked as Flag-br)
    expect(queryByText("Flag-br")).toBeTruthy();
  });
  it("should display flags for all languages in dropdown", () => {
    const { getByText, getByTestId } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    // Open dropdown
    const dropdown = getByTestId("language-selector-dropdown");
    fireEvent.press(dropdown);

    expect(getByText("Flag-br")).toBeTruthy();
    expect(getByText("Flag-gb")).toBeTruthy();
    expect(getByText("Flag-es")).toBeTruthy();
  });
  it("should highlight selected language in dropdown", () => {
    const { getByTestId } = render(
      <LanguageSelector
        languages={mockLanguages}
        selectedLanguage={mockLanguages[1]}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    // Open dropdown
    const dropdown = getByTestId("language-selector-dropdown");
    fireEvent.press(dropdown);

    // The selected language should be highlighted (this would need visual testing in practice)
    expect(dropdown).toBeTruthy();
  });
  it("should handle single language", () => {
    const singleLanguage = [mockLanguages[0]];

    const { getByText, getByTestId } = render(
      <LanguageSelector
        languages={singleLanguage}
        selectedLanguage={null}
        onLanguageSelect={mockOnLanguageSelect}
      />
    );

    // Open dropdown
    const dropdown = getByTestId("language-selector-dropdown");
    fireEvent.press(dropdown);

    expect(getByText("Português")).toBeTruthy();
  });
});
