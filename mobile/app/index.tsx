import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      className="flex h-full items-center justify-center bg-appBgWhite"
    >
      <Text className="font-nunito-bold">
        Edit app/index.tsx to edit this screen
      </Text>

      <Link href={"/(private)/(tabs)/matches"}>Matches</Link>
    </View>
  );
}
