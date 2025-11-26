import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function WhoAmIGame() {
  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl text-center text-appBlack font-nunito-bold">
          Who Am I Game - Coming Soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
