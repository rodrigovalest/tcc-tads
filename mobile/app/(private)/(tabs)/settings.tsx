import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View } from "react-native";
import { useLogout } from "@/hooks/useLogout";

export default function Settings() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-appBgWhite">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-8">Settings</Text>
        <TouchableOpacity
          onPress={() => logout()}
          className="bg-red-500 p-3 rounded-lg boxShadow-md"
          disabled={isPending}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isPending ? 'Saindo...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
