import React, { useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import useMatchStore from "../../../../store/match-store";
import { useWordBuilderGame } from "../../../../hooks/useWordBuilderGame";
import { useI18n } from "../../../../hooks/useI18n";
import { MatchLanguage } from "../../../../models/types/match-language.type";

import CountdownScreen from "../../../../components/CountdownScreen";
import GameHeader from "../../../../components/GameHeader";
import UnifiedWordInput from "../../../../components/UnifiedWordInput";
import WordsGrid from "../../../../components/WordsGrid";
import ExitGameModal from "../../../../components/ExitGameModal";
import GameResultsScreen from "../../../../components/GameResultsScreen";

export default function WordBuilderGame() {
  const router = useRouter();
  const { t } = useI18n();
  const { matchLanguage, inputMode, resetMatch } = useMatchStore();

  const {
    gameState,
    gameResult,
    isCountingDown,
    showExitModal,
    initializeGame,
    startGame,
    addWord,
    handleExitGame,
    confirmExitGame,
    cancelExitGame,
    resetGame,
  } = useWordBuilderGame(matchLanguage as MatchLanguage);

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

  if (isCountingDown) {
    return (
      <CountdownScreen
        currentLetter={gameState.currentLetter}
        onCountdownComplete={startGame}
      />
    );
  }

  if (gameResult) {
    return (
      <GameResultsScreen
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
              currentLetter={gameState.currentLetter}
              gameLanguage={matchLanguage as MatchLanguage}
              onExit={handleExitGame}
            />
            <View className="h-3" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-4">
              <WordsGrid words={gameState.wordsFound} />
            </View>
          </ScrollView>

          <View className="px-0 pb-4">
            <UnifiedWordInput
              onSubmitWord={addWord}
              isGameActive={gameState.isGameActive}
              inputMode={inputMode || "typing"}
              language={
                matchLanguage === "pt"
                  ? "pt-BR"
                  : matchLanguage === "en"
                  ? "en-US"
                  : "es-ES"
              }
              title={
                inputMode === "voice"
                  ? t("wordBuilder.speakWord")
                  : t("wordBuilder.enterWord")
              }
              placeholder={
                inputMode === "voice"
                  ? t("wordBuilder.tapToSpeak")
                  : t("wordBuilder.enterWord")
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
