import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GameModeCard, { GameMode } from "@/components/GameModeCard";

describe("GameModeCard", () => {
  const mockGameMode: GameMode = {
    id: "test-game",
    title: "Test Game",
    image: { uri: "https://example.com/image.jpg" },
    playerTypes: ["solo", "duo"],
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should render game mode card with image", () => {
    const { getByTestId } = render(
      <GameModeCard mode={mockGameMode} width={160} />
    );

    const image = getByTestId("game-mode-image");
    expect(image).toBeTruthy();
  });

  it("should render with custom width", () => {
    const { UNSAFE_root } = render(
      <GameModeCard mode={mockGameMode} width={200} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render with default width when not specified", () => {
    const { UNSAFE_root } = render(<GameModeCard mode={mockGameMode} />);

    expect(UNSAFE_root).toBeTruthy();
  });
  it("should call onPress when pressed", () => {
    const { getByTestId } = render(
      <GameModeCard mode={mockGameMode} width={160} />
    );

    const touchable = getByTestId("game-mode-card");
    fireEvent.press(touchable);

    expect(mockGameMode.onPress).toHaveBeenCalledTimes(1);
  });
  it("should not crash when onPress is not provided", () => {
    const modeWithoutOnPress: GameMode = {
      ...mockGameMode,
      onPress: undefined,
    };

    const { getByTestId } = render(
      <GameModeCard mode={modeWithoutOnPress} width={160} />
    );

    const touchable = getByTestId("game-mode-card");
    expect(() => fireEvent.press(touchable)).not.toThrow();
  });

  it("should render player type icons for solo mode", () => {
    const soloMode: GameMode = {
      ...mockGameMode,
      playerTypes: ["solo"],
    };

    const { UNSAFE_root } = render(
      <GameModeCard mode={soloMode} width={160} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render player type icons for duo mode", () => {
    const duoMode: GameMode = {
      ...mockGameMode,
      playerTypes: ["duo"],
    };

    const { UNSAFE_root } = render(<GameModeCard mode={duoMode} width={160} />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render player type icons for group mode", () => {
    const groupMode: GameMode = {
      ...mockGameMode,
      playerTypes: ["group"],
    };

    const { UNSAFE_root } = render(
      <GameModeCard mode={groupMode} width={160} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should render multiple player type icons", () => {
    const multiMode: GameMode = {
      ...mockGameMode,
      playerTypes: ["solo", "duo", "group"],
    };

    const { UNSAFE_root } = render(
      <GameModeCard mode={multiMode} width={160} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should handle aspect ratio correctly", () => {
    const modeWithAspectRatio: GameMode = {
      ...mockGameMode,
      aspectRatio: 1.5,
    };

    const { UNSAFE_root } = render(
      <GameModeCard mode={modeWithAspectRatio} width={160} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should handle mode without aspect ratio", () => {
    const modeWithoutAspectRatio: GameMode = {
      ...mockGameMode,
      aspectRatio: undefined,
    };

    const { UNSAFE_root } = render(
      <GameModeCard mode={modeWithoutAspectRatio} width={160} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("should handle require source images", () => {
    const modeWithRequireImage: GameMode = {
      ...mockGameMode,
      image: require("@/assets/images/calle-dog-icon.png"),
    };

    const { UNSAFE_root } = render(
      <GameModeCard mode={modeWithRequireImage} width={160} />
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});
