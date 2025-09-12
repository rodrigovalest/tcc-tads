import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { InputMode } from "../models/types/input-mode.type";
import useI18n from "../hooks/useI18n";

interface InputModeSelectorProps {
  selected: InputMode | null;
  onSelect: (mode: InputMode) => void;
  disabled?: boolean;
}

const InputModeSelector: React.FC<InputModeSelectorProps> = ({
  selected,
  onSelect,
  disabled = false,
}) => {
  const { t } = useI18n();

  const getColor = (mode: InputMode) => {
    if (disabled) return "#ccc";
    if (selected === mode) return "#fff";
    return "#000";
  };

  const getButtonClasses = (mode: InputMode) => {
    if (disabled) return "bg-appLightGrey border-appLightGrey";
    if (selected === mode) return "bg-black border-black";
    return "border-black";
  };

  return (
    <View className="mb-6">
      <Text className="text-xl font-nunito-bold text-appBlack mb-2">
        {t("wordBuilder.inputMode")}
      </Text>

      <View className="flex-row justify-between space-x-4 gap-4">
        <TouchableOpacity
          onPress={() => onSelect("typing")}
          disabled={disabled}
          className={`flex-1 items-center p-4 rounded-lg border ${getButtonClasses(
            "typing"
          )}`}
        >
          <FontAwesome name="keyboard-o" size={24} color={getColor("typing")} />
          <Text
            style={{ color: getColor("typing") }}
            className="mt-2 text-sm font-semibold text-center"
          >
            {t("wordBuilder.typing")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelect("voice")}
          disabled={disabled}
          className={`flex-1 items-center p-4 rounded-lg border ${getButtonClasses(
            "voice"
          )}`}
        >
          <MaterialIcons name="mic" size={24} color={getColor("voice")} />
          <Text
            style={{ color: getColor("voice") }}
            className="mt-2 text-sm font-semibold text-center"
          >
            {t("wordBuilder.voice")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InputModeSelector;
