import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import IconButton from "./IconButton";
import useI18n from "../hooks/useI18n";
import { COLORS } from "../constants/colors";

interface GameHeaderProps {
  timeLeft: number;
  currentLetter: string;
  onExit: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  timeLeft,
  currentLetter,
  onExit,
}) => {
  const { t } = useI18n();

  const formatTime = (seconds: number): string => {
    const whole = Math.floor(seconds * 100); // centiseconds
    const minutes = Math.floor(whole / 6000);
    const secs = Math.floor((whole % 6000) / 100);
    const cs = whole % 100;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}:${cs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="w-full px-4 pt-2">
      <View className="w-full flex-row justify-between items-center mb-3">
        <IconButton
          iconName="close"
          onPress={onExit}
          backgroundColor={COLORS.appMediumRed}
          iconColor={COLORS.appBgWhite}
          testID="exit-game-button"
        />
      </View>

      <View className="w-full flex-row items-center justify-center">
        <View className="bg-appLightGrey rounded-xl px-6 py-3 flex-row items-center border-2 border-appDarkGrey">
          <Ionicons
            name="time-outline"
            size={24}
            color={COLORS.appDarkGrey}
            style={{ marginRight: 8 }}
          />
          <Text className="text-xl font-nunito-extrabold text-appDarkGrey">
            {formatTime(timeLeft)} | {t("wordBuilder.letter")}{" "}
            {currentLetter.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GameHeader;
