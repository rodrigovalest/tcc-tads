import { renderHook, act } from "@testing-library/react-native";
import { useGameSearch } from "@/hooks/useGameSearch";
import { GameMode } from "@/components/GameModeCard";

describe("useGameSearch", () => {
  const mockGameModes: GameMode[] = [
    {
      id: "1",
      title: "Just Chilling",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 1.2,
      playerTypes: ["solo"],
    },
    {
      id: "2",
      title: "Casual Talk",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 2,
      playerTypes: ["duo", "group"],
    },
    {
      id: "3",
      title: "Game Night",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 2.1,
      playerTypes: ["group"],
    },
    {
      id: "4",
      title: "Movie Time",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 1.11,
      playerTypes: ["solo", "duo"],
    },
  ];

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    expect(result.current.searchQuery).toBe("");
    expect(result.current.selectedFilter).toBe("all");
    expect(result.current.filteredGameModes).toEqual(mockGameModes);
  });

  it("should filter games by search query", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleSearchChange("chilling");
    });

    expect(result.current.searchQuery).toBe("chilling");
    expect(result.current.filteredGameModes).toHaveLength(1);
    expect(result.current.filteredGameModes[0].title).toBe("Just Chilling");
  });

  it("should filter games by search query case insensitive", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleSearchChange("CASUAL");
    });

    expect(result.current.filteredGameModes).toHaveLength(1);
    expect(result.current.filteredGameModes[0].title).toBe("Casual Talk");
  });

  it("should filter games by player type", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleFilterChange("solo");
    });

    expect(result.current.selectedFilter).toBe("solo");
    expect(result.current.filteredGameModes).toHaveLength(2);
    expect(result.current.filteredGameModes.map((g) => g.title)).toEqual([
      "Just Chilling",
      "Movie Time",
    ]);
  });

  it("should filter games by duo player type", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleFilterChange("duo");
    });

    expect(result.current.filteredGameModes).toHaveLength(2);
    expect(result.current.filteredGameModes.map((g) => g.title)).toEqual([
      "Casual Talk",
      "Movie Time",
    ]);
  });

  it("should filter games by group player type", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleFilterChange("group");
    });

    expect(result.current.filteredGameModes).toHaveLength(2);
    expect(result.current.filteredGameModes.map((g) => g.title)).toEqual([
      "Casual Talk",
      "Game Night",
    ]);
  });

  it("should combine search and filter", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleSearchChange("game");
      result.current.handleFilterChange("group");
    });

    expect(result.current.filteredGameModes).toHaveLength(1);
    expect(result.current.filteredGameModes[0].title).toBe("Game Night");
  });

  it("should return empty array when no matches", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleSearchChange("nonexistent");
    });

    expect(result.current.filteredGameModes).toHaveLength(0);
  });

  it("should show all games when filter is 'all'", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleFilterChange("solo");
    });

    expect(result.current.filteredGameModes).toHaveLength(2);

    act(() => {
      result.current.handleFilterChange("all");
    });

    expect(result.current.filteredGameModes).toEqual(mockGameModes);
  });

  it("should clear search", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleSearchChange("test");
    });

    expect(result.current.searchQuery).toBe("test");

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe("");
  });

  it("should clear filter", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleFilterChange("solo");
    });

    expect(result.current.selectedFilter).toBe("solo");

    act(() => {
      result.current.clearFilter();
    });

    expect(result.current.selectedFilter).toBe("all");
  });

  it("should clear all", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleSearchChange("test");
      result.current.handleFilterChange("solo");
    });

    expect(result.current.searchQuery).toBe("test");
    expect(result.current.selectedFilter).toBe("solo");

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.searchQuery).toBe("");
    expect(result.current.selectedFilter).toBe("all");
    expect(result.current.filteredGameModes).toEqual(mockGameModes);
  });

  it("should ignore whitespace-only search queries", () => {
    const { result } = renderHook(() => useGameSearch(mockGameModes));

    act(() => {
      result.current.handleSearchChange("   ");
    });

    expect(result.current.filteredGameModes).toEqual(mockGameModes);
  });
});
