import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { COLORS } from "../constants/colors";
import useI18n from "../hooks/useI18n";

interface WordsGridProps {
  words: string[];
}

const WordsGrid: React.FC<WordsGridProps> = ({ words }) => {
  const { t } = useI18n();

  const chunkedWords = [];
  for (let i = 0; i < words.length; i += 5) {
    chunkedWords.push(words.slice(i, i + 5));
  }

  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const onLayoutContainer = useCallback((e: any) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const onContentSizeChange = useCallback((w: number) => {
    setContentWidth(w);
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  }, []);

  const hasOverflow = contentWidth > containerWidth + 8; // small buffer
  const atEnd = scrollX + containerWidth >= contentWidth - 12;
  const showGradient = hasOverflow && !atEnd;

  return (
    <View className="flex-1 px-4 py-2" onLayout={onLayoutContainer}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-nunito-bold text-appDarkGrey">
          {t("wordBuilder.wordsFound")}: {words.length}
        </Text>
        {hasOverflow && (
          <Text className="text-xs font-nunito-medium text-appMediumGrey">
            {t("wordBuilder.scrollHint")}
          </Text>
        )}
      </View>

      <ScrollView
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={hasOverflow}
        className="flex-1"
        contentContainerStyle={{ paddingRight: 32 }}
        onContentSizeChange={(w) => onContentSizeChange(w)}
      >
        {words.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-base font-nunito-medium text-appMediumGrey text-center">
              {t("wordBuilder.noWordsYet")}
            </Text>
          </View>
        ) : (
          <View className="flex-row">
            {chunkedWords.map((column, columnIndex) => (
              <View key={columnIndex} className="mr-4">
                {column.map((word, wordIndex) => (
                  <View
                    key={`${columnIndex}-${wordIndex}`}
                    className="bg-appLightGrey rounded-lg px-3 py-2 mb-2 border border-appMediumGrey"
                  >
                    <Text className="text-base font-nunito-medium text-appDarkGrey">
                      {word}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {showGradient && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 42, // below header row
            right: 0,
            bottom: 0,
            width: 50,
            backgroundColor: "transparent",
            justifyContent: "center",
          }}
        >
          {/* Faux gradient using layered views to avoid dependency */}
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.appBgWhite,
              opacity: 0.65,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
          <Text
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              fontSize: 40,
              color: COLORS.appMediumGrey,
              fontFamily: "Nunito-SemiBold",
            }}
          >
            →
          </Text>
        </View>
      )}
    </View>
  );
};

export default WordsGrid;
