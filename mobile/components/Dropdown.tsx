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
    <View className="mb-4 z-10">
      <Text
        style={{
          color: "black",
          fontSize: 20,
          fontWeight: "600",
          marginBottom: 8,
          paddingLeft: 10,
        }}
      >
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
          marginBottom: 16,
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

      <Text
        style={{
          marginTop: -8,
          marginLeft: 6,
          color: "#DC2626",
          fontSize: 12,
          minHeight: 18,
        }}
      >
        {error || " "}
      </Text>
    </View>
  );
};

export default Dropdown;
