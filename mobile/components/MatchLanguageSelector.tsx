import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MatchLanguage } from "@/models/types/match-language.type";
import { getLocalizedMatchLanguages } from "../constants/avaliable-match-languages";
import useI18n from "../hooks/useI18n";
import { SUPPORTED_LANGUAGES } from "../constants/languages";

interface MatchLanguageSelectorProps {
  selected: MatchLanguage | null;
  onSelect: (value: MatchLanguage) => void;
  availableLanguages?: MatchLanguage[];
}

const MatchLanguageSelector = ({
  selected,
  onSelect,
  availableLanguages,
}: MatchLanguageSelectorProps) => {
  const { t } = useI18n();
  const [query, setQuery] = useState<string>("");

  const items = useMemo(() => {
    const map = getLocalizedMatchLanguages();
    const allItems = Object.entries(map).map(([value, label]) => ({
      value: value as MatchLanguage,
      label: label as string,
    }));

    const filteredItems = availableLanguages
      ? allItems.filter((item) => availableLanguages.includes(item.value))
      : allItems;

    return filteredItems.sort((a, b) => a.label.localeCompare(b.label));
  }, [availableLanguages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) || i.value.toLowerCase().includes(q)
    );
  }, [items, query]);

  const getEmojiForLanguage = (value: MatchLanguage): string => {
    const found = SUPPORTED_LANGUAGES.find((l) =>
      l.code.toLowerCase().startsWith(`${value.toLowerCase()}-`)
    );
    if (found?.emoji) return found.emoji;
    const fallback: Record<MatchLanguage, string> = {
      en: "🇬🇧",
      pt: "🇧🇷",
      es: "🇪🇸",
    };
    return fallback[value];
  };

  return (
    <View>
      <View className="flex-row items-center px-3 py-2 bg-white rounded-lg border border-gray-300 mb-3">
        <Ionicons name="search" size={18} color="#9ca3af" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("match.selectLanguage")}
          className="flex-1 ml-2 text-base"
          placeholderTextColor="#9ca3af"
          testID="match-language-search"
        />
      </View>

      <ScrollView
        style={{ maxHeight: 280 }}
        showsVerticalScrollIndicator={true}
      >
        {filtered.map((item) => {
          const isSelected = item.value === selected;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => onSelect(item.value)}
              className={`flex-row items-center justify-between p-4 rounded-lg mb-2 ${
                isSelected ? "bg-appLightGrey" : "bg-white"
              } border border-gray-200`}
              testID={`match-language-option-${item.value}`}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">
                  {getEmojiForLanguage(item.value)}
                </Text>
                <Text className="text-base font-medium text-gray-800">
                  {item.label}
                </Text>
              </View>
              {isSelected ? (
                <Ionicons name="checkmark-circle" size={22} color="#262B2A" />
              ) : (
                <Ionicons name="radio-button-off" size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && (
          <Text className="text-center text-sm text-gray-500 py-2">
            {t("common.search")}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default MatchLanguageSelector;
