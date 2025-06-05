import { useRouter } from "expo-router";
import { GameMode } from "@/components/GameModeCard";
import { GAME_MODES_DATA } from "@/utils/gameModesData";

export const useMatches = () => {
  const router = useRouter();
  const navigateToLanguageSelection = (gameMode: string) => {
    router.push({
      pathname: "/(private)/language-selection",
      params: {
        gameMode,
      },
    });
  };

  const gameModes: GameMode[] = GAME_MODES_DATA.map((mode) => ({
    ...mode,
    onPress: () => navigateToLanguageSelection(mode.title),
  }));

  return {
    gameModes,
  };
};
