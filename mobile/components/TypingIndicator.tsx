import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useI18n from '../hooks/useI18n';

interface TypingIndicatorProps {
  username: string;
  isVisible: boolean;
}

export default function TypingIndicator({ username, isVisible }: TypingIndicatorProps) {
  const { t } = useI18n();
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isVisible) {
      const animateDots = () => {
        const createAnimation = (dot: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0.3,
                duration: 300,
                useNativeDriver: true,
              }),
            ])
          );
        };

        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 150),
          createAnimation(dot3, 300),
        ]).start();
      };

      animateDots();
    } else {
      dot1.setValue(0.3);
      dot2.setValue(0.3);
      dot3.setValue(0.3);
    }
  }, [isVisible, dot1, dot2, dot3]);

  if (!isVisible) return null;

  return (
    <View className="mb-3 items-start">
      <View className="flex-row items-center max-w-[85%]">
        <View className="w-8 h-8 bg-appLightGrey rounded-full items-center justify-center mr-2 mb-1">
          <Ionicons name="person" size={16} color="#7C7C7F" />
        </View>
        
        <View className="bg-white border border-appLighterGray rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <View className="flex-row items-center">
            <Text className="text-sm font-nunito-regular text-appMediumGrey mr-2">
              {username} {t('chat.isTyping')}
            </Text>
            <View className="flex-row space-x-1">
              <Animated.View
                style={{
                  opacity: dot1,
                  transform: [{ scale: dot1 }],
                }}
                className="w-2 h-2 bg-appMediumGrey rounded-full"
              />
              <Animated.View
                style={{
                  opacity: dot2,
                  transform: [{ scale: dot2 }],
                }}
                className="w-2 h-2 bg-appMediumGrey rounded-full"
              />
              <Animated.View
                style={{
                  opacity: dot3,
                  transform: [{ scale: dot3 }],
                }}
                className="w-2 h-2 bg-appMediumGrey rounded-full"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
