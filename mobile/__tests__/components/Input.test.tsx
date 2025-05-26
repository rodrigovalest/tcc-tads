import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Input from "../../components/Input";

describe("Input", () => {
  it("renders correctly with a label and placeholder", () => {
    const handleChangeText = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <Input
        label="Email"
        value=""
        onChangeText={handleChangeText}
        placeholder="Enter your email"
      />
    );

    expect(getByText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
  });

  it("calls onChangeText when text is entered", () => {
    const handleChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        label="Email"
        value=""
        onChangeText={handleChangeText}
        placeholder="Enter your email"
      />
    );

    fireEvent.changeText(
      getByPlaceholderText("Enter your email"),
      "test@example.com"
    );
    expect(handleChangeText).toHaveBeenCalledWith("test@example.com");
  });

  it("displays the correct value", () => {
    const handleChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <Input
        label="Email"
        value="current@example.com"
        onChangeText={handleChangeText}
        placeholder="Enter your email"
      />
    );
    expect(getByDisplayValue("current@example.com")).toBeTruthy();
  });

  it("renders as a secure text entry when type is password and toggles visibility", () => {
    const handleChangeText = jest.fn();
    const { getByPlaceholderText, getByTestId, rerender } = render(
      <Input
        label="Password"
        value=""
        onChangeText={handleChangeText}
        placeholder="Enter your password"
        type="password"
      />
    );
    let inputElement = getByPlaceholderText("Enter your password");

    expect(inputElement.props.secureTextEntry).toBe(false);

    const toggleButton = getByTestId("password-visibility-toggle");
    fireEvent.press(toggleButton);

    inputElement = getByPlaceholderText("Enter your password");
    expect(inputElement.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);
    inputElement = getByPlaceholderText("Enter your password");
    expect(inputElement.props.secureTextEntry).toBe(false);
  });

  it("does not render visibility toggle for non-password inputs", () => {
    const handleChangeText = jest.fn();
    const { queryByTestId } = render(
      <Input
        label="Email"
        value=""
        onChangeText={handleChangeText}
        placeholder="Enter your email"
        type="email"
      />
    );
    expect(queryByTestId("password-visibility-toggle")).toBeNull();
  });
});
