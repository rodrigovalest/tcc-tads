import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import GuessWhoTimerComponent from "./GuessWhoTimer";

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
  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 h-full w-full justify-center items-center bg-[rgba(0,0,0,0.3)] z-50"
      pointerEvents="box-none"
    >
      <View
        className="bg-[#1E2530] px-6 py-5 rounded-2xl items-center w-[90%]"
        pointerEvents="auto"
      >
        {status === "questioning" && (
          <>
            <Text className="text-white text-xl mb-2 text-center font-nunito-bold">
              Your turn!
            </Text>
            <Text className="text-white text-center text-base mb-4">
              Ask a 'yes or no' question to find out the other person’s character
            </Text>
          </>
        )}

        {status === "answering" && (
          <>
            <Text className="text-white text-xl font-bold mb-2 text-center font-nunito-bold">
              Answer the question
            </Text>

            <View className="flex-row justify-center mt-2">
              <TouchableOpacity
                onPress={() => onAnswer?.(false)}
                className="bg-[#2E3742] px-4 py-2 rounded-full mx-2 flex-row items-center"
              >
                <Text className="text-red-400 text-lg font-bold mr-1">✗</Text>
                <Text className="text-white text-base font-nunito-semibold">NO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onAnswer?.(true)}
                className="bg-[#2E3742] px-4 py-2 rounded-full mx-2 flex-row items-center"
              >
                <Text className="text-green-400 text-lg font-bold mr-1">✓</Text>
                <Text className="text-white text-base font-nunito-semibold">YES</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {status === "waiting" && (
          <>
            <Text className="text-white text-center text-xl font-nunito-semibold">
              Waiting for your buddy to play...
            </Text>
          </>
        )}

        <View className="mt-4">
          <GuessWhoTimerComponent startTime={startTime} endTime={endTime} />
        </View>
      </View>
    </View>
  );
}
