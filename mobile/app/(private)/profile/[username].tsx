import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";

export default function SeeUserProfile() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  const onBack = async () => {
    router.canGoBack() ? router.back() : router.replace("/(private)/(tabs)/history");
  }

  return (
    <SafeAreaView
      className="flex-1 bg-appBgWhite pb-10"
      testID="language-selection-screen"
    >
      <TouchableOpacity
        className="w-full py-3 px-2 bg-appLightGrey"
        onPress={onBack}
        testID="back-button"
      >
        <Ionicons
          name="chevron-back"
          size={35}
        />
      </TouchableOpacity>

      <ScrollView
        className="flex-1 bg-appBgWhite"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-xl font-bold">Perfil do usuário</Text>
          <Text className="text-lg mt-2">{username}</Text>
          <Text className="text-lg mt-2">Em desenvolvimento 🏗️🏗️🏗️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
