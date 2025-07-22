import IAvaliableMatchMode from "../models/interfaces/avaliable_match_mode";
import useMatchStore from "../store/match-store";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity } from "react-native";

interface AvailiableMatchModeCardProps {
  avaliableMatchMode: IAvaliableMatchMode
}

const AvailiableMatchModeCardComponent = ({
  avaliableMatchMode
}: AvailiableMatchModeCardProps) => {
  const router = useRouter();
  const { setMatchMode } = useMatchStore();

  const onClick = async () => {
    await setMatchMode(avaliableMatchMode.matchMode);
    router.push('/(private)/language-selection');
  };

  return (
    <TouchableOpacity 
      onPress={onClick}
    >
      <Image 
        source={avaliableMatchMode.image} 
        resizeMode="stretch"
        className="w-full h-full rounded-lg border-appDarkGrey border-2"  
      />
    </TouchableOpacity>
  );
}

export default AvailiableMatchModeCardComponent;
