import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image } from "react-native";
import RegisterForm from "@/components/RegisterForm";
import Button from "../../../components/Button";
import { router } from "expo-router";

export default function Register() {
  const handleLogin = () => {
    router.replace("/(public)/(auth)/login");
  };

  return (
    <SafeAreaView
      className="w-full h-full bg-appBgWhite px-8"
      testID="register-screen-safe-area-view"
    >
      <View className="mt-4 mb-8">
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

      <View className="mt-2" style={{ zIndex: 0 }}>
        <Text className="text-center text-2xl text-black font-medium mb-4">
          or
        </Text>

        <Button
          title="Login"
          onPress={handleLogin}
          className=""
          textSize="2xl"
          textColor="text-black"
          textColorActivate="text-white"
          bgColor="bg-white"
          bgColorActivate="bg-black"
          borderColor="border-appLightGrey"
          borderColorActivate="border-black"
        />
      </View>
    </SafeAreaView>
  );
}
