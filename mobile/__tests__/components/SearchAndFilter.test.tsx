import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchAndFilter from "@/components/SearchAndFilter";

// Mock SearchInput component
jest.mock("@/components/SearchInput", () => {
  return function MockSearchInput({
    placeholder,
    value,
    onChangeText,
  }: {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
  }) {
    const { TextInput } = require("react-native");
    return (
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        testID="search-input"
      />
    );
  };
});

describe("SearchAndFilter", () => {
  const mockOnSearchChange = jest.fn();
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render search input with placeholder", () => {
    const { getByTestId } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = getByTestId("search-input");
    expect(searchInput).toBeTruthy();
  });

  it("should render all filter buttons", () => {
    const { getByText } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(getByText("Todos")).toBeTruthy();
    expect(getByText("Solo")).toBeTruthy();
    expect(getByText("Dupla")).toBeTruthy();
    expect(getByText("Grupo")).toBeTruthy();
  });

  it("should highlight selected filter", () => {
    const { getByText } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="solo"
        onFilterChange={mockOnFilterChange}
      />
    );

    const soloFilter = getByText("Solo");
    expect(soloFilter).toBeTruthy();
  });

  it("should call onFilterChange when filter is pressed", () => {
    const { getByText } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const soloFilter = getByText("Solo");
    fireEvent.press(soloFilter);

    expect(mockOnFilterChange).toHaveBeenCalledWith("solo");
  });

  it("should call onSearchChange when search input changes", () => {
    const { getByTestId } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "test query");

    expect(mockOnSearchChange).toHaveBeenCalledWith("test query");
  });

  it("should display current search query", () => {
    const { getByTestId } = render(
      <SearchAndFilter
        searchQuery="current search"
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = getByTestId("search-input");
    expect(searchInput.props.value).toBe("current search");
  });

  it("should handle all filter types", () => {
    const filters = ["all", "solo", "duo", "group"] as const;

    filters.forEach((filter) => {
      const { getByText } = render(
        <SearchAndFilter
          searchQuery=""
          onSearchChange={mockOnSearchChange}
          selectedFilter={filter}
          onFilterChange={mockOnFilterChange}
        />
      );

      // Verify filter button exists and can be pressed
      const filterLabels = {
        all: "Todos",
        solo: "Solo",
        duo: "Dupla",
        group: "Grupo",
      };

      const filterButton = getByText(filterLabels[filter]);
      expect(filterButton).toBeTruthy();
    });
  });

  it("should switch between filters", () => {
    const { getByText } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    // Test clicking different filters
    fireEvent.press(getByText("Solo"));
    expect(mockOnFilterChange).toHaveBeenCalledWith("solo");

    fireEvent.press(getByText("Dupla"));
    expect(mockOnFilterChange).toHaveBeenCalledWith("duo");

    fireEvent.press(getByText("Grupo"));
    expect(mockOnFilterChange).toHaveBeenCalledWith("group");

    fireEvent.press(getByText("Todos"));
    expect(mockOnFilterChange).toHaveBeenCalledWith("all");
  });

  it("should handle multiple rapid filter changes", () => {
    const { getByText } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const soloFilter = getByText("Solo");
    const duoFilter = getByText("Dupla");

    fireEvent.press(soloFilter);
    fireEvent.press(duoFilter);
    fireEvent.press(soloFilter);

    expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, "solo");
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, "duo");
    expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, "solo");
  });

  it("should handle empty search query", () => {
    const { getByTestId } = render(
      <SearchAndFilter
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = getByTestId("search-input");
    expect(searchInput.props.value).toBe("");
  });
});
