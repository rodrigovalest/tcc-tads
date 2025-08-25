import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IWordBuilderGameResult } from "../models/interfaces/word_builder_game";
import Button from "./Button";
import useI18n from "../hooks/useI18n";
import { COLORS } from "../constants/colors";

interface GameResultsScreenProps {
  gameResult: IWordBuilderGameResult;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const GameResultsScreen: React.FC<GameResultsScreenProps> = ({
  gameResult,
  onPlayAgain,
  onBackToMenu,
}) => {
  const { t } = useI18n();

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite px-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-8">
          <Text className="text-4xl font-nunito-extrabold text-appDarkGrey mb-4">
            {t("wordBuilder.gameOver")}
          </Text>

          <View className="bg-appLightGrey rounded-xl p-6 w-full border-2 border-appDarkGrey mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("wordBuilder.finalScore")}:
              </Text>
              <Text className="text-2xl font-nunito-extrabold text-green-600">
                {gameResult.score}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("wordBuilder.wordsFound")}:
              </Text>
              <Text className="text-xl font-nunito-bold text-appDarkGrey">
                {gameResult.wordsFound.length}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("wordBuilder.correctWords")}:
              </Text>
              <Text className="text-xl font-nunito-bold text-green-600">
                {gameResult.correctWords.length}
              </Text>
            </View>
          </View>

          {gameResult.evaluations && (
            <View className="w-full mb-6">
              <Text className="text-xl font-nunito-bold text-appDarkGrey mb-3">
                {t("wordBuilder.wordsFound")} ({gameResult.evaluations.length})
              </Text>
              <View className="bg-appLightGrey rounded-lg p-4 border border-appMediumGrey">
                {gameResult.evaluations.length === 0 && (
                  <Text className="text-base font-nunito-medium text-appMediumGrey">
                    —
                  </Text>
                )}
                {gameResult.evaluations.map((ev, idx) => (
                  <View key={idx} className="flex-row items-center mb-2">
                    <Text
                      className={`mr-3 text-lg font-nunito-extrabold ${
                        ev.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {ev.isCorrect ? "✓" : "✗"}
                    </Text>
                    <Text className="text-base font-nunito-medium text-appDarkGrey flex-1">
                      {ev.word}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {gameResult.correctWords.length > 0 && (
            <View className="w-full mb-6">
              <Text className="text-xl font-nunito-bold text-appDarkGrey mb-3">
                ✅ {t("wordBuilder.correctWords")}:
              </Text>
              <View className="bg-green-50 rounded-lg p-4 border border-green-200">
                <View className="flex-row flex-wrap">
                  {gameResult.correctWords.map((word, index) => (
                    <View
                      key={index}
                      className="bg-green-100 rounded-lg px-3 py-1 m-1 border border-green-300"
                    >
                      <Text className="text-base font-nunito-medium text-green-800">
                        {word}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {gameResult.incorrectWords.length > 0 && (
            <View className="w-full mb-6">
              <Text className="text-xl font-nunito-bold text-appDarkGrey mb-3">
                ❌ {t("wordBuilder.incorrectWords")}:
              </Text>
              <View className="bg-red-50 rounded-lg p-4 border border-red-200">
                <View className="flex-row flex-wrap">
                  {gameResult.incorrectWords.map((word, index) => (
                    <View
                      key={index}
                      className="bg-red-100 rounded-lg px-3 py-1 m-1 border border-red-300"
                    >
                      <Text className="text-base font-nunito-medium text-red-800">
                        {word}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="pb-6">
        <Button
          title={t("wordBuilder.playAgain")}
          onPress={onPlayAgain}
          className="mb-3"
          bgColor="bg-appDarkGrey"
          bgColorActivate="bg-appBlack"
          textColor="text-appBgWhite"
          textColorActivate="text-appBgWhite"
          textSize="lg"
        />

        <Button
          title={t("wordBuilder.backToMenu")}
          onPress={onBackToMenu}
          bgColor="bg-appLightGrey"
          bgColorActivate="bg-appMediumGrey"
          textColor="text-appDarkGrey"
          textColorActivate="text-appDarkGrey"
          textSize="lg"
        />
      </View>
    </SafeAreaView>
  );
};

export default GameResultsScreen;
