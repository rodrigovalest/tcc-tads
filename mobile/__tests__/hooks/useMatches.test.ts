import { renderHook } from "@testing-library/react-native";
import { useMatches } from "@/hooks/useMatches";
import { useRouter } from "expo-router";
import { GAME_MODES_DATA } from "@/utils/gameModesData";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock game modes data
jest.mock("@/utils/gameModesData", () => ({
  GAME_MODES_DATA: [
    {
      id: "1",
      title: "Test Game 1",
      image: { uri: "test1.png" },
      playerTypes: ["solo"],
    },
    {
      id: "2",
      title: "Test Game 2",
      image: { uri: "test2.png" },
      playerTypes: ["duo", "group"],
    },
    {
      id: "3",
      title: "Test Game 3",
      image: { uri: "test3.png" },
      playerTypes: ["solo", "duo"],
    },
  ],
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("useMatches", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({
      push: mockPush,
    } as any);

    jest.clearAllMocks();
  });

  it("should return game modes with onPress handlers", () => {
    const { result } = renderHook(() => useMatches());

    expect(result.current.gameModes).toHaveLength(3);
    expect(result.current.gameModes[0]).toEqual({
      id: "1",
      title: "Test Game 1",
      image: { uri: "test1.png" },
      playerTypes: ["solo"],
      onPress: expect.any(Function),
    });
  });

  it("should navigate to language selection when game mode is pressed", () => {
    const { result } = renderHook(() => useMatches());

    // Press the first game mode
    result.current.gameModes[0].onPress?.();

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(private)/language-selection",
      params: {
        gameMode: "Test Game 1",
      },
    });
  });

  it("should navigate with correct game mode title for each game", () => {
    const { result } = renderHook(() => useMatches());

    // Test all game modes
    result.current.gameModes.forEach((gameMode, index) => {
      gameMode.onPress?.();

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/(private)/language-selection",
        params: {
          gameMode: gameMode.title,
        },
      });
    });

    expect(mockPush).toHaveBeenCalledTimes(3);
  });

  it("should preserve all original game mode properties", () => {
    const { result } = renderHook(() => useMatches());

    result.current.gameModes.forEach((gameMode, index) => {
      const originalGameMode = GAME_MODES_DATA[index];

      expect(gameMode.id).toBe(originalGameMode.id);
      expect(gameMode.title).toBe(originalGameMode.title);
      expect(gameMode.image).toBe(originalGameMode.image);
      expect(gameMode.playerTypes).toEqual(originalGameMode.playerTypes);
      expect(gameMode.onPress).toBeDefined();
    });
  });

  it("should handle multiple onPress calls correctly", () => {
    const { result } = renderHook(() => useMatches());

    const firstGameMode = result.current.gameModes[0];

    // Call onPress multiple times
    firstGameMode.onPress?.();
    firstGameMode.onPress?.();
    firstGameMode.onPress?.();

    expect(mockPush).toHaveBeenCalledTimes(3);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(private)/language-selection",
      params: {
        gameMode: "Test Game 1",
      },
    });
  });
  it("should maintain same data structure on re-renders", () => {
    const { result, rerender } = renderHook(() => useMatches());

    const firstRender = result.current.gameModes;

    rerender({});

    const secondRender = result.current.gameModes;

    // Should have same length and data structure
    expect(firstRender.length).toBe(secondRender.length);
    expect(firstRender[0].id).toBe(secondRender[0].id);
    expect(firstRender[0].title).toBe(secondRender[0].title);
    expect(firstRender[0].image).toEqual(secondRender[0].image);
    expect(firstRender[0].playerTypes).toEqual(secondRender[0].playerTypes);
  });
});
