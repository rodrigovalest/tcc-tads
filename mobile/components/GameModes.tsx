import React from "react";
import { Text, View, ScrollView } from "react-native";
import GameModeCard, { GameMode } from "./GameModeCard";
import SearchAndFilter from "./SearchAndFilter";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useGameModes } from "@/hooks/useGameModes";
import { useGameSearch } from "@/hooks/useGameSearch";

interface GameModesProps {
  modes: GameMode[];
  title?: string;
}

const GameModes = ({ modes, title = "Game Modes" }: GameModesProps) => {
  const { scrollViewPaddingBottom } = useTabBarHeight();
  const {
    searchQuery,
    selectedFilter,
    filteredGameModes,
    handleSearchChange,
    handleFilterChange,
  } = useGameSearch(modes);
  const { columns, columnWidth } = useGameModes(filteredGameModes);

  return (
    <View className="mt-8">
      <View className="px-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4 px-2">
          {title}
        </Text>
      </View>

      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: scrollViewPaddingBottom,
          flexGrow: 1,
          paddingHorizontal: 24,
        }}
      >
        {filteredGameModes.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 text-lg text-center">
              No game mode found
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {columns.map((column, columnIndex) => (
              <View key={columnIndex} style={{ width: columnWidth }}>
                {column.map((mode) => (
                  <GameModeCard key={mode.id} mode={mode} width={columnWidth} />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default GameModes;
