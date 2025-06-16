import { AVALIABLE_MATCH_MODES } from "../../constants/available-match-modes";
import IAvaliableMatchMode from "../../models/interfaces/avaliable_match_mode";
import useMatchStore from "../../store/match-store";
import { useRouter } from "expo-router";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LanguageSelection() {
  const { matchMode, resetMatch, setMatchLanguage, setMatchFormat } = useMatchStore();
  const router = useRouter();

  if (!matchMode) {
    router.replace('/(private)/(tabs)/matches');
    return null;
  }

  const avaliableMatchMode: IAvaliableMatchMode = AVALIABLE_MATCH_MODES[matchMode];

  const onBack = async () => {
    await resetMatch();
    router.replace('/(private)/(tabs)/matches');
  }

  const onSelectMatchLanguage = () => {

  }

  const onSelectMatchFormat = () => {

  }

  const onPlay = () => {
    // OPEN: MOCKADO, REMOVER DEPOIS
    setMatchLanguage('en');
    setMatchFormat('duo');
    // CLOSE: MOCKADO, REMOVER DEPOIS
    router.replace('/(private)/just-chilling/waiting');
  }

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <Button onPress={onBack} title="Back" />

      <Button onPress={onPlay} title="Play" />
    </SafeAreaView>
  );
}
