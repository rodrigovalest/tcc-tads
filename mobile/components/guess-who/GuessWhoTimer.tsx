import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface GuessWhoTimerProps {
  startTime: Date;
  endTime: Date;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GuessWhoTimerComponent = ({ startTime, endTime }: GuessWhoTimerProps) => {
  const totalDuration = (endTime.getTime() - startTime.getTime()) / 1000;
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(totalDuration));
  const progress = useSharedValue(1);

  const radius = 26;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.ceil((endTime.getTime() - now) / 1000));
      setSecondsLeft(remaining);
    }, 500);

    progress.value = withTiming(
      0,
      {
        duration: totalDuration * 1000,
        easing: Easing.linear,
      },
      () => {}
    );

    return () => clearInterval(interval);
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View className="items-center justify-center">
      <Svg width={56} height={56} viewBox="0 0 56 56">
        {/* Fundo do círculo */}
        <Circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#192229"
          strokeWidth={strokeWidth}
          fill="#192229"
        />

        {/* Borda animada */}
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
