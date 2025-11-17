import React, { useEffect, useState, useMemo } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface GuessWhoTimerProps {
  startTime: Date | null;
  endTime: Date | null;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GuessWhoTimerComponent = ({ startTime, endTime }: GuessWhoTimerProps) => {
  const radius = 26;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(1);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const totalDuration = useMemo(() => {
    if (!startTime || !endTime) return 0;
    return (endTime.getTime() - startTime.getTime()) / 1000;
  }, [startTime, endTime]);

  useEffect(() => {
    if (!startTime || !endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.ceil((endTime.getTime() - now) / 1000)
      );
      setSecondsLeft(remaining);
    }, 300);

    progress.value = 1;
    progress.value = withTiming(0, {
      duration: totalDuration * 1000,
      easing: Easing.linear,
    });

    return () => clearInterval(interval);
  }, [startTime, endTime, totalDuration]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  if (!startTime || !endTime) {
    return (
      <View className="items-center justify-center">
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#192229",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-white text-lg font-bold">0</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="items-center justify-center">
      <Svg width={56} height={56} viewBox="0 0 56 56">
        <Circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#192229"
          strokeWidth={strokeWidth}
          fill="#192229"
        />

        <AnimatedCircle
          cx="28"
          cy="28"
          r={radius}
          stroke="#16A34A"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          origin="28,28"
        />
      </Svg>

      <Text className="absolute text-white text-lg font-bold">
        {secondsLeft}
      </Text>
    </View>
  );
};

export default GuessWhoTimerComponent;
