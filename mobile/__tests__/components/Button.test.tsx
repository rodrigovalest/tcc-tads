import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "../../components/Button";
import { COLORS } from "../../constants/colors";

jest.mock("react-native-vector-icons/FontAwesome", () => "Icon");

describe("Button", () => {
  const mockOnPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const { getByText, getByTestId } = render(
      <Button title="Test Button" onPress={mockOnPress} testID="test-button" />
    );
    expect(getByText("Test Button")).toBeTruthy();
    expect(getByTestId("test-button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={mockOnPress} testID="test-button" />
    );
    fireEvent.press(getByTestId("test-button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("displays ActivityIndicator when loading is true", () => {
    const { getByTestId } = render(
      <Button
        title="Test Button"
        onPress={mockOnPress}
        loading={true}
        testID="test-button"
      />
    );
    expect(getByTestId("button-activity-indicator")).toBeTruthy();
  });

  it("is disabled when disabled is true", () => {
    const { getByTestId } = render(
      <Button
        title="Test Button"
        onPress={mockOnPress}
        disabled={true}
        testID="test-button"
      />
    );
    const button = getByTestId("test-button");
    expect(button.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("renders with left and right icons", () => {
    const { UNSAFE_getByProps } = render(
      <Button
        title="Test Button"
        onPress={mockOnPress}
        iconLeft="star"
        iconRight="heart"
        testID="test-button"
      />
    );
    expect(UNSAFE_getByProps({ name: "star" })).toBeTruthy();
    expect(UNSAFE_getByProps({ name: "heart" })).toBeTruthy();
  });

  it("changes style on press", () => {
    const { getByTestId, getByText } = render(
      <Button
        title="Press Me"
        onPress={mockOnPress}
        bgColor="bg-blue-500"
        bgColorActivate="bg-red-500"
        textColor="text-white"
        textColorActivate="text-black"
        borderColor="border-blue-700"
        borderColorActivate="border-red-700"
        testID="pressable-button"
      />
    );

    const button = getByTestId("pressable-button");
    const text = getByText("Press Me");

    fireEvent(button, "pressIn");
    fireEvent(button, "pressOut");
  });

  it("renders with correct text color and size", () => {
    const { getByText } = render(
      <Button
        title="Styled Text"
        onPress={mockOnPress}
        textColor="text-green-500"
        textSize="text-xl"
      />
    );
    const textElement = getByText("Styled Text");
    expect(textElement).toBeTruthy();
  });

  it("does not call onPress when disabled and pressed", () => {
    const { getByTestId } = render(
      <Button
        title="Disabled Button"
        onPress={mockOnPress}
        disabled={true}
        testID="disabled-button"
      />
    );
    fireEvent.press(getByTestId("disabled-button"));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("shows loading indicator instead of title when loading", () => {
    const { queryByText, getByTestId } = render(
      <Button
        title="Loading Button"
        onPress={mockOnPress}
        loading={true}
        testID="loading-button"
      />
    );
    expect(queryByText("Loading Button")).toBeNull();
    expect(getByTestId("button-activity-indicator")).toBeTruthy();
  });
});
