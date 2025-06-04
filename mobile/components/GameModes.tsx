import React from "react";
import { Text, View, ScrollView } from "react-native";
import GameModeCard, { GameMode } from "./GameModeCard";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useGameModes } from "@/hooks/useGameModes";

interface GameModesProps {
  modes: GameMode[];
  title?: string;
}

const GameModes = ({ modes, title = "Modos de Jogo" }: GameModesProps) => {
  const { scrollViewPaddingBottom } = useTabBarHeight();
  const { columns, columnWidth } = useGameModes(modes);

  return (
    <View className="mt-8 px-6 flex-1">
      <Text className="text-2xl font-bold text-gray-800 mb-4 px-2">
        {title}
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: scrollViewPaddingBottom,
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} style={{ width: columnWidth }}>
              {column.map((mode) => (
                <GameModeCard key={mode.id} mode={mode} width={columnWidth} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default GameModes;
