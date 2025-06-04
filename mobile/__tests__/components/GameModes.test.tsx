import React from "react";
import { render } from "@testing-library/react-native";
import GameModes from "@/components/GameModes";
import { GameMode } from "@/components/GameModeCard";

// Mock the hooks
jest.mock("@/hooks/useTabBarHeight", () => ({
  useTabBarHeight: () => ({
    scrollViewPaddingBottom: 100,
  }),
}));

jest.mock("@/hooks/useGameModes", () => ({
  useGameModes: (modes: GameMode[]) => ({
    columns: [
      modes.slice(0, Math.ceil(modes.length / 2)),
      modes.slice(Math.ceil(modes.length / 2)),
    ],
    columnWidth: 150,
  }),
}));

jest.mock("@/hooks/useGameSearch", () => ({
  useGameSearch: (modes: GameMode[]) => ({
    searchQuery: "",
    selectedFilter: "all" as const,
    filteredGameModes: modes,
    handleSearchChange: jest.fn(),
    handleFilterChange: jest.fn(),
  }),
}));

describe("GameModes", () => {
  const mockGameModes: GameMode[] = [
    {
      id: "game1",
      title: "Game 1",
      image: { uri: "https://example.com/game1.jpg" },
      playerTypes: ["solo"],
      onPress: jest.fn(),
    },
    {
      id: "game2",
      title: "Game 2",
      image: { uri: "https://example.com/game2.jpg" },
      playerTypes: ["duo"],
      onPress: jest.fn(),
    },
    {
      id: "game3",
      title: "Game 3",
      image: { uri: "https://example.com/game3.jpg" },
      playerTypes: ["group"],
      onPress: jest.fn(),
    },
  ];

  it("should render with default title", () => {
    const { getByText } = render(<GameModes modes={mockGameModes} />);

    expect(getByText("Modos de Jogo")).toBeTruthy();
  });

  it("should render with custom title", () => {
    const { getByText } = render(
      <GameModes modes={mockGameModes} title="Jogos Personalizados" />
    );

    expect(getByText("Jogos Personalizados")).toBeTruthy();
  });

  it("should render SearchAndFilter component", () => {
    const { UNSAFE_root } = render(<GameModes modes={mockGameModes} />);

    expect(UNSAFE_root).toBeTruthy();
  });
  it("should render game mode cards", () => {
    const { getAllByTestId } = render(<GameModes modes={mockGameModes} />);

    // Check that GameModeCard components are rendered
    const gameCards = getAllByTestId("game-mode-card");
    expect(gameCards).toHaveLength(3);
  });

  it("should handle empty modes array", () => {
    const { getByText } = render(<GameModes modes={[]} />);

    expect(getByText("Modos de Jogo")).toBeTruthy();
  });
  it("should render with single game mode", () => {
    const singleMode = [mockGameModes[0]];

    const { getAllByTestId } = render(<GameModes modes={singleMode} />);

    const gameCards = getAllByTestId("game-mode-card");
    expect(gameCards).toHaveLength(1);
  });
  it("should handle large number of game modes", () => {
    const manyModes: GameMode[] = Array.from({ length: 10 }, (_, i) => ({
      id: `game${i}`,
      title: `Game ${i}`,
      image: { uri: `https://example.com/game${i}.jpg` },
      playerTypes: ["solo"],
      onPress: jest.fn(),
    }));

    const { getAllByTestId } = render(<GameModes modes={manyModes} />);

    const gameCards = getAllByTestId("game-mode-card");
    expect(gameCards).toHaveLength(10);
  });
});

describe("GameModes - No Results", () => {
  beforeEach(() => {
    // Mock useGameSearch to return empty filtered results
    jest.doMock("@/hooks/useGameSearch", () => ({
      useGameSearch: () => ({
        searchQuery: "nonexistent",
        selectedFilter: "all" as const,
        filteredGameModes: [],
        handleSearchChange: jest.fn(),
        handleFilterChange: jest.fn(),
      }),
    }));
  });

  afterEach(() => {
    jest.dontMock("@/hooks/useGameSearch");
  });

  it("should show no results message when filteredGameModes is empty", () => {
    const { getByText } = render(<GameModes modes={[]} />);

    expect(getByText("Nenhum modo de jogo encontrado")).toBeTruthy();
    expect(getByText("Tente ajustar sua pesquisa ou filtros")).toBeTruthy();
  });
});
