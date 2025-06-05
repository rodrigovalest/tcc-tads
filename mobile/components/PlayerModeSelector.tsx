import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { PlayerType } from "./GameModeCard";

interface PlayerModeOption {
  type: PlayerType;
  label: string;
  icon: string;
}

interface PlayerModeSelectorProps {
  availablePlayerTypes: PlayerType[];
  selectedPlayerType: PlayerType | null;
  onPlayerTypeSelect: (playerType: PlayerType) => void;
}

const PlayerModeSelector = ({
  availablePlayerTypes,
  selectedPlayerType,
  onPlayerTypeSelect,
}: PlayerModeSelectorProps) => {
  const playerModeOptions: PlayerModeOption[] = [
    { type: "solo", label: "Solo", icon: "user" },
    { type: "duo", label: "Duo", icon: "user-friends" },
    { type: "group", label: "Group", icon: "users" },
  ];

  return (
    <View className="px-6 mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-3 text-center">
        Game Mode
      </Text>
      <View className="flex-row bg-gray-100 rounded-full p-1">
        {playerModeOptions.map((option, index) => {
          const isAvailable = availablePlayerTypes.includes(option.type);
          const isSelected = selectedPlayerType === option.type;
          const isDisabled = !isAvailable;

          return (
            <TouchableOpacity
              key={option.type}
              onPress={() => !isDisabled && onPlayerTypeSelect(option.type)}
              disabled={isDisabled}
              className={`flex-1 py-3 px-4 rounded-full items-center justify-center ${
                isSelected
                  ? "bg-black"
                  : isDisabled
                  ? "bg-transparent"
                  : "bg-transparent"
              }`}
              activeOpacity={isDisabled ? 1 : 0.7}
            >
              <View className="flex-row items-center">
                <Icon
                  name={option.icon}
                  size={16}
                  color={
                    isSelected ? "white" : isDisabled ? "#D1D5DB" : "#374151"
                  }
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`text-sm font-medium ${
                    isSelected
                      ? "text-white"
                      : isDisabled
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PlayerModeSelector;
