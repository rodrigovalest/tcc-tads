import { useState, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { PlayerType } from "@/components/GameModeCard";

export interface Language {
  id: string;
  name: string;
  flag: string;
  code: string;
}

export const useLanguageSelection = (
  availablePlayerTypes: PlayerType[] = ["solo"]
) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );
  const [selectedPlayerType, setSelectedPlayerType] =
    useState<PlayerType | null>(null);
  useEffect(() => {
    if (availablePlayerTypes.length === 1) {
      setSelectedPlayerType(availablePlayerTypes[0]);
    }
  }, [availablePlayerTypes]);

  const languages: Language[] = SUPPORTED_LANGUAGES.map((lang, index) => ({
    id: (index + 1).toString(),
    name: lang.name,
    flag: lang.countryCode,
    code: lang.code,
  }));

  const getTitle = () => {
    if (!selectedPlayerType) return "Selecione o modo de jogo";

    switch (selectedPlayerType) {
      case "solo":
        return "Play to Challenge yourself!";
      case "duo":
        return "Find a duo partner!";
      case "group":
        return "Find people to play with!";
      default:
        return "Select game mode";
    }
  };

  const getButtonText = () => {
    if (!selectedPlayerType) return "Selecionar";

    switch (selectedPlayerType) {
      case "solo":
        return "Jogar";
      case "duo":
        return "Encontrar dupla";
      case "group":
        return "Encontrar grupo";
      default:
        return "Continuar";
    }
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handlePlayerTypeSelect = (playerType: PlayerType) => {
    setSelectedPlayerType(playerType);
  };

  const handleStartGame = () => {
    if (!selectedLanguage || !selectedPlayerType) return;

    const actionMap = {
      solo: "Iniciando jogo solo",
      duo: "Procurando dupla",
      group: "Criando grupo",
    };

    console.log(
      `${actionMap[selectedPlayerType]} com idioma: ${selectedLanguage.name}`
    );
  };

  const isButtonEnabled =
    selectedLanguage !== null && selectedPlayerType !== null;
  return {
    languages,
    selectedLanguage,
    selectedPlayerType,
    availablePlayerTypes,
    title: getTitle(),
    buttonText: getButtonText(),
    isButtonEnabled,
    handleLanguageSelect,
    handlePlayerTypeSelect,
    handleStartGame,
  };
};
