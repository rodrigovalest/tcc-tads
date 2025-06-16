import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import MatchesHeader from "../../../components/MatchesHeader";
import { AVALIABLE_MATCH_MODES } from "../../../constants/available-match-modes";
import AvailiableMatchModeCardComponent from "../../../components/AvailiableMatchModeCard";

export default function Matches() {
  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="flex-1">
        <MatchesHeader />

        {Object.values(AVALIABLE_MATCH_MODES).map((mode) => (
          <View key={mode.matchMode}>
            <AvailiableMatchModeCardComponent avaliableMatchMode={mode} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
