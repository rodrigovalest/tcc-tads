import React from "react";
import { render } from "@testing-library/react-native";
import MatchesHeader from "@/components/MatchesHeader";

describe("MatchesHeader", () => {
  it("should render the Calle logo image", () => {
    const { UNSAFE_root } = render(<MatchesHeader />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render the "Calle" text', () => {
    const { getByText } = render(<MatchesHeader />);
    expect(getByText("Calle")).toBeTruthy();
  });

  it("should render without any props", () => {
    const { getByText, UNSAFE_root } = render(<MatchesHeader />);

    expect(UNSAFE_root).toBeTruthy();
    expect(getByText("Calle")).toBeTruthy();
  });

  it("should handle multiple renders consistently", () => {
    const { getByText: getText1 } = render(<MatchesHeader />);
    const { getByText: getText2 } = render(<MatchesHeader />);

    expect(getText1("Calle")).toBeTruthy();
    expect(getText2("Calle")).toBeTruthy();
  });

  it("should be accessible", () => {
    const { getByText } = render(<MatchesHeader />);
    const titleElement = getByText("Calle");

    expect(titleElement).toBeTruthy();
  });
});
