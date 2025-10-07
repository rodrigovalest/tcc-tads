import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/Button";
import useI18n from "../../../hooks/useI18n";

export default function Chat() {
  const { t } = useI18n();

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite px-6 pt-6">
      <View className="flex-1 justify-center items-center">
        <View className="w-28 h-28 bg-appLightGrey rounded-full items-center justify-center mb-8 shadow-sm">
          <View className="w-20 h-20 bg-appBgBeige rounded-full items-center justify-center">
            <Ionicons name="chatbubbles" size={40} color="#262B2A" />
          </View>
        </View>
        
        <Text className="text-3xl font-nunito-bold text-appBlack mb-4 text-center">
          {t('friends.conversations')}
        </Text>
        
        <Text className="text-base font-nunito-regular text-appMediumGrey mb-10 text-center px-4 leading-6">
          {t('friends.conversationsDescription')}
        </Text>
        
        <Button
          title={t('friends.viewConversations')}
          onPress={() => router.push('/(private)/friends/conversations')}
          className="w-full mb-4"
          bgColor="bg-appBlack"
          textColor="text-white"
          iconRight="chatbubble-ellipses"
          iconRightSize={18}
        />
        
        <Button
          title={t('friends.friends')}
          onPress={() => router.push('/(private)/friends')}
          className="w-full"
          bgColor="bg-appLightGrey"
          textColor="text-appBlack"
          iconRight="people"
          iconRightSize={18}
        />
      </View>
    </SafeAreaView>
  );
}
