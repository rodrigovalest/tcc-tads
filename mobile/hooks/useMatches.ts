import { useRouter } from "expo-router";
import { GameMode, PlayerType } from "@/components/GameModeCard";
import { GAME_MODES_DATA, determineIsGroupMode } from "@/utils/gameModesData";

export const useMatches = () => {
  const router = useRouter();

  const navigateToLanguageSelection = (gameMode: string, playerTypes: PlayerType[]) => {
    const isGroup = determineIsGroupMode(playerTypes);
    
    router.push({
      pathname: "/(private)/language-selection",
      params: {
        gameMode,
        isGroup: isGroup.toString(),
      },
    });
  };

  const gameModes: GameMode[] = GAME_MODES_DATA.map((mode) => ({
    ...mode,
    onPress: () => navigateToLanguageSelection(mode.title, mode.playerTypes),
  }));

  return {
    gameModes,
  };
};
