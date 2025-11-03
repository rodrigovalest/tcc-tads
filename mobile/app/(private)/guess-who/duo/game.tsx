import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { GuessWhoStage } from "../../../../models/types/guess-who-stage.type";
import Animated, { FadeIn, FadeOut, SlideInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import useAuthStore from "../../../../store/auth-store";
import useMatchStore from "../../../../store/match-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GuessWhoDuoGame() {
  const [stage, setStage] = useState<GuessWhoStage>("intro");

  const { user: loggedUser } = useAuthStore();
  const { buddy } = useMatchStore();
  const router = useRouter();

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage("reveal"), 3000),
      setTimeout(() => setStage("game"), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <LinearGradient
      colors={["#501E3F", "#49AA8F"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex-1 items-center justify-center px-6"
    >
      {stage === "intro" && (
        <Animated.View
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(500)}
          className="items-center"
        >
          <Text className="text-appBgWhite text-4xl font-nunito-bold text-center">Guess Who?</Text>

          <View className="flex-row justify-between items-center w-full px-10 my-6">
            <View className="items-center">
              <View className="p-2 bg-appBgWhite rounded-[1000px]">
                <MaterialCommunityIcons
                  name="account"
                  size={50}
                  color={COLORS.appDarkGrey}
                />
              </View>

              <Text className="my-2 text-appDarkGrey text-xl font-nunito-medium">
                {loggedUser?.username || "You"}
              </Text>
            </View>

            <Text className="text-appBgWhite text-2xl font-nunito-bold">
              vs.
            </Text>

            <View className="items-center">
              <View className="p-2 bg-appBgWhite rounded-[1000px]">
                <MaterialCommunityIcons
                  name="account"
                  size={50}
                  color={COLORS.appDarkGrey}
                />
              </View>

              <Text className="my-2 text-appDarkGrey text-xl font-nunito-medium">
                {buddy?.username || "Buddy"}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {stage === "reveal" && (
        <Animated.View
          entering={SlideInUp.springify().damping(14)}
          exiting={FadeOut.duration(400)}
          className="items-center"
        >
          <Text className="text-white text-3xl font-semibold">
            Buddy é: 👩‍🚀 Astronauta!
          </Text>
        </Animated.View>
      )}

      {stage === "game" && (
        <Animated.View entering={FadeIn.duration(800)} className="items-center">
          <Text className="text-white text-2xl font-semibold">Tabuleiro</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}
