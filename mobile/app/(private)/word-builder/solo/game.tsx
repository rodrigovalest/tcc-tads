import React, { useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useMatchStore from "../../../../store/match-store";
import { useWordBuilderGame } from "../../../../hooks/useWordBuilderGame";
import { MatchLanguage } from "../../../../models/types/match-language.type";
import { useI18n } from "../../../../hooks/useI18n";

// Components
import CountdownScreen from "../../../../components/CountdownScreen";
import GameHeader from "../../../../components/GameHeader";
import WordInput from "../../../../components/WordInput";
import WordsGrid from "../../../../components/WordsGrid";
import ExitGameModal from "../../../../components/ExitGameModal";
import GameResultsScreen from "../../../../components/GameResultsScreen";

export default function WordBuilderGame() {
  const router = useRouter();
  const { t } = useI18n();
  const { matchLanguage, resetMatch } = useMatchStore();

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
    // Initialize the game when component mounts
    initializeGame();

    return () => {
      // Clean up when component unmounts
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

  // Show countdown screen
  if (isCountingDown) {
    return (
      <CountdownScreen
        currentLetter={gameState.currentLetter}
        onCountdownComplete={startGame}
      />
    );
  }

  // Show game results screen
  if (gameResult) {
    return (
      <GameResultsScreen
        gameResult={gameResult}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  // Main game screen
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
          {/* Header fixo */}
          <View>
            <GameHeader
              timeLeft={gameState.timeLeft}
              currentLetter={gameState.currentLetter}
              gameLanguage={matchLanguage as MatchLanguage}
              onExit={handleExitGame}
            />
            <View className="h-3" />
          </View>

          {/* Área scrollável */}
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

          {/* Input fixo na parte inferior */}
          <View className="px-0 pb-4" style={{ backgroundColor: "#fff" }}>
            <WordInput
              onSubmitWord={addWord}
              isGameActive={gameState.isGameActive}
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
