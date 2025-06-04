import { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { GameMode } from "@/components/GameModeCard";

export const useGameModes = (modes: GameMode[]) => {
  const [screenData, setScreenData] = useState(Dimensions.get("window"));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription?.remove();
  }, []);

  const getNumberOfColumns = () => {
    const { width } = screenData;
    const minCardWidth = 140;
    const padding = 48;
    const minSpacing = 12;

    const availableWidth = width - padding;
    const columnsWithSpacing = Math.floor(
      (availableWidth + minSpacing) / (minCardWidth + minSpacing)
    );

    return Math.max(2, Math.min(4, columnsWithSpacing));
  };

  const organizeInColumns = () => {
    const numberOfColumns = getNumberOfColumns();
    const columns: GameMode[][] = Array.from(
      { length: numberOfColumns },
      () => []
    );

    modes.forEach((mode, index) => {
      const columnIndex = index % numberOfColumns;
      columns[columnIndex].push(mode);
    });

    return { columns, numberOfColumns };
  };

  const getColumnWidth = () => {
    const { width } = screenData;
    const numberOfColumns = getNumberOfColumns();
    const padding = 48;
    const spacing = 12;
    const totalSpacing = (numberOfColumns - 1) * spacing;
    const availableWidth = width - padding - totalSpacing;

    return availableWidth / numberOfColumns;
  };

  const { columns, numberOfColumns } = organizeInColumns();
  const columnWidth = getColumnWidth();

  return {
    columns,
    numberOfColumns,
    columnWidth,
    screenData,
  };
};
