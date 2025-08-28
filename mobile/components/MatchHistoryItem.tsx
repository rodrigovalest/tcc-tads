import { MatchMode } from "../models/types/match-mode.type";
import { getLocalizedMatchModes } from "../constants/available-match-modes";
import formatDuration from "../utils/format-duration";
import React from "react";
import { View, Text, Image } from "react-native";
import { MatchLanguage } from "../models/types/match-language.type";
import { getLocalizedMatchLanguages } from "../constants/avaliable-match-languages";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useRouter } from "expo-router";
import useAuthStore from "../store/auth-store";

interface MatchHistoryItemProps {
  startTime: string;
  endTime: string;
  mode: MatchMode;
  language: MatchLanguage;
  users: {
    id: number;
    username: string;
    nationality: string;
    photoUri: null | string;
  }[];
}

const MatchHistoryItem = ({
  startTime,
  endTime,
  mode,
  language,
  users,
}: MatchHistoryItemProps) => {
  const router = useRouter();
  const { user: loggedUser } = useAuthStore();

  const date = new Date(startTime).toLocaleDateString();
  const duration = formatDuration(startTime, endTime);

  const onUserPress = (username: string) => {
    router.push({
      pathname: "/(private)/profile/[username]",
      params: { username },
    });
  }

  return (
    <View className="bg-appLightGrey py-6 pl-10 pr-12 mb-4">
      <View className="flex-row justify-between">
        <Text className="text-lg font-nunito-bold">{getLocalizedMatchModes()[mode].title}</Text>
        <Text className="text-lg font-nunito-medium">{date}</Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-lg font-nunito-medium">{getLocalizedMatchLanguages()[language]}</Text>
        <Text className="text-l font-nunito-medium">{duration}</Text>
      </View>

      <View className="flex-row mt-4">
        {users
          .filter((user) => user.id !== loggedUser?.sub)
          .map((user, index) =>
            user.photoUri ? (
              <View
                key={index}
                onTouchEnd={() => onUserPress(user.username)}
              >
                <Image
                  source={{ uri: user.photoUri }}
                  className="w-14 h-14 rounded-full mr-2"
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View
                key={index}
                className="items-center justify-center mr-2 rounded-full"
                onTouchEnd={() => onUserPress(user.username)}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={45}
                  color={COLORS.appMediumGrey}
                />
              </View>
            )
          )}
      </View>
    </View>
  );
};

export default MatchHistoryItem;
