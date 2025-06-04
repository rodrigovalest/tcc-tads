import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import GameModes from "@/components/GameModes";
import MatchesHeader from "@/components/MatchesHeader";
import { useMatches } from "@/hooks/useMatches";

export default function Matches() {
  const { gameModes } = useMatches();

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="flex-1">
        <MatchesHeader />
        <GameModes modes={gameModes} />
      </View>
    </SafeAreaView>
  );
}
