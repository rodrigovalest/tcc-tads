import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ScrollView } from "react-native";
import LoginForm from "../../../components/LoginForm";
import Button from "../../../components/Button";
import { router } from "expo-router";
import useI18n from "../../../hooks/useI18n";
import LanguageSelector from "../../../components/LanguageSelector";

export default function Login() {
  const { t } = useI18n();

  const handleGoogleLogin = () => {
    throw new Error('Login google not implemented yet');
  }

  const handleSignUp = () => {
    router.replace('/(public)/(auth)/register');
  }

  return (
    <SafeAreaView
      className="w-full h-full bg-appBgWhite"
      testID="login-screen-safe-area-view"
    >
      <ScrollView 
        className="flex-1 px-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        <View className="flex-row justify-end mt-4 mb-4">
          <LanguageSelector variant="compact" showLabel={false} />
        </View>

        <View className="mt-16 mb-6">
          <Image
            source={require("../../../assets/images/calle-dog-icon.png")}
            className="w-24 h-24 mx-auto"
          />

          <Text className="text-6xl text-center font-bold text-appBlack font-nunito-bold mt-2">
            Calle
          </Text>

          <Text className="text-4xl text-center font-medium font-nunito-medium">
            {t('auth.loginOrSignUp')}
          </Text>
        </View>

        <LoginForm />

        <Text className="text-center text-2xl text-black font-medium my-8">
          {t('auth.or')}
        </Text>
        
        <Button
          title={t('auth.loginWithGoogle')}
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
          title={t('auth.createAccount')}
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
      </ScrollView>
    </SafeAreaView>
  );
}
