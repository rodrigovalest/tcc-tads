import { View, Text, TouchableOpacity } from "react-native";
import GuessWhoTimerComponent from "./GuessWhoTimer";
import Animated, { SlideInUp } from "react-native-reanimated";
import useI18n from "../../hooks/useI18n";

interface GuessWhoModalProps {
  visible: boolean;
  status: "questioning" | "answering" | "waiting";
  onAnswer?: (answer: boolean) => void;
  startTime: Date | null;
  endTime: Date | null;
}

export default function GuessWhoModal({
  visible,
  status,
  onAnswer,
  startTime,
  endTime,
}: GuessWhoModalProps) {
  const { t } = useI18n();

  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 h-full w-full justify-center items-center bg-[rgba(0,0,0,0.3)] z-50"
      pointerEvents="box-none"
    >
      <Animated.View
        className="bg-[#1E2530] px-6 py-5 rounded-2xl items-center justify-center w-[90%] min-h-[160px]"
        pointerEvents="auto"
        entering={SlideInUp.springify().damping(14)}
      >
        {status === "questioning" && (
          <>
            <Text className="text-white text-xl mb-2 text-center font-nunito-bold">
              {t("guessWho.yourTurn")}
            </Text>
            <Text className="text-white text-center text-base mb-4">
              {t("guessWho.yourTurnDetails")}
            </Text>
          </>
        )}

        {status === "answering" && (
          <>
            <Text className="text-white text-xl font-bold mb-2 text-center font-nunito-bold">
              {t("guessWho.answerTitle")}
            </Text>

            <View className="flex-row justify-center mt-2">
              <TouchableOpacity
                onPress={() => onAnswer?.(false)}
                className="bg-[#2E3742] px-4 py-2 rounded-full mx-2 flex-row items-center"
              >
                <Text className="text-red-400 text-lg font-bold mr-1">✗</Text>
                <Text className="text-white text-base font-nunito-semibold">{t("common.no")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onAnswer?.(true)}
                className="bg-[#2E3742] px-4 py-2 rounded-full mx-2 flex-row items-center"
              >
                <Text className="text-green-400 text-lg font-bold mr-1">✓</Text>
                <Text className="text-white text-base font-nunito-semibold">{t("common.yes")}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {status === "waiting" && (
          <>
            <Text className="text-white text-center text-xl font-nunito-semibold">
              {t("guessWho.waitingForOpponent")}
            </Text>
          </>
        )}

        <View className="mt-4">
          <GuessWhoTimerComponent startTime={startTime} endTime={endTime} />
        </View>
      </Animated.View>
    </View>
  );
}
