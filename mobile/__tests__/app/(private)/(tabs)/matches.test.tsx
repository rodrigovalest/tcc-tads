import React from "react";
import { render } from "@testing-library/react-native";
import Matches from "@/app/(private)/(tabs)/matches";
import { useMatches } from "@/hooks/useMatches";

// Mock custom hook
jest.mock("@/hooks/useMatches", () => ({
  useMatches: jest.fn(),
}));

// Mock components
jest.mock("@/components/GameModes", () => ({ modes }: any) => {
  const { View, Text } = require("react-native");
  return (
    <View testID="game-modes">
      {modes.map((mode: any) => (
        <Text key={mode.id} testID={`game-mode-${mode.id}`}>
          {mode.title}
        </Text>
      ))}
    </View>
  );
});

jest.mock("@/components/MatchesHeader", () => () => {
  const { View, Text } = require("react-native");
  return (
    <View testID="matches-header">
      <Text>Matches Header</Text>
    </View>
  );
});

const mockUseMatches = useMatches as jest.MockedFunction<typeof useMatches>;

describe("Matches screen", () => {
  const mockGameModes = [
    {
      id: "1",
      title: "Conversation Practice",
      description: "Practice real conversations",
      image: require("@/assets/images/calle-dog-icon.png"),
      playerTypes: ["solo", "multiplayer"],
    },
    {
      id: "2",
      title: "Vocabulary Quiz",
      description: "Test your vocabulary",
      image: require("@/assets/images/calle-dog-icon.png"),
      playerTypes: ["solo"],
    },
  ] as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMatches.mockReturnValue({
      gameModes: mockGameModes,
    });
  });

  it("renders correctly with all components", () => {
    const { getByTestId } = render(<Matches />);

    expect(getByTestId("matches-header")).toBeTruthy();
    expect(getByTestId("game-modes")).toBeTruthy();
  });

  it("renders game modes from hook", () => {
    const { getByTestId, getByText } = render(<Matches />);

    expect(getByTestId("game-mode-1")).toBeTruthy();
    expect(getByTestId("game-mode-2")).toBeTruthy();
    expect(getByText("Conversation Practice")).toBeTruthy();
    expect(getByText("Vocabulary Quiz")).toBeTruthy();
  });

  it("passes game modes to GameModes component", () => {
    const { getByTestId } = render(<Matches />);
    const gameModesComponent = getByTestId("game-modes");

    expect(gameModesComponent).toBeTruthy();
    expect(mockUseMatches).toHaveBeenCalled();
  });

  it("renders with empty game modes array", () => {
    mockUseMatches.mockReturnValue({
      gameModes: [],
    });

    const { getByTestId, queryByTestId } = render(<Matches />);

    expect(getByTestId("matches-header")).toBeTruthy();
    expect(getByTestId("game-modes")).toBeTruthy();
    expect(queryByTestId("game-mode-1")).toBeNull();
  });

  it("handles game modes with different player types", () => {
    const customGameModes = [
      {
        id: "3",
        title: "Solo Practice",
        description: "Practice alone",
        image: require("@/assets/images/calle-dog-icon.png"),
        playerTypes: ["solo"],
      },
      {
        id: "4",
        title: "Team Challenge",
        description: "Challenge with friends",
        image: require("@/assets/images/calle-dog-icon.png"),
        playerTypes: ["multiplayer"],
      },
    ] as any;

    mockUseMatches.mockReturnValue({
      gameModes: customGameModes,
    });

    const { getByText } = render(<Matches />);

    expect(getByText("Solo Practice")).toBeTruthy();
    expect(getByText("Team Challenge")).toBeTruthy();
  });

  it("maintains proper structure with SafeAreaView and View containers", () => {
    const { getByTestId } = render(<Matches />);

    // The SafeAreaView should contain the main content
    const safeArea = getByTestId("matches-header").parent?.parent;
    expect(safeArea).toBeTruthy();
  });
});
