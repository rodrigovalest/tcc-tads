import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { View } from "react-native";
import { MatchLanguage } from "@/models/types/match-language.type";
import { getLocalizedMatchLanguages } from "../constants/avaliable-match-languages";
import useI18n from "../hooks/useI18n";

interface MatchLanguageSelectorProps {
  selected: MatchLanguage | null;
  onSelect: (value: MatchLanguage) => void;
}

const MatchLanguageSelector = ({ selected, onSelect }: MatchLanguageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const localizedLanguages = getLocalizedMatchLanguages();
  const items = Object.entries(localizedLanguages).map(
    ([value, label]): { label: string; value: MatchLanguage } => ({
      label: label as string,
      value: value as MatchLanguage,
    })
  );

  return (
    <View style={{ zIndex: 10 }}>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={selected ?? 'Select a language'}
        setValue={(cb) => {
          const value = cb(selected ?? undefined);
          if (value) onSelect(value as MatchLanguage);
        }}
        items={items}
        placeholder={t('match.selectLanguage')}
        style={{ borderColor: "#ccc" }}
        dropDownContainerStyle={{ borderColor: "#ccc" }}
      />
    </View>
  );
};

export default MatchLanguageSelector;
