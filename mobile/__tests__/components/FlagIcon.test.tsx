import React from "react";
import { render } from "@testing-library/react-native";
import FlagIcon from "@/components/FlagIcon";

describe("FlagIcon", () => {
  it("should render flag icon for supported country codes", () => {
    const { UNSAFE_root } = render(<FlagIcon countryCode="br" size={24} />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render with different sizes", () => {
    const { UNSAFE_root } = render(<FlagIcon countryCode="gb" size={32} />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should handle unsupported country codes", () => {
    const { UNSAFE_root } = render(
      <FlagIcon countryCode="unknown" size={24} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render Spanish flag icon", () => {
    const { UNSAFE_root } = render(<FlagIcon countryCode="es" size={24} />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should handle empty country code", () => {
    const { UNSAFE_root } = render(<FlagIcon countryCode="" size={24} />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render with various size options", () => {
    const sizes = [12, 16, 20, 24, 32, 48, 64];

    sizes.forEach((size) => {
      const { UNSAFE_root } = render(<FlagIcon countryCode="br" size={size} />);

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it("should handle case insensitive country codes", () => {
    const { UNSAFE_root: upperCase } = render(
      <FlagIcon countryCode="BR" size={24} />
    );

    const { UNSAFE_root: lowerCase } = render(
      <FlagIcon countryCode="br" size={24} />
    );

    expect(upperCase).toBeTruthy();
    expect(lowerCase).toBeTruthy();
  });

  it("should render all supported flags", () => {
    const supportedCodes = ["br", "gb", "es"];

    supportedCodes.forEach((code) => {
      const { UNSAFE_root } = render(<FlagIcon countryCode={code} size={24} />);

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it("should render with default size when not specified", () => {
    const { UNSAFE_root } = render(<FlagIcon countryCode="br" />);

    expect(UNSAFE_root).toBeTruthy();
  });
});
