import React, { useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import useTimeAttackVocabStore from "../../../../store/time-attack-vocab-store";
import { useTimeAttackVocabGame } from "../../../../hooks/useTimeAttackVocabGame";
import useI18n from "../../../../hooks/useI18n";
import { MatchLanguage } from "../../../../models/types/match-language.type";

import CountdownScreen from "../../../../components/CountdownScreen";
import GameHeader from "../../../../components/GameHeader";
import UnifiedWordInput from "../../../../components/UnifiedWordInput";
import ExitGameModal from "../../../../components/ExitGameModal";
import TimeAttackVocabResultsScreen from "../../../../components/TimeAttackVocabResultsScreen";

export default function TimeAttackVocabGame() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    sourceLanguage,
    targetLanguage,
    inputMode,
    level,
    resetTimeAttackVocab,
  } = useTimeAttackVocabStore();

  const {
    gameState,
    gameResult,
    isCountingDown,
    showExitModal,
    initializeGame,
    startGame,
    submitTranslation,
    handleExitGame,
    confirmExitGame,
    cancelExitGame,
    resetGame,
  } = useTimeAttackVocabGame(
    sourceLanguage as MatchLanguage,
    targetLanguage as MatchLanguage,
    level
  );

  useEffect(() => {
    if (!sourceLanguage || !targetLanguage || !inputMode) {
      router.navigate("/(private)/language-selection" as any);
      return;
    }

    initializeGame();

    return () => {
      resetGame();
    };
  }, [
    sourceLanguage,
    targetLanguage,
    inputMode,
    initializeGame,
    resetGame,
    router,
  ]);

  const handleBackToMenu = () => {
    resetTimeAttackVocab();
    router.replace("/(private)/(tabs)/matches");
  };

  const handlePlayAgain = () => {
    initializeGame();
  };

  const handleExitToResults = () => {
    confirmExitGame();
  };

  if (!sourceLanguage || !targetLanguage || !inputMode) {
    return null;
  }

  if (isCountingDown) {
    return (
      <CountdownScreen
        currentLetter={`${sourceLanguage.toUpperCase()} → ${targetLanguage.toUpperCase()}`}
        onCountdownComplete={startGame}
      />
    );
  }

  if (gameResult) {
    return (
      <TimeAttackVocabResultsScreen
        gameResult={gameResult}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return (
    <View
      className="flex-1 bg-appBgWhite"
      style={{ paddingTop: Platform.OS === "android" ? 40 : 0 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          <View>
            <GameHeader
              timeLeft={gameState.timeLeft}
              currentLetter={`${sourceLanguage.toUpperCase()} → ${targetLanguage.toUpperCase()}`}
              gameLanguage={sourceLanguage as MatchLanguage}
              onExit={handleExitGame}
              gameType="time-attack-vocab"
            />
            <View className="h-3" />
          </View>

          <View className="flex-1 px-6 justify-center">
            <View className="bg-white rounded-xl p-4 mb-8 border-2 border-appDarkGrey shadow-lg">
              <Text className="text-lg font-nunito-semibold text-appMediumGrey text-center mb-2">
                {t("timeAttackVocab.translateThis")}
              </Text>
              <Text className="text-4xl font-nunito-extrabold text-appBlack text-center mb-4">
                {gameState.currentWord}
              </Text>
              <Text className="text-base font-nunito-medium text-appMediumGrey text-center">
                {t("timeAttackVocab.from")} {sourceLanguage.toUpperCase()}{" "}
                {t("timeAttackVocab.to")} {targetLanguage.toUpperCase()}
              </Text>
            </View>

            <View className="bg-appLightGrey rounded-xl p-6 mb-8 border border-appMediumGrey">
              <View className="flex-row justify-between mb-2">
                <Text className="text-lg font-nunito-bold text-appDarkGrey">
                  {t("timeAttackVocab.score")}:
                </Text>
                <Text className="text-xl font-nunito-extrabold text-green-600">
                  {gameState.score}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-lg font-nunito-bold text-appDarkGrey">
                  {t("timeAttackVocab.wordsTranslated")}:
                </Text>
                <Text className="text-xl font-nunito-extrabold text-appDarkGrey">
                  {gameState.wordsTranslated}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-0 pb-4">
            <UnifiedWordInput
              onSubmitWord={submitTranslation}
              isGameActive={gameState.isGameActive}
              inputMode={inputMode || "typing"}
              language={
                targetLanguage === "pt"
                  ? "pt-BR"
                  : targetLanguage === "en"
                  ? "en-US"
                  : "es-ES"
              }
              title={
                inputMode === "voice"
                  ? t("timeAttackVocab.speakTranslation")
                  : t("timeAttackVocab.typeTranslation")
              }
              placeholder={
                inputMode === "voice"
                  ? t("timeAttackVocab.tapToSpeak")
                  : t("timeAttackVocab.enterTranslation")
              }
            />
          </View>
        </View>

        <ExitGameModal
          visible={showExitModal}
          onConfirm={handleExitToResults}
          onCancel={cancelExitGame}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
