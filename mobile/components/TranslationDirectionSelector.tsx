import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MatchLanguage } from "../models/types/match-language.type";
import { getMatchLanguageInfo } from "../utils/match-language-utils";
import { COLORS } from "../constants/colors";
import useI18n from "../hooks/useI18n";

interface TranslationDirectionSelectorProps {
  fromLanguage: MatchLanguage;
  toLanguage: MatchLanguage;
  onSwapLanguages: () => void;
  disabled?: boolean;
}

const TranslationDirectionSelector: React.FC<
  TranslationDirectionSelectorProps
> = ({ fromLanguage, toLanguage, onSwapLanguages, disabled = false }) => {
  const { t } = useI18n();

  const fromLangInfo = getMatchLanguageInfo(fromLanguage);
  const toLangInfo = getMatchLanguageInfo(toLanguage);

  return (
    <View className="px-4 mb-4">
      <Text className="text-sm font-nunito-semibold text-appDarkGrey mb-2 text-center">
        {t("timeAttackVocab.translationDirection")}
      </Text>

      <View className="flex-row items-center justify-center bg-appLightGrey rounded-xl p-3">
        <View className="flex-1 items-center">
          <Text className="text-2xl mb-1">{fromLangInfo.flag}</Text>
          <Text className="text-sm font-nunito-semibold text-appDarkGrey text-center">
            {fromLangInfo.name}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onSwapLanguages}
          disabled={disabled}
          className={`mx-4 p-2 rounded-full ${
            disabled ? "bg-appMediumGrey" : "bg-appBlue"
          }`}
        >
          <MaterialIcons
            name="swap-horiz"
            size={24}
            color={disabled ? COLORS.appDarkGrey : "white"}
          />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-2xl mb-1">{toLangInfo.flag}</Text>
          <Text className="text-sm font-nunito-semibold text-appDarkGrey text-center">
            {toLangInfo.name}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TranslationDirectionSelector;
