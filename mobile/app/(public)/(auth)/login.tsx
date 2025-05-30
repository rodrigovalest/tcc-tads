import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image } from "react-native";
import LoginForm from "@/components/LoginForm";
import Button from "../../../components/Button";
import { router } from "expo-router";

export default function Login() {
  const handleGoogleLogin = () => {
    throw new Error('Login google not implemented yet');
  }

  const handleSignUp = () => {
    router.replace('/(public)/(auth)/register');
  }

  return (
    <SafeAreaView
      className="w-full h-full bg-appBgWhite px-8"
      testID="login-screen-safe-area-view"
    >
      <View className="mt-20 mb-8">
        <Image
          source={require("@/assets/images/calle-dog-icon.png")}
          className="w-24 h-24 mx-auto"
        />

        <Text className="text-6xl text-center font-bold">
          Calle
        </Text>

        <Text className="text-4xl text-center font-medium font-nunito-medium">
          Log in or sign up
        </Text>
      </View>

      <LoginForm />

      <Text className="text-center text-2xl text-black font-medium my-8">
        or
      </Text>
      
      <Button
        title="Login with Google"
        onPress={handleGoogleLogin}
        className="mb-4"
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
        testID="google-login-button"
      />
      
      <Button
        title="Create an account"
        onPress={handleSignUp}
        className="mb-4"
        textSize="2xl"
        textColor="text-black"
        textColorActivate="text-white"
        bgColor="bg-white"
        bgColorActivate="bg-black"
        borderColor="border-appLightGrey"
        borderColorActivate="border-black"
      />
    </SafeAreaView>
  );
}
