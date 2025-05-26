import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import Button from "../../components/Button";
import { COLORS } from "../../constants/colors";
import Icon from "react-native-vector-icons/FontAwesome";

jest.mock("react-native-vector-icons/FontAwesome", () => (props: any) => {
  const MockIcon = require("react-native-vector-icons/MaterialIcons");
  return <MockIcon {...props} />;
});

describe("Button", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it("renders correctly with a title", () => {
    render(<Button title="Test Button" onPress={mockOnPress} />);
    expect(screen.getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    render(<Button title="Test Button" onPress={mockOnPress} />);
    fireEvent.press(screen.getByText("Test Button"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  describe("Styling and Props", () => {
    it("applies default styles", () => {
      render(<Button title="Default Button" onPress={mockOnPress} />);
      const button = screen.getByRole("button");
      const text = screen.getByText("Default Button");

      expect(button.props.className).toContain("bg-white");
      expect(button.props.className).toContain("border-black");
      expect(text.props.className).toContain("text-white");
      expect(text.props.className).toContain("text-base");
    });

    it("applies custom styles from props", () => {
      render(
        <Button
          title="Custom Button"
          onPress={mockOnPress}
          bgColor="bg-appMediumRed"
          textColor="appDarkGrey"
          borderColor="border-appMediumRed"
          textSize="xl"
        />
      );
      const button = screen.getByRole("button");
      const text = screen.getByText("Custom Button");

      expect(button.props.className).toContain("bg-appMediumRed");
      expect(button.props.className).toContain("border-appMediumRed");
      expect(text.props.className).toContain("text-appDarkGrey");
      expect(text.props.className).toContain("text-xl");
    });

    it("applies additional className prop", () => {
      render(
        <Button
          title="Classy Button"
          onPress={mockOnPress}
          className="my-custom-class"
        />
      );
      const button = screen.getByRole("button");
      expect(button.props.className).toContain("my-custom-class");
    });
  });

  describe("Interaction States", () => {
    it("applies active styles on pressIn and reverts on pressOut", () => {
      render(
        <Button
          title="Interactive Button"
          onPress={mockOnPress}
          bgColor="bg-blue-500"
          bgColorActivate="bg-blue-700"
          textColor="white"
          textColorActivate="gray-200"
          borderColor="border-blue-500"
          borderColorActivate="border-blue-700"
        />
      );
      const button = screen.getByRole("button");
      const text = screen.getByText("Interactive Button");

      expect(button.props.className).toContain("bg-blue-500");
      expect(button.props.className).toContain("border-blue-500");
      expect(text.props.className).toContain("text-white");

      fireEvent(button, "pressIn");
      const updatedButtonProps = screen.getByRole("button").props;
      const updatedTextProps = screen.getByText("Interactive Button").props;

      expect(updatedButtonProps.className).toContain("bg-blue-700");
      expect(updatedButtonProps.className).toContain("border-blue-700");
      expect(updatedTextProps.className).toContain("text-gray-200");

      fireEvent(button, "pressOut");
      const revertedButtonProps = screen.getByRole("button").props;
      const revertedTextProps = screen.getByText("Interactive Button").props;

      expect(revertedButtonProps.className).toContain("bg-blue-500");
      expect(revertedButtonProps.className).toContain("border-blue-500");
      expect(revertedTextProps.className).toContain("text-white");
    });

    it("handles disabled state", () => {
      render(
        <Button title="Disabled Button" onPress={mockOnPress} disabled={true} />
      );
      const button = screen.getByRole("button");
      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(button.props.className).toContain("opacity-50");

      fireEvent.press(screen.getByText("Disabled Button"));
      expect(mockOnPress).not.toHaveBeenCalled();

      fireEvent(button, "pressIn");
      expect(button.props.className).not.toContain("bg-black");
    });

    it("handles loading state", () => {
      render(
        <Button title="Loading Button" onPress={mockOnPress} loading={true} />
      );
      const button = screen.getByRole("button");
      expect(screen.getByTestId("activity-indicator")).toBeTruthy();

      expect(button.props.accessibilityState.disabled).toBe(true);
      expect(button.props.className).toContain("opacity-50");

      fireEvent.press(screen.getByText("Loading Button"));
      fireEvent.press(button);
      expect(mockOnPress).not.toHaveBeenCalled();

      fireEvent(button, "pressIn");
      expect(button.props.className).not.toContain("bg-black");
    });
  });

  describe("Icons", () => {
    it("renders left and right icons with default styles", () => {
      render(
        <Button
          title="Icon Button"
          onPress={mockOnPress}
          iconLeft="star"
          iconRight="heart"
        />
      );
      const icons = screen.getAllByTestId("mock-icon");
      expect(icons.length).toBe(2);

      const leftIcon = icons[0];
      const rightIcon = icons[1];

      expect(leftIcon.props.name).toBe("star");
      expect(leftIcon.props.size).toBe(24);
      expect(leftIcon.props.color).toBe("black");

      expect(rightIcon.props.name).toBe("heart");
      expect(rightIcon.props.size).toBe(24);
      expect(rightIcon.props.color).toBe("black");
    });

    it("renders icons with custom sizes and colors", () => {
      render(
        <Button
          title="Custom Icon Button"
          onPress={mockOnPress}
          iconLeft="cog"
          iconLeftSize={30}
          iconLeftColor="blue"
          iconRight="user"
          iconRightSize={20}
          iconRightColor="green"
        />
      );
      const icons = screen.getAllByTestId("mock-icon");
      const leftIcon = icons.find((icon) => icon.props.name === "cog");
      const rightIcon = icons.find((icon) => icon.props.name === "user");

      expect(leftIcon).toBeTruthy();
      expect(leftIcon?.props.size).toBe(30);
      expect(leftIcon?.props.color).toBe("blue");

      expect(rightIcon).toBeTruthy();
      expect(rightIcon?.props.size).toBe(20);
      expect(rightIcon?.props.color).toBe("green");
    });

    it("changes icon colors on pressIn and reverts on pressOut", () => {
      render(
        <Button
          title="Interactive Icon Button"
          onPress={mockOnPress}
          iconLeft="home"
          iconLeftColor="purple"
          iconLeftColorActivate="orange"
          iconRight="settings"
          iconRightColor="teal"
          iconRightColorActivate="pink"
        />
      );
      const button = screen.getByRole("button");

      const getIcons = () => screen.getAllByTestId("mock-icon");
      let leftIcon = getIcons().find((icon) => icon.props.name === "home");
      let rightIcon = getIcons().find((icon) => icon.props.name === "settings");

      expect(leftIcon?.props.color).toBe("purple");
      expect(rightIcon?.props.color).toBe("teal");

      fireEvent(button, "pressIn");
      leftIcon = getIcons().find((icon) => icon.props.name === "home");
      rightIcon = getIcons().find((icon) => icon.props.name === "settings");
      expect(leftIcon?.props.color).toBe("orange");
      expect(rightIcon?.props.color).toBe("pink");

      fireEvent(button, "pressOut");
      leftIcon = getIcons().find((icon) => icon.props.name === "home");
      rightIcon = getIcons().find((icon) => icon.props.name === "settings");
      expect(leftIcon?.props.color).toBe("orange");
      expect(rightIcon?.props.color).toBe("pink");

      fireEvent(button, "pressOut");
      leftIcon = getIcons().find((icon) => icon.props.name === "home");
      rightIcon = getIcons().find((icon) => icon.props.name === "settings");
      expect(leftIcon?.props.color).toBe("purple");
      expect(rightIcon?.props.color).toBe("teal");
    });

    it("does not render icons if props are null", () => {
      render(<Button title="No Icons Button" onPress={mockOnPress} />);
      const icons = screen.queryAllByTestId("mock-icon");
      expect(icons.length).toBe(0);
    });
  });
});
