import { renderHook, act } from "@testing-library/react-native";
import { useLanguageSelection } from "@/hooks/useLanguageSelection";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { PlayerType } from "@/components/GameModeCard";

// Mock the constants
jest.mock("@/constants/languages", () => ({
  SUPPORTED_LANGUAGES: [
    { name: "English", countryCode: "US", code: "en" },
    { name: "Portuguese", countryCode: "BR", code: "pt" },
    { name: "Spanish", countryCode: "ES", code: "es" },
  ],
}));

describe("useLanguageSelection", () => {
  const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });
  it("should initialize with default values and auto-select when only one player type", () => {
    const { result } = renderHook(() => useLanguageSelection());

    expect(result.current.selectedLanguage).toBeNull();
    expect(result.current.selectedPlayerType).toBe("solo"); // Auto-selected since only one available
    expect(result.current.availablePlayerTypes).toEqual(["solo"]);
    expect(result.current.isButtonEnabled).toBe(false); // Still false because no language selected
  });

  it("should auto-select player type when only one is available", () => {
    const { result } = renderHook(() =>
      useLanguageSelection(["duo"] as PlayerType[])
    );

    expect(result.current.selectedPlayerType).toBe("duo");
  });

  it("should not auto-select when multiple player types are available", () => {
    const { result } = renderHook(() =>
      useLanguageSelection(["solo", "duo", "group"] as PlayerType[])
    );

    expect(result.current.selectedPlayerType).toBeNull();
  });

  it("should handle language selection", () => {
    const { result } = renderHook(() => useLanguageSelection(["solo"]));
    const mockLanguage = {
      id: "1",
      name: "English",
      flag: "US",
      code: "en",
    };

    act(() => {
      result.current.handleLanguageSelect(mockLanguage);
    });

    expect(result.current.selectedLanguage).toEqual(mockLanguage);
  });

  it("should handle player type selection", () => {
    const { result } = renderHook(() =>
      useLanguageSelection(["solo", "duo"] as PlayerType[])
    );

    act(() => {
      result.current.handlePlayerTypeSelect("duo");
    });

    expect(result.current.selectedPlayerType).toBe("duo");
  });

  it("should enable button when both language and player type are selected", () => {
    const { result } = renderHook(() => useLanguageSelection(["solo"]));
    const mockLanguage = {
      id: "1",
      name: "English",
      flag: "US",
      code: "en",
    };

    // Player type should be auto-selected as "solo"
    expect(result.current.selectedPlayerType).toBe("solo");

    act(() => {
      result.current.handleLanguageSelect(mockLanguage);
    });

    expect(result.current.isButtonEnabled).toBe(true);
  });

  it("should return correct title for different player types", () => {
    const { result: soloResult } = renderHook(() =>
      useLanguageSelection(["solo"])
    );
    expect(soloResult.current.title).toBe("Play to Challenge yourself!");

    const { result: duoResult } = renderHook(() =>
      useLanguageSelection(["duo"])
    );
    expect(duoResult.current.title).toBe("Find a duo partner!");

    const { result: groupResult } = renderHook(() =>
      useLanguageSelection(["group"])
    );
    expect(groupResult.current.title).toBe("Find people to play with!");
  });
  it("should return correct button text for different player types", () => {
    const { result: soloResult } = renderHook(() =>
      useLanguageSelection(["solo"])
    );
    expect(soloResult.current.buttonText).toBe("Play");

    const { result: duoResult } = renderHook(() =>
      useLanguageSelection(["duo"])
    );
    expect(duoResult.current.buttonText).toBe("Find duo");

    const { result: groupResult } = renderHook(() =>
      useLanguageSelection(["group"])
    );
    expect(groupResult.current.buttonText).toBe("Find group");
  });

  it("should handle start game action", () => {
    const { result } = renderHook(() => useLanguageSelection(["solo"]));
    const mockLanguage = {
      id: "1",
      name: "English",
      flag: "US",
      code: "en",
    };

    act(() => {
      result.current.handleLanguageSelect(mockLanguage);
    });

    act(() => {
      result.current.handleStartGame();
    });
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "Starting solo game with language: English"
    );
  });

  it("should not start game if language or player type is missing", () => {
    const { result } = renderHook(() =>
      useLanguageSelection(["solo", "duo"] as PlayerType[])
    );

    // Only select language, not player type
    const mockLanguage = {
      id: "1",
      name: "English",
      flag: "US",
      code: "en",
    };

    act(() => {
      result.current.handleLanguageSelect(mockLanguage);
    });

    act(() => {
      result.current.handleStartGame();
    });

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it("should map supported languages correctly", () => {
    const { result } = renderHook(() => useLanguageSelection());

    expect(result.current.languages).toEqual([
      { id: "1", name: "English", flag: "US", code: "en" },
      { id: "2", name: "Portuguese", flag: "BR", code: "pt" },
      { id: "3", name: "Spanish", flag: "ES", code: "es" },
    ]);
  });
});
