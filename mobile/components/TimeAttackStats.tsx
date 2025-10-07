import React from "react";
import { View, Text } from "react-native";
import useI18n from "../hooks/useI18n";

interface TimeAttackStatsProps {
  correctAnswers: number;
  incorrectAnswers: number;
  totalAnswers: number;
  streak: number;
  bestStreak: number;
  score: number;
  timeLeft: number;
}

const TimeAttackStats: React.FC<TimeAttackStatsProps> = ({
  correctAnswers,
  incorrectAnswers,
  totalAnswers,
  streak,
  bestStreak,
  score,
  timeLeft,
}) => {
  const { t } = useI18n();

  const accuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const formatTime = (seconds: number) => {
    const positiveSeconds = Math.max(0, seconds);
    const whole = Math.floor(positiveSeconds * 100);
    const minutes = Math.floor(whole / 6000);
    const secs = Math.floor((whole % 6000) / 100);
    const cs = whole % 100;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}:${cs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="bg-white mx-4 mb-4 p-4 rounded-xl border border-appLightGrey">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-2xl font-nunito-bold text-appBlue">
          {formatTime(timeLeft)}
        </Text>
        <Text className="text-2xl font-nunito-bold text-appGreen">{score}</Text>
      </View>

      <View className="flex-row justify-between mb-2">
        <View className="flex-1 items-center">
          <Text className="text-lg font-nunito-bold text-appGreen">
            {correctAnswers}
          </Text>
          <Text className="text-xs font-nunito-medium text-appDarkGrey">
            {t("timeAttackVocab.correct")}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-lg font-nunito-bold text-appRed">
            {incorrectAnswers}
          </Text>
          <Text className="text-xs font-nunito-medium text-appDarkGrey">
            {t("timeAttackVocab.incorrect")}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-lg font-nunito-bold text-appBlue">
            {accuracy}%
          </Text>
          <Text className="text-xs font-nunito-medium text-appDarkGrey">
            {t("timeAttackVocab.accuracy")}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="flex-1 items-center">
          <Text className="text-lg font-nunito-bold text-appOrange">
            {streak}
          </Text>
          <Text className="text-xs font-nunito-medium text-appDarkGrey">
            {t("timeAttackVocab.streak")}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-lg font-nunito-bold text-appPurple">
            {bestStreak}
          </Text>
          <Text className="text-xs font-nunito-medium text-appDarkGrey">
            {t("timeAttackVocab.bestStreak")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TimeAttackStats;
