import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View } from "react-native";
import useAuthStore from "@/store/auth-store";

export default function Settings() {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-appBgWhite">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-8">Settings</Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 p-3 rounded-lg boxShadow-md"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
