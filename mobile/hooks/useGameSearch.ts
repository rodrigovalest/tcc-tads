import { useState, useMemo } from "react";
import { GameMode, PlayerType } from "@/components/GameModeCard";

type FilterType = PlayerType | "all";

export const useGameSearch = (gameModes: GameMode[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

  const filteredGameModes = useMemo(() => {
    let filtered = gameModes;

    if (searchQuery.trim()) {
      filtered = filtered.filter((mode) =>
        mode.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((mode) =>
        mode.playerTypes.includes(selectedFilter)
      );
    }

    return filtered;
  }, [gameModes, searchQuery, selectedFilter]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearFilter = () => {
    setSelectedFilter("all");
  };

  const clearAll = () => {
    clearSearch();
    clearFilter();
  };

  return {
    searchQuery,
    selectedFilter,
    filteredGameModes,
    handleSearchChange,
    handleFilterChange,
    clearSearch,
    clearFilter,
    clearAll,
  };
};
