import React from "react";
import { render } from "@testing-library/react-native";
import Index from "@/app/index";

// Mock expo-router
jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require("react-native");
    return <Text testID="redirect">Redirecting to {href}</Text>;
  },
}));

describe("<Index />", () => {
  it("should redirect to login page", () => {
    const { getByTestId } = render(<Index />);
    const redirectElement = getByTestId("redirect");
    expect(redirectElement.props.children).toEqual([
      "Redirecting to ",
      "/(public)/(auth)/login",
    ]);
  });
});
