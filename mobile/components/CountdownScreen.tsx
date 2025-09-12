import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useI18n from "../hooks/useI18n";

interface CountdownScreenProps {
  onCountdownComplete: () => void;
  currentLetter: string;
}

const CountdownScreen: React.FC<CountdownScreenProps> = ({
  onCountdownComplete,
  currentLetter,
}) => {
  const [countdown, setCountdown] = useState(3);
  const { t } = useI18n();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setTimeout(onCountdownComplete, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCountdownComplete]);

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite items-center justify-center">
      <Text className="text-4xl font-nunito-bold text-appDarkGrey mb-8">
        {t("wordBuilder.getReady")}
      </Text>

      <Text className="text-2xl font-nunito-medium text-appDarkGrey mb-4">
        {t("wordBuilder.letter")} {currentLetter.toUpperCase()}
      </Text>

      <Text className="text-lg font-nunito-medium text-appMediumGrey mb-8">
        {t("wordBuilder.startingIn")}
      </Text>

      {countdown > 0 && (
        <View className="w-32 h-32 bg-appDarkGrey rounded-full items-center justify-center">
          <Text className="text-6xl font-nunito-extrabold text-appBgWhite">
            {countdown}
          </Text>
        </View>
      )}

      {countdown === 0 && (
        <View className="w-32 h-32 bg-green-500 rounded-full items-center justify-center">
          <Text className="text-3xl font-nunito-extrabold text-appBgWhite">
            {t("wordBuilder.go")}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CountdownScreen;
