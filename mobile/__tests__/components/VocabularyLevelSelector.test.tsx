import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import VocabularyLevelSelector from "@/components/VocabularyLevelSelector";
import { useI18n } from "@/hooks/useI18n";

jest.mock("@/hooks/useI18n");

const mockUseI18n = useI18n as jest.MockedFunction<typeof useI18n>;

describe("VocabularyLevelSelector", () => {
  beforeEach(() => {
    mockUseI18n.mockReturnValue({
      t: (key: string) => key,
    } as any);
  });

  it("renders three level buttons and handles selection", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <VocabularyLevelSelector selected={null} onSelect={onSelect} />
    );

    const basic = getByText("timeAttackVocab.levels.basic");
    const intermediate = getByText("timeAttackVocab.levels.intermediate");
    const advanced = getByText("timeAttackVocab.levels.advanced");

    expect(basic).toBeTruthy();
    expect(intermediate).toBeTruthy();
    expect(advanced).toBeTruthy();

    fireEvent.press(intermediate);
    expect(onSelect).toHaveBeenCalledWith("intermediate");
  });
});
