import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLogout } from "@/hooks/useLogout";
import { COLORS } from "@/constants/colors";

export default function Settings() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <View className="flex-1">

        <TouchableOpacity className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
          <Ionicons
            name="person-outline"
            size={24}
            color={COLORS.appDarkGrey || "#374151"}
            style={{ marginRight: 12 }}
          />
          <Text className="text-lg font-medium text-gray-700">
            Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
          <Ionicons
            name="language-outline"
            size={24}
            color={COLORS.appDarkGrey || "#374151"}
            style={{ marginRight: 12 }}
          />
          <Text className="text-lg font-medium text-gray-700">
            Language
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => logout()}
          className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100"
          disabled={isPending}
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={COLORS.appDarkGrey || "#374151"}
            style={{ marginRight: 12 }}
          />
          <Text className="text-lg font-medium text-gray-700">
            {isPending ? 'Saindo...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}