import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MatchHistoryItem from "../../components/MatchHistoryItem";
import { getLocalizedMatchModes } from "../../constants/available-match-modes";
import { getLocalizedMatchLanguages } from "../../constants/avaliable-match-languages";

// mocks
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

jest.mock("../../store/auth-store", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    user: { sub: 1, username: "loggedUser" },
  })),
}));

describe("MatchHistoryItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly and handles user press", async () => {
    const users = [
      { id: 1, username: "loggedUser", nationality: "US", photoUri: null },
      { id: 2, username: "buddy1", nationality: "FR", photoUri: "http://example.com/photo.jpg" },
      { id: 3, username: "buddy2", nationality: "JP", photoUri: null },
    ];

    const { getByText, getByTestId } = render(
      <MatchHistoryItem
        startTime="2025-08-31T10:00:00.000Z"
        endTime="2025-08-31T10:30:00.000Z"
        mode="just-chilling"
        language="en"
        users={users}
      />
    );

    expect(getByText(getLocalizedMatchLanguages()["en"])).toBeTruthy();
    expect(getByText("30m")).toBeTruthy();
    expect(getByText(getLocalizedMatchModes()["just-chilling"].title)).toBeTruthy();

    fireEvent.press( getByTestId("user-image-buddy1"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(private)/profile/[username]",
      params: { username: "buddy1" },
    });

    fireEvent.press( getByTestId("user-image-buddy2"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(private)/profile/[username]",
      params: { username: "buddy2" },
    });
  });
});
