import React from "react";
import { View, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { COLORS } from "@/constants/colors";

interface DropdownProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  items: { label: string; value: string }[];
  error?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  onChange,
  items,
  error,
  open,
  setOpen,
}) => {
  return (
    <View className="mb-0">
      <Text className="mb-2 text-appBlack font-semibold text-xl pl-2.5">
        {label}
      </Text>

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const newValue =
            typeof callback === "function" ? callback(value) : callback;
          onChange(newValue);
        }}
        setItems={() => {}}
        searchable={true}
        placeholder={`Select your ${label.toLowerCase()}`}
        searchPlaceholder="Search nationality..."
        listMode="MODAL"
        modalProps={{
          animationType: "slide",
        }}
        modalContentContainerStyle={{
          paddingTop: 20,
        }}
        style={{
          backgroundColor: COLORS.appLightGrey,
          borderColor: error ? "#DC2626" : "black",
          borderWidth: 1,
          borderRadius: 8,
          minHeight: 56,
          paddingVertical: 16,
          paddingHorizontal: 12,
        }}
        textStyle={{
          color: COLORS.appDarkGrey,
          fontSize: 20,
        }}
        placeholderStyle={{
          color: COLORS.appMediumGrey,
          fontSize: 20,
        }}
        dropDownContainerStyle={{
          backgroundColor: COLORS.appLightGrey,
          borderColor: "black",
        }}
      />

      <View className="min-h-[18px] mt-1 ml-1">
        {error ? (
          <Text className="text-appMediumRed text-xs">{error}</Text>
        ) : (
          <Text className="text-transparent text-xs">placeholder</Text>
        )}
      </View>
    </View>
  );
};

export default Dropdown;