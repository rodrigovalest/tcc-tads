import React, { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { View } from "react-native";
import { MatchLanguage } from "@/models/types/match-language.type";
import { AVALIABLE_MATCH_LANGUAGES } from "../constants/avaliable-match-languages";

interface MatchLanguageSelectorProps {
  selected: MatchLanguage | null;
  onSelect: (value: MatchLanguage) => void;
}

const MatchLanguageSelector = ({ selected, onSelect }: MatchLanguageSelectorProps) => {
  const [open, setOpen] = useState(false);

  const items = Object.entries(AVALIABLE_MATCH_LANGUAGES).map(
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
        placeholder="Select language"
        style={{ borderColor: "#ccc" }}
        dropDownContainerStyle={{ borderColor: "#ccc" }}
      />
    </View>
  );
};

export default MatchLanguageSelector;
