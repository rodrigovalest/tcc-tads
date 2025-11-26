import IAvaliableMatchMode from "../models/interfaces/avaliable_match_mode";
import { MatchFormat } from "../models/types/match-format.type";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface MatchFormatSelectorProps {
  avaliableMatchFormats: MatchFormat[];
  selected: MatchFormat | null;
  onSelect: (matchFormat: MatchFormat) => void;
}

const MatchFormatSelector = ({
  avaliableMatchFormats,
  selected,
  onSelect,
}: MatchFormatSelectorProps) => {
  const getColor = (format: MatchFormat) => {
    if (!avaliableMatchFormats.includes(format)) return "#ccc";
    if (selected === format) return "#fff";
    return "#000";
  };

  const getButtonClasses = (format: MatchFormat) => {
    if (!avaliableMatchFormats.includes(format))
      return "bg-appLightGrey border-appLightGrey";
    if (selected === format) return "bg-black border-black";
    return "border-black";
  };

  return (
    <View className="flex-row justify-evenly mt-4 space-x-4">
      <TouchableOpacity
        onPress={() => onSelect("solo")}
        disabled={!avaliableMatchFormats.includes("solo")}
        className={`items-center p-4 rounded-lg border ${getButtonClasses(
          "solo"
        )}`}
      >
        <FontAwesome name="user" size={24} color={getColor("solo")} />
        <Text
          style={{ color: getColor("solo") }}
          className="mt-2 text-sm font-semibold"
        >
          Solo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelect("duo")}
        disabled={!avaliableMatchFormats.includes("duo")}
        className={`items-center p-4 rounded-lg border ${getButtonClasses(
          "duo"
        )}`}
      >
        <FontAwesome5 name="user-friends" size={24} color={getColor("duo")} />
        <Text
          style={{ color: getColor("duo") }}
          className="mt-2 text-sm font-semibold"
        >
          Duo
        </Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        onPress={() => onSelect("group")}
        disabled={!avaliableMatchFormats.includes("group")}
        className={`items-center p-4 rounded-lg border ${getButtonClasses("group")}`}
      >
        <FontAwesome name="users" size={24} color={getColor("group")} />
        <Text
          style={{ color: getColor("group") }}
          className="mt-2 text-sm font-semibold"
        >
          Group
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default MatchFormatSelector;
