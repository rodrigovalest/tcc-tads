import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView } from "react-native";
import MatchesHeader from "../../../components/MatchesHeader";
import { AVALIABLE_MATCH_MODES } from "../../../constants/available-match-modes";
import AvailiableMatchModeCardComponent from "../../../components/AvailiableMatchModeCard";

export default function Matches() {
  return (
    <SafeAreaView className="flex-1 bg-appBgWhite px-10 pt-10">
      <View className="flex-1">
        <MatchesHeader />

        <Text className="text-4xl font-nunito-bold my-8">
          Select game mode
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {Object.values(AVALIABLE_MATCH_MODES).map((mode) => (
            <View key={mode.matchMode} className="w-1/2 px-2 mb-6 h-64">
              <AvailiableMatchModeCardComponent avaliableMatchMode={mode} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
