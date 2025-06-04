import { useState } from "react";

export interface Language {
  id: string;
  name: string;
  flag: string;
  code: string;
}

export const useLanguageSelection = (isGroupMode: boolean = false) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null
  );  const languages: Language[] = [
    { id: "1", name: "Português", flag: "br", code: "pt-BR" },
    { id: "2", name: "English", flag: "gb", code: "en-GB" },
    { id: "3", name: "Español", flag: "es", code: "es-ES" },
  ];

  const getTitle = () => {
    return isGroupMode ? "Find people who speak the selected language" : "Play to Challenge yourself!";
  };

  const getButtonText = () => {
    return isGroupMode ? "Find a match" : "Play";
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleStartGame = () => {
    if (!selectedLanguage) return;

    console.log(
      `${isGroupMode ? "Criando grupo" : "Buscando partida"} com idioma: ${
        selectedLanguage.name
      }`
    );
  };

  const isButtonEnabled = selectedLanguage !== null;

  return {
    languages,
    selectedLanguage,
    title: getTitle(),
    buttonText: getButtonText(),
    isButtonEnabled,
    handleLanguageSelect,
    handleStartGame,
  };
};
