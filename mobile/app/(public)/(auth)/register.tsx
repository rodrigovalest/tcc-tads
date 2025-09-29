import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import MultiStepRegisterForm from "../../../components/MultiStepRegisterForm";
import Button from "../../../components/Button";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useI18n from "../../../hooks/useI18n";
import LanguageSelector from "../../../components/LanguageSelector";
import { useGoogleRegister } from "../../../hooks/useGoogleRegister";
import { useEffect } from "react";

export default function Register() {
  const { t } = useI18n();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { clearAllForManualRegistration } = useGoogleRegister();

  const handleLogin = () => {
    router.replace("/(public)/(auth)/login");
  };

  useEffect(() => {
    if (mode === "manual") {
      clearAllForManualRegistration();
    }
  }, [mode, clearAllForManualRegistration]);

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
        <View className="flex-row justify-between items-center mt-2 mb-4">
          <TouchableOpacity onPress={handleLogin} testID="go-to-login-button">
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <LanguageSelector variant="compact" showLabel={false} />
        </View>

        <View className="mb-8">
          <Image
            source={require("../../../assets/images/calle-dog-icon.png")}
            className="w-20 h-20 mx-auto"
          />
          <Text className="text-4xl text-center font-bold text-appBlack font-nunito-bold">Calle</Text>
          <Text className="text-2xl text-center font-medium font-nunito-medium">
            {t("auth.createAccount")}
          </Text>
        </View>

        <View style={{ zIndex: 1000 }}>
          <MultiStepRegisterForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
