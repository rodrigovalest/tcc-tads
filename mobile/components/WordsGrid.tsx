import React from "react";
import { View, Text, ScrollView } from "react-native";
import { COLORS } from "../constants/colors";
import useI18n from "../hooks/useI18n";

interface WordsGridProps {
  words: string[];
}

const WordsGrid: React.FC<WordsGridProps> = ({ words }) => {
  const { t } = useI18n();

  const chunkedWords = [];
  for (let i = 0; i < words.length; i += 3) {
    chunkedWords.push(words.slice(i, i + 3));
  }

  return (
    <View className="flex-1 px-4 py-2">
      <Text className="text-lg font-nunito-bold text-appDarkGrey mb-3">
        {t("wordBuilder.wordsFound")}: {words.length}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingRight: 20 }}
      >
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
      </ScrollView>
    </View>
  );
};

export default WordsGrid;
