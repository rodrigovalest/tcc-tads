import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import Dropdown from "@/components/Dropdown";

jest.mock("react-native-dropdown-picker", () => {
  return ({ placeholder, setValue, value, items, open, setOpen }: any) => {
    const React = require("react");
    const { View, Text, TouchableOpacity } = require("react-native");

    return (
      <View testID="dropdown">
        <TouchableOpacity
          testID="dropdown-trigger"
          onPress={() => setOpen(!open)}
        >
          <Text>{value ? items?.find((i: any) => i.value === value)?.label : placeholder}</Text>
        </TouchableOpacity>

        {open && (
          <View testID="dropdown-options">
            {items.map((item: any) => (
              <TouchableOpacity
                key={item.value}
                testID={`dropdown-option-${item.value}`}
                onPress={() => {
                  setValue(item.value);
                  setOpen(false);
                }}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };
});

describe("Dropdown component", () => {
  const mockOnChange = jest.fn();
  const items = [
    { label: "Brazil", value: "BR" },
    { label: "Argentina", value: "AR" },
    { label: "Chile", value: "CL" },
  ];

  it("renders label and options correctly", () => {
    const { getByText } = render(
      <Dropdown
        label="Country"
        value={null}
        onChange={mockOnChange}
        items={items}
        error=""
        open={false}
        setOpen={jest.fn()}
      />
    );

    expect(getByText("Country")).toBeTruthy();
    expect(getByText("Select country")).toBeTruthy();
  });

  it("calls onChange when an option is selected", () => {
    const setOpen = jest.fn();
    const { getByTestId } = render(
      <Dropdown
        label="Country"
        value={null}
        onChange={mockOnChange}
        items={items}
        error=""
        open={true}
        setOpen={setOpen}
      />
    );

    fireEvent.press(getByTestId("dropdown-option-BR"));

    expect(mockOnChange).toHaveBeenCalledWith("BR");
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("displays error message when provided", () => {
    const { getByText } = render(
      <Dropdown
        label="Country"
        value={null}
        onChange={mockOnChange}
        items={items}
        error="Required field"
        open={false}
        setOpen={jest.fn()}
      />
    );

    expect(getByText("Required field")).toBeTruthy();
  });
});
