import React, { useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import useMatchStore from "../../../store/match-store";
import { useTimeAttackVocabGame } from "../../../hooks/useTimeAttackVocabGame";
import { useI18n } from "../../../hooks/useI18n";
import { MatchLanguage } from "../../../models/types/match-language.type";
import CountdownScreen from "../../../components/CountdownScreen";
import GameHeader from "../../../components/GameHeader";
import TranslationInput from "../../../components/TranslationInput";
import VoiceInput from "../../../components/VoiceInput";
import ExitGameModal from "../../../components/ExitGameModal";
import GameResultsScreen from "../../../components/GameResultsScreen";
import TimeAttackStats from "../../../components/TimeAttackStats";
import Button from "../../../components/Button";
import { getMatchLanguageInfo } from "../../../utils/match-language-utils";

export default function TimeAttackVocabGame() {
  const router = useRouter();
  const { t } = useI18n();
  const { resetMatch, inputMode } = useMatchStore();
  const { targetLanguage } = useLocalSearchParams();

  const targetLang = (targetLanguage as MatchLanguage) || "pt";

  const {
    gameState,
    gameResult,
    isCountingDown,
    showExitModal,
    initializeGame,
    startGame,
    submitAnswer,
    handleExitGame,
    confirmExitGame,
    cancelExitGame,
    resetGame,
  } = useTimeAttackVocabGame(targetLang);

  useEffect(() => {
    initializeGame();
    return () => {
      resetGame();
    };
  }, [initializeGame, resetGame]);

  const handleBackToMenu = () => {
    resetMatch();
    router.replace("/(private)/(tabs)/matches");
  };

  const handlePlayAgain = () => {
    initializeGame();
  };

  const handleExitToResults = () => {
    confirmExitGame();
  };

  const targetLangInfo = getMatchLanguageInfo(targetLang);

  if (isCountingDown) {
    return (
      <CountdownScreen
        currentLetter={t("timeAttackVocab.ready")}
        onCountdownComplete={startGame}
      />
    );
  }

  if (gameResult) {
    // For now, we'll create a simple results screen since the existing one is specific to WordBuilder
    return (
      <View
        className="flex-1 bg-appBgWhite"
        style={{ paddingTop: Platform.OS === "android" ? 40 : 0 }}
      >
        <SafeAreaView className="flex-1 bg-appBgWhite px-6">
          <View className="flex-1 justify-center items-center">
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
                  {t("timeAttackVocab.correctAnswers")}:
                </Text>
                <Text className="text-xl font-nunito-bold text-appBlue">
                  {gameResult.correctAnswers}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-nunito-bold text-appDarkGrey">
                  {t("timeAttackVocab.accuracy")}:
                </Text>
                <Text className="text-xl font-nunito-bold text-appPurple">
                  {gameResult.accuracy.toFixed(1)}%
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-nunito-bold text-appDarkGrey">
                  {t("timeAttackVocab.bestStreak")}:
                </Text>
                <Text className="text-xl font-nunito-bold text-appOrange">
                  {gameResult.bestStreak}
                </Text>
              </View>
            </View>

            <Button
              title={t("timeAttackVocab.playAgain")}
              onPress={handlePlayAgain}
              className="mb-4 w-full"
              bgColor="bg-appGreen"
              textColor="text-white"
              borderColor="border-appGreen"
              bgColorActivate="bg-green-600"
              borderColorActivate="border-green-600"
            />

            <Button
              title={t("timeAttackVocab.backToMenu")}
              onPress={handleBackToMenu}
              className="w-full"
              bgColor="bg-appLightGrey"
              textColor="text-appDarkGrey"
              borderColor="border-appLightGrey"
              bgColorActivate="bg-appMediumGrey"
              borderColorActivate="border-appMediumGrey"
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-appBgWhite"
      style={{ paddingTop: Platform.OS === "android" ? 40 : 0 }}
    >
      <SafeAreaView className="flex-1 bg-appBackground">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <GameHeader
            timeLeft={gameState.timeLeft}
            currentLetter={gameState.currentWord || ""}
            gameLanguage={targetLang}
            onExit={handleExitGame}
          />

          <TimeAttackStats
            correctAnswers={gameState.correctAnswers}
            incorrectAnswers={gameState.incorrectAnswers}
            totalAnswers={gameState.totalAnswers}
            streak={gameState.streak}
            bestStreak={gameState.bestStreak}
            score={gameState.score}
            timeLeft={gameState.timeLeft}
          />

          <View className="flex-1">
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-1 px-4 justify-center">
                {/* Word display area can be added here if needed */}
              </View>
            </ScrollView>

            <View className="px-0 pb-4" style={{ backgroundColor: "#fff" }}>
              {inputMode === "voice" ? (
                <VoiceInput
                  onSubmitWord={submitAnswer}
                  isGameActive={gameState.isGameActive}
                  language={
                    targetLang === "pt"
                      ? "pt-BR"
                      : targetLang === "en"
                      ? "en-US"
                      : "es-ES"
                  }
                />
              ) : (
                <TranslationInput
                  onSubmitTranslation={submitAnswer}
                  isGameActive={gameState.isGameActive}
                  wordToTranslate={gameState.currentWord}
                  fromLanguage={
                    getMatchLanguageInfo(gameState.fromLanguage).name
                  }
                  toLanguage={targetLangInfo.name}
                  placeholder={t("timeAttackVocab.enterTranslation")}
                />
              )}
            </View>
          </View>

          <ExitGameModal
            visible={showExitModal}
            onConfirm={handleExitToResults}
            onCancel={cancelExitGame}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
