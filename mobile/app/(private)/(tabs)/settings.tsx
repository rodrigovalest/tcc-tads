import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLogout } from "../../../hooks/useLogout";
import { COLORS } from "../../../constants/colors";
import useI18n from "../../../hooks/useI18n";
import LanguageSelector from "../../../components/LanguageSelector";

export default function Settings() {
  const { mutate: logout, isPending } = useLogout();
  const { t } = useI18n();

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite pt-5">
      <Text className="text-4xl my-8 px-10 text-appBlack font-nunito-bold">
        {t('common.settings')}
      </Text>

      <View className="flex-1">
        <TouchableOpacity className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
          <Ionicons
            name="person-outline"
            size={24}
            color={COLORS.appDarkGrey || "#374151"}
            style={{ marginRight: 12 }}
          />
          <Text className="text-lg text-appBlack font-nunito-bold">
            {t('settings.account')}
          </Text>
        </TouchableOpacity>

        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center mb-3">
            <Ionicons
              name="language-outline"
              size={24}
              color={COLORS.appDarkGrey || "#374151"}
              style={{ marginRight: 12 }}
            />
            <Text className="text-lg text-appBlack font-nunito-bold">
              {t('settings.language')}
            </Text>
          </View>
          <LanguageSelector showLabel={false} variant="compact" />
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
            {isPending ? t('common.loading') : t('auth.logout')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}