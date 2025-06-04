import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import SearchInput from "./SearchInput";
import { PlayerType } from "./GameModeCard";

type FilterType = PlayerType | "all";

interface FilterItem {
  key: FilterType;
  label: string;
  icon: string;
}

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
}: SearchAndFilterProps) => {
  const filters: FilterItem[] = [
    { key: "all", label: "Todos", icon: "th" },
    { key: "solo", label: "Solo", icon: "user" },
    { key: "duo", label: "Dupla", icon: "user-friends" },
    { key: "group", label: "Grupo", icon: "users" },
  ];
  
  return (<View className="px-6 mb-4">
      <View className="mb-4">
        <SearchInput
          placeholder="Pesquisar modos de jogo..."
          value={searchQuery}
          onChangeText={onSearchChange}
        />      </View>

      <View className="flex-row justify-between">
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            className={`flex-1 mx-1 py-3 px-2 rounded-lg border-2 items-center justify-center ${
              selectedFilter === filter.key
                ? "bg-black border-black"
                : "bg-white border-gray-300"
            }`}
            activeOpacity={0.7}
          >
            <Icon
              name={filter.icon}
              size={16}
              color={selectedFilter === filter.key ? "white" : "#374151"}
              style={{ marginBottom: 4 }}
            />
            <Text
              className={`text-xs font-medium ${
                selectedFilter === filter.key ? "text-white" : "text-gray-700"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SearchAndFilter;
