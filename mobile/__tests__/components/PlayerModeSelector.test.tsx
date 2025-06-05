import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PlayerModeSelector from "@/components/PlayerModeSelector";
import { PlayerType } from "@/components/GameModeCard";

describe("PlayerModeSelector", () => {
  const mockOnPlayerTypeSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all player mode options", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo", "duo", "group"]}
        selectedPlayerType={null}
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );

    expect(getByText("Solo")).toBeTruthy();
    expect(getByText("Duo")).toBeTruthy();
    expect(getByText("Group")).toBeTruthy();
  });

  it("should render title", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo"]}
        selectedPlayerType={null}
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );

    expect(getByText("Game Mode")).toBeTruthy();
  });

  it("should highlight selected player type", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo", "duo"]}
        selectedPlayerType="solo"
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );

    const soloButton = getByText("Solo");
    expect(soloButton).toBeTruthy();
  });

  it("should call onPlayerTypeSelect when available option is pressed", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo", "duo"]}
        selectedPlayerType={null}
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );

    const soloButton = getByText("Solo");
    fireEvent.press(soloButton);

    expect(mockOnPlayerTypeSelect).toHaveBeenCalledWith("solo");
  });

  it("should not call onPlayerTypeSelect when disabled option is pressed", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo"]}
        selectedPlayerType={null}
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );
    const duoButton = getByText("Duo");
    fireEvent.press(duoButton);

    expect(mockOnPlayerTypeSelect).not.toHaveBeenCalled();
  });

  it("should disable unavailable player types", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo"]}
        selectedPlayerType={null}
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );
    const soloButton = getByText("Solo");
    const duoButton = getByText("Duo");
    const groupButton = getByText("Group");

    expect(soloButton).toBeTruthy();
    expect(duoButton).toBeTruthy();
    expect(groupButton).toBeTruthy();
  });

  it("should handle all player types available", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo", "duo", "group"]}
        selectedPlayerType="duo"
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );
    const soloButton = getByText("Solo");
    const duoButton = getByText("Duo");
    const groupButton = getByText("Group");

    fireEvent.press(soloButton);
    expect(mockOnPlayerTypeSelect).toHaveBeenCalledWith("solo");

    fireEvent.press(groupButton);
    expect(mockOnPlayerTypeSelect).toHaveBeenCalledWith("group");
  });

  it("should handle empty available player types", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={[]}
        selectedPlayerType={null}
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );

    const soloButton = getByText("Solo");
    fireEvent.press(soloButton);

    expect(mockOnPlayerTypeSelect).not.toHaveBeenCalled();
  });

  it("should handle single available player type", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["group"]}
        selectedPlayerType={null}
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );
    const groupButton = getByText("Group");
    fireEvent.press(groupButton);

    expect(mockOnPlayerTypeSelect).toHaveBeenCalledWith("group");
  });
  it("should change selection when different option is pressed", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo", "duo", "group"]}
        selectedPlayerType="solo"
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );

    const duoButton = getByText("Duo");
    fireEvent.press(duoButton);

    expect(mockOnPlayerTypeSelect).toHaveBeenCalledWith("duo");
  });

  it("should allow re-selecting the same option", () => {
    const { getByText } = render(
      <PlayerModeSelector
        availablePlayerTypes={["solo", "duo"]}
        selectedPlayerType="solo"
        onPlayerTypeSelect={mockOnPlayerTypeSelect}
      />
    );

    const soloButton = getByText("Solo");
    fireEvent.press(soloButton);

    expect(mockOnPlayerTypeSelect).toHaveBeenCalledWith("solo");
  });
});
