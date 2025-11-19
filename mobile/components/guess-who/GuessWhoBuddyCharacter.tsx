import { CHARACTERS } from "../../constants/guess-who-characters";
import { View, Text, Image } from "react-native";

interface IGuessWhoBuddyCharacterComponentProps {
  image: string;
  name: string;
}

export function GuessWhoBuddyCharacterComponent({
  image,
  name,
}: IGuessWhoBuddyCharacterComponentProps) {
  return (
    <View className="bg-[#E5FF55] rounded-2xl pb-2 px-4 items-center mt-12 w-auto">
      <View className="absolute -top-12">
        <Image
          source={CHARACTERS[image]}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      <Text className="text-appDarkGrey text-xs font-nunito-medium mt-10">
        Buddy character's is
      </Text>

      <Text className="text-appDarkGrey text-xl font-nunito-bold">
        {name}
      </Text>
    </View>
  );
}
