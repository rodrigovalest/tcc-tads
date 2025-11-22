import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLogout } from "../../../hooks/useLogout";
import { COLORS } from "../../../constants/colors";
import useI18n from "../../../hooks/useI18n";
import LanguageSelector from "../../../components/LanguageSelector";
import { useEffect, useState } from "react";
import authService from "../../../services/auth-service";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useGoogleLink } from "../../../hooks/useGoogleAuth";

export default function Settings() {
  const { mutate: logout, isPending } = useLogout();
  const { t } = useI18n();
  const { mutate: linkGoogle, isPending: linkingGoogle } = useGoogleLink();

  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [checkingGoogle, setCheckingGoogle] = useState(true);

  const loadGoogleLinkedStatus = async () => {
    try {
      const user = await authService.getGoogleUserInfo();
      setGoogleEmail(user?.email || null);
    } catch (err) {
      setGoogleEmail(null);
    } finally {
      setCheckingGoogle(false);
    }
  };

  useEffect(() => {
    loadGoogleLinkedStatus();
  }, []);

  const handleLinkGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) return;
      linkGoogle(idToken, {
        onSuccess: () => {
          loadGoogleLinkedStatus();
        },
      });
    } catch (error: any) {
      if (error?.code === "SIGN_IN_CANCELLED") return;
      console.warn("Google link error", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite pt-5">
      <Text className="text-4xl my-8 px-10 text-appBlack font-nunito-bold">
        {t("common.settings")}
      </Text>

      <View className="flex-1">
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center mb-3">
            <Ionicons
              name="language-outline"
              size={24}
              color={COLORS.appDarkGrey || "#374151"}
              style={{ marginRight: 12 }}
            />
            <Text className="text-lg text-appBlack font-nunito-bold">
              {t("settings.language")}
            </Text>
          </View>
          <LanguageSelector showLabel={false} variant="compact" />
        </View>

        {/* Google Account Linking Section */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center mb-3">
            <Ionicons
              name="logo-google"
              size={24}
              color="#4285F4"
              style={{ marginRight: 12 }}
            />
            <Text className="text-lg text-appBlack font-nunito-bold">
              {t("profile.googleAccount.title")}
            </Text>
          </View>
          {checkingGoogle ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color={COLORS.appDarkGrey} />
              <Text className="ml-3 text-appMediumGrey font-nunito-regular">
                {t("common.loading")}
              </Text>
            </View>
          ) : googleEmail ? (
            <View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text className="ml-2 text-appDarkGrey font-nunito-medium">
                  {t("profile.googleAccount.linkedTo")}: {googleEmail}
                </Text>
              </View>
              <Text className="text-xs text-appMediumGrey font-nunito-regular">
                {t("profile.googleAccount.linkDescription")}
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-appMediumGrey font-nunito-regular mb-3">
                {t("profile.googleAccount.linkDescription")}
              </Text>
              <TouchableOpacity
                onPress={handleLinkGoogle}
                disabled={linkingGoogle}
                className="flex-row items-center justify-center rounded-full px-4 py-3 bg-black"
                style={{ opacity: linkingGoogle ? 0.7 : 1 }}
              >
                <Ionicons name="logo-google" size={18} color="white" />
                <Text className="ml-2 text-white font-nunito-semibold">
                  {linkingGoogle
                    ? t("common.loading")
                    : t("profile.googleAccount.link")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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
          <Text className="text-lg text-appBlack font-nunito-bold">
            {isPending ? t("common.loading") : t("auth.logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
