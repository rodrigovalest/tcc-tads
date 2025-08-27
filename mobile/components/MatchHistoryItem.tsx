import formatDuration from "../utils/format-duration";
import React from "react";
import { View, Text } from "react-native";

interface MatchHistoryItemProps {
  startTime: string;
  endTime: string;
  mode: string;
  language: string;
  users: {
    username: string;
    nationality: string;
  }[];
}

const MatchHistoryItem = ({
  startTime,
  endTime,
  mode,
  language,
  users,
}: MatchHistoryItemProps) => {
  const date = new Date(startTime).toLocaleDateString();
  const duration = formatDuration(startTime, endTime);

  return (
    <View className="bg-appLightGrey py-6 pl-10 pr-12">
      <View className="flex-row justify-between">
        <Text className="text-lg font-nunito-bold">{mode}</Text>
        <Text className="text-lg font-nunito-medium">{date}</Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-lg font-nunito-medium">{language}</Text>
        <Text className="text-lg font-nunito-medium">{duration}</Text>
      </View>
    </View>
  );
};

export default MatchHistoryItem;
