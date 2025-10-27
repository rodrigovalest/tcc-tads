import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { WordLevel } from "../services/translation/translation-service";
import useI18n from "../hooks/useI18n";

type Props = {
  selected: WordLevel | null;
  onSelect: (level: WordLevel) => void;
  disabled?: boolean;
};

const LEVELS: WordLevel[] = ["basic", "intermediate", "advanced"];

export default function VocabularyLevelSelector({
  selected,
  onSelect,
  disabled = false,
}: Props) {
  const { t } = useI18n();

  const getButtonClasses = (level: WordLevel) => {
    if (disabled) return "bg-appLightGrey border-appLightGrey";
    if (selected === level) return "bg-black border-black";
    return "border-black";
  };

  const getTextColor = (level: WordLevel) => {
    if (disabled) return "#ccc";
    if (selected === level) return "#fff";
    return "#000";
  };

  const label = (level: WordLevel) =>
    t(`timeAttackVocab.levels.${level}` as any) || level;

  return (
    <View className="flex-row justify-between gap-4">
      {LEVELS.map((level) => (
        <TouchableOpacity
          key={level}
          onPress={() => onSelect(level)}
          disabled={disabled}
          className={`flex-1 items-center p-4 rounded-lg border ${getButtonClasses(
            level
          )}`}
          accessibilityRole="button"
          accessibilityState={{ disabled, selected: selected === level }}
        >
          <Text
            style={{ color: getTextColor(level) }}
            className="text-sm font-semibold text-center"
          >
            {label(level)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
