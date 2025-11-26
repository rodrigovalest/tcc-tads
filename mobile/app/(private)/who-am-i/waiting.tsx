import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "../../../constants/colors";

export default function WhoAmIWaiting() {
  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator size="large" color={COLORS.appBlack} />
        <Text className="text-2xl text-center text-appBlack font-nunito-bold mt-6">
          Waiting for opponent...
        </Text>
      </View>
    </SafeAreaView>
  );
}
