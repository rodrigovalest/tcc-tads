import React, { useEffect } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useMatchStore from "../../../../store/match-store";
import { useWordBuilderGame } from "../../../../hooks/useWordBuilderGame";
import { MatchLanguage } from "../../../../models/types/match-language.type";

// Components
import CountdownScreen from "../../../../components/CountdownScreen";
import GameHeader from "../../../../components/GameHeader";
import WordInput from "../../../../components/WordInput";
import WordsGrid from "../../../../components/WordsGrid";
import ExitGameModal from "../../../../components/ExitGameModal";
import GameResultsScreen from "../../../../components/GameResultsScreen";

export default function WordBuilderGame() {
  const router = useRouter();
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
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Header with timer and exit button */}
          <GameHeader
            timeLeft={gameState.timeLeft}
            currentLetter={gameState.currentLetter}
            onExit={handleExitGame}
          />
          <View className="flex-1">
            {/* Words grid */}
            <WordsGrid words={gameState.wordsFound} />
          </View>
          <View className="flex-1">
            {/* Word input - at bottom to stay above keyboard */}
            <WordInput
              onSubmitWord={addWord}
              isGameActive={gameState.isGameActive}
            />
          </View>
        </View>

        {/* Exit confirmation modal */}
        <ExitGameModal
          visible={showExitModal}
          onConfirm={handleExitToResults}
          onCancel={cancelExitGame}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
