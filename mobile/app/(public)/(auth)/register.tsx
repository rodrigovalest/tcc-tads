import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import RegisterForm from "@/components/RegisterForm";
import Button from "@/components/Button";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
  const handleLogin = () => {
    router.replace("/(public)/(auth)/login");
  };

  function handleGoogleRegister(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <SafeAreaView
      className="flex-1 bg-appBgWhite"
      testID="register-screen-safe-area-view"
    >
      <ScrollView
        className="px-8"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={handleLogin} className="mt-2" testID="go-to-login-button">
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>

        <View className="mb-8">
          <Image
            source={require("@/assets/images/calle-dog-icon.png")}
            className="w-20 h-20 mx-auto"
          />
          <Text className="text-4xl text-center font-bold">Calle</Text>
          <Text className="text-2xl text-center font-medium font-nunito-medium">
            Create an account
          </Text>
        </View>

        <View style={{ zIndex: 1000 }}>
          <RegisterForm />
        </View>

        <View className="mt-4" style={{ zIndex: 0 }}>
          <Button
            title="Register with Google"
            onPress={handleGoogleRegister}
            className="mb-2"
            loading={false}
            textColor="text-black"
            textColorActivate="text-white"
            textSize="2xl"
            bgColor="bg-white"
            bgColorActivate="bg-black"
            borderColor="border-appLightGrey"
            borderColorActivate="border-black"
            iconLeft="google"
            iconLeftColor="black"
            iconLeftColorActivate="white"
            testID="google-register-button"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
