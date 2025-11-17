import { MatchMode } from "../models/types/match-mode.type";
import { getLocalizedMatchModes } from "../constants/available-match-modes";
import formatDuration from "../utils/format-duration";
import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { MatchLanguage } from "../models/types/match-language.type";
import { getLocalizedMatchLanguages } from "../constants/avaliable-match-languages";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useRouter } from "expo-router";
import useAuthStore from "../store/auth-store";
import { MATCH_RATE } from "../constants/match-rate";
import { MatchRateScore } from "../models/types/match-rate-score";

interface MatchHistoryItemProps {
  startTime: string;
  endTime: string;
  mode: MatchMode;
  language: MatchLanguage;
  averageFluencyScore: MatchRateScore | null;
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
  averageFluencyScore,
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
  };

  return (
    <View className="bg-appLightGrey py-6 pl-10 pr-12 mb-4">
      <View className="flex-row justify-between">
        <Text className="text-lg font-nunito-bold text-appBlack">
          {getLocalizedMatchModes()[mode].title}
        </Text>
        <Text className="text-lg font-nunito-medium text-appBlack">{date}</Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-lg font-nunito-medium text-appBlack">
          {getLocalizedMatchLanguages()[language]}
        </Text>
        <Text className="text-l font-nunito-medium text-appBlack">
          {duration}
        </Text>
      </View>

      <View className="flex-row mt-4 justify-between">
        <View>
          {users
            .filter((user) => user.id !== loggedUser?.sub)
            .map((user, index) =>
              user.photoUri ? (
                <Pressable
                  key={index}
                  onPress={() => onUserPress(user.username)}
                  testID={`user-image-${user.username}`}
                >
                  <Image
                    source={{ uri: user.photoUri }}
                    className="w-14 h-14 rounded-full mr-2"
                    resizeMode="cover"
                  />
                </Pressable>
              ) : (
                <Pressable
                  key={index}
                  onPress={() => onUserPress(user.username)}
                  className="items-center justify-center mr-2 rounded-full"
                  testID={`user-image-${user.username}`}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={45}
                    color={COLORS.appDarkGrey}
                  />
                </Pressable>
              )
            )}
        </View>

        {averageFluencyScore && (
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-nunito-semibold text-appBlack mr-3">
              Level: {averageFluencyScore}
            </Text>

            <Image
              source={MATCH_RATE[averageFluencyScore].image}
              className="rounded-lg"
              style={{ width: 50, height: 50 }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default MatchHistoryItem;
