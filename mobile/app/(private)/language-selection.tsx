import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Button from "@/components/Button";
import LanguageSelector from "@/components/LanguageSelector";
import PlayerModeSelector from "@/components/PlayerModeSelector";
import { useLanguageSelection } from "@/hooks/useLanguageSelection";
import { GAME_MODES_DATA } from "@/utils/gameModesData";

export default function LanguageSelection() {
  const { gameMode } = useLocalSearchParams();

  const gameData = GAME_MODES_DATA.find((mode) => mode.title === gameMode);
  const availablePlayerTypes = gameData?.playerTypes || ["solo"];

  const {
    languages,
    selectedLanguage,
    selectedPlayerType,
    title,
    buttonText,
    isButtonEnabled,
    handleLanguageSelect,
    handlePlayerTypeSelect,
    handleStartGame,
  } = useLanguageSelection(availablePlayerTypes);

  const handleBack = () => {
    router.back();
  };

  const handleStart = () => {
    handleStartGame();
  };

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4">
          <Button
            title="Voltar"
            onPress={handleBack}
            bgColor="bg-transparent"
            textColor="text-black"
            borderColor="border-transparent"
            className="py-2 px-3"
            iconLeft="arrow-left"
            iconLeftSize={20}
            iconLeftColor="black"
          />
        </View>
        <View className="px-6 pb-2">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
            {title}
          </Text>
          <Text className="text-base text-center text-gray-600 mb-8">
            Modo: {gameMode}
          </Text>
        </View>
        <PlayerModeSelector
          availablePlayerTypes={availablePlayerTypes}
          selectedPlayerType={selectedPlayerType}
          onPlayerTypeSelect={handlePlayerTypeSelect}
        />
        <View className="px-6 pb-6">
          <Button
            title={buttonText}
            onPress={handleStart}
            disabled={!isButtonEnabled}
            bgColor="bg-black"
            textColor="text-white"
            borderColor="border-black"
            bgColorActivate="bg-gray-800"
            className="py-4"
            iconRight={selectedPlayerType === "solo" ? "play" : "search"}
            iconRightSize={20}
            iconRightColor="white"
          />
        </View>
        <View className="flex-1">
          <LanguageSelector
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={handleLanguageSelect}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
