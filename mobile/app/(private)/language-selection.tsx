import { Ionicons } from "@expo/vector-icons";
import { AVALIABLE_MATCH_MODES } from "../../constants/available-match-modes";
import IAvaliableMatchMode from "../../models/interfaces/avaliable_match_mode";
import useMatchStore from "../../store/match-store";
import { useRouter } from "expo-router";
import { TouchableOpacity, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import MatchFormatSelector from "../../components/MatchFormatSelector";
import MatchLanguageSelector from "../../components/MatchLanguageSelector";

export default function LanguageSelection() {
  const {
    matchMode,
    matchFormat,
    matchLanguage,
    resetMatch,
    setMatchLanguage,
    setMatchFormat
  } = useMatchStore();
  const router = useRouter();

  if (!matchMode) {
    router.replace('/(private)/(tabs)/matches');
    return null;
  }

  const selectedMatchMode: IAvaliableMatchMode = AVALIABLE_MATCH_MODES[matchMode];

  const onBack = async () => {
    await resetMatch();
    router.replace('/(private)/(tabs)/matches');
  }

  const onPlay = () => {
    if (!matchFormat || !matchLanguage)
      return;

    router.replace('/(private)/just-chilling/waiting');
  }

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <TouchableOpacity
        className="w-full py-3 px-2 bg-appLightGrey"
        onPress={onBack}
      >
        <Ionicons
          name="chevron-back"
          size={35}
        />
      </TouchableOpacity>

      <View className="px-6 mt-20">
        <Text className="text-3xl font-nunito-bold text-appBlack mb-4">
          Play to challenge yourself!
        </Text>

        <Text className="text-xl font-nunito-medium text-appBlack mb-8">
          Game mode: {selectedMatchMode.title}
        </Text>

        <Text className="text-xl font-nunito-bold text-appBlack mb-2">
          Match format
        </Text>

        <View className="mb-8">
          <MatchFormatSelector 
            avaliableMatchFormats={selectedMatchMode.matchFormat} 
            selected={matchFormat}
            onSelect={setMatchFormat} 
          />
        </View>

        <View className="mb-8">
          <MatchLanguageSelector 
            selected={matchLanguage}
            onSelect={setMatchLanguage}
          />
        </View>

        <Button
          title={'Play'}
          onPress={onPlay}
          disabled={matchFormat === null || matchLanguage === null}
          bgColor="bg-black"
          textColor="text-white"
          borderColor="border-black"
          bgColorActivate="bg-gray-800"
          className="py-4"
          iconRight={"play"}
          iconRightSize={20}
          iconRightColor="white"
        />
      </View>
    </SafeAreaView>
  );
}
