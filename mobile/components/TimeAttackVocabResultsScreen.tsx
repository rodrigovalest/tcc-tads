import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ITimeAttackVocabGameResult } from "../models/interfaces/time_attack_vocab_game";
import Button from "./Button";
import useI18n from "../hooks/useI18n";
import { COLORS } from "../constants/colors";
import { useQueryClient } from "@tanstack/react-query";

interface TimeAttackVocabResultsScreenProps {
  gameResult: ITimeAttackVocabGameResult;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const TimeAttackVocabResultsScreen: React.FC<
  TimeAttackVocabResultsScreenProps
> = ({ gameResult, onPlayAgain, onBackToMenu }) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["matchHistory"] });
  }, [queryClient]);

  const handleBackToMenu = () => {
    onBackToMenu();
  };

  const correctWords = gameResult.evaluations.filter((e) => e.isCorrect);
  const incorrectWords = gameResult.evaluations.filter((e) => !e.isCorrect);

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite px-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-8">
          <Text className="text-4xl font-nunito-extrabold text-appDarkGrey mb-4">
            {t("timeAttackVocab.gameOver")}
          </Text>

          <View className="bg-appLightGrey rounded-xl p-6 w-full border-2 border-appDarkGrey mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("timeAttackVocab.finalScore")}:
              </Text>
              <Text className="text-2xl font-nunito-extrabold text-green-600">
                {gameResult.score}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("timeAttackVocab.wordsTranslated")}:
              </Text>
              <Text className="text-xl font-nunito-extrabold text-appDarkGrey">
                {gameResult.wordsTranslated}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("timeAttackVocab.correctTranslations")}:
              </Text>
              <Text className="text-xl font-nunito-extrabold text-green-600">
                {gameResult.correctTranslations}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("timeAttackVocab.incorrectTranslations")}:
              </Text>
              <Text className="text-xl font-nunito-extrabold text-red-600">
                {gameResult.incorrectTranslations}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-nunito-bold text-appDarkGrey">
                {t("timeAttackVocab.avgTimePerWord")}:
              </Text>
              <Text className="text-xl font-nunito-extrabold text-appDarkGrey">
                {gameResult.averageTimePerWord.toFixed(1)}s
              </Text>
            </View>
          </View>

          <View className="bg-blue-50 rounded-xl p-4 w-full border border-blue-200 mb-6">
            <Text className="text-lg font-nunito-semibold text-blue-800 text-center mb-2">
              {gameResult.sourceLanguage.toUpperCase()} →{" "}
              {gameResult.targetLanguage.toUpperCase()}
            </Text>
            <Text className="text-sm font-nunito-medium text-blue-600 text-center">
              {t("timeAttackVocab.gameMode")}
            </Text>
          </View>

          {gameResult.evaluations && gameResult.evaluations.length > 0 && (
            <View className="w-full mb-6">
              <Text className="text-xl font-nunito-bold text-appDarkGrey mb-3">
                {t("timeAttackVocab.wordsTranslated")} (
                {gameResult.evaluations.length})
              </Text>
              <View className="bg-appLightGrey rounded-lg p-4 border border-appMediumGrey">
                <View className="flex-row flex-wrap">
                  {correctWords.map((evaluation, index) => (
                    <View
                      key={`correct-${index}`}
                      className="bg-green-100 rounded-lg px-3 py-2 m-1 border border-green-300"
                    >
                      <Text className="text-base font-nunito-medium text-green-800">
                        {evaluation.word} → {evaluation.userTranslation}
                      </Text>
                      <Text className="text-xs font-nunito-regular text-green-600">
                        {evaluation.timeSpent.toFixed(1)}s
                      </Text>
                    </View>
                  ))}
                  {incorrectWords.map((evaluation, index) => (
                    <View
                      key={`incorrect-${index}`}
                      className="bg-red-100 rounded-lg px-3 py-2 m-1 border border-red-300"
                    >
                      <Text className="text-base font-nunito-medium text-red-800">
                        {evaluation.word} → {evaluation.userTranslation}
                      </Text>
                      <Text className="text-xs font-nunito-regular text-red-600">
                        {evaluation.timeSpent.toFixed(1)}s
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
          title={t("timeAttackVocab.playAgain")}
          onPress={onPlayAgain}
          className="mb-3"
          bgColor="bg-appDarkGrey"
          bgColorActivate="bg-appBlack"
          textColor="text-appBgWhite"
          textColorActivate="text-appBgWhite"
          textSize="lg"
        />

        <Button
          title={t("timeAttackVocab.backToMenu")}
          onPress={handleBackToMenu}
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

export default TimeAttackVocabResultsScreen;
