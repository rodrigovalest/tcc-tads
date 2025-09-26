import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import useI18n from "../../../hooks/useI18n";

export default function Chat() {
  const { t } = useI18n();

  return (
    <SafeAreaView className="w-full h-full bg-appBgWhite pt-5">
      <Text className="text-4xl font-nunito-bold my-8 px-10 text-appBlack">
        {t("navigation.chat")}
      </Text>
    </SafeAreaView>
  );
}
