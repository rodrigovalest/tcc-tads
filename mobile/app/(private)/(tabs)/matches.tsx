import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView } from "react-native";
import MatchesHeader from "../../../components/MatchesHeader";
import AvailiableMatchModeCardComponent from "../../../components/AvailiableMatchModeCard";
import useI18n from "../../../hooks/useI18n";
import { AVALIABLE_MATCH_MODES } from "../../../constants/available-match-modes";

export default function Matches() {
  const { t } = useI18n();

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite px-10 pt-10">
      <View className="flex-1">
        <MatchesHeader />

        <Text className="text-4xl font-nunito-bold my-8">
          {t('match.selectGameMode')}
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
