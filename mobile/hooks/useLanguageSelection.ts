// import { useState, useEffect } from "react";
// import { SUPPORTED_LANGUAGES } from "@/constants/languages";
// import { PlayerType } from "@/components/GameModeCard";

// export interface Language {
//   id: string;
//   name: string;
//   flag: string;
//   code: string;
// }

// export const useLanguageSelection = (
//   availablePlayerTypes: PlayerType[] = ["solo"]
// ) => {
//   const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
//     null
//   );
//   const [selectedPlayerType, setSelectedPlayerType] =
//     useState<PlayerType | null>(null);
//   useEffect(() => {
//     if (availablePlayerTypes.length === 1) {
//       setSelectedPlayerType(availablePlayerTypes[0]);
//     }
//   }, [availablePlayerTypes]);

//   const languages: Language[] = SUPPORTED_LANGUAGES.map((lang, index) => ({
//     id: (index + 1).toString(),
//     name: lang.name,
//     flag: lang.countryCode,
//     code: lang.code,
//   }));
//   const getTitle = () => {
//     if (!selectedPlayerType) return "Select game mode";

//     switch (selectedPlayerType) {
//       case "solo":
//         return "Play to Challenge yourself!";
//       case "duo":
//         return "Find a duo partner!";
//       case "group":
//         return "Find people to play with!";
//       default:
//         return "Select game mode";
//     }
//   };
//   const getButtonText = () => {
//     if (!selectedPlayerType) return "Select";

//     switch (selectedPlayerType) {
//       case "solo":
//         return "Play";
//       case "duo":
//         return "Find duo";
//       case "group":
//         return "Find group";
//       default:
//         return "Continue";
//     }
//   };

//   const handleLanguageSelect = (language: Language) => {
//     setSelectedLanguage(language);
//   };

//   const handlePlayerTypeSelect = (playerType: PlayerType) => {
//     setSelectedPlayerType(playerType);
//   };

//   const handleStartGame = () => {
//     if (!selectedLanguage || !selectedPlayerType) return;
//     const actionMap = {
//       solo: "Starting solo game",
//       duo: "Looking for duo",
//       group: "Creating group",
//     }; 
//     // Here you can add the logic to start the game
//     // Either going to loading screen, calling an API, etc.

//     console.log(
//       `${actionMap[selectedPlayerType]} with language: ${selectedLanguage.name}`
//     );
//   };

//   const isButtonEnabled =
//     selectedLanguage !== null && selectedPlayerType !== null;
//   return {
//     languages,
//     selectedLanguage,
//     selectedPlayerType,
//     availablePlayerTypes,
//     title: getTitle(),
//     buttonText: getButtonText(),
//     isButtonEnabled,
//     handleLanguageSelect,
//     handlePlayerTypeSelect,
//     handleStartGame,
//   };
// };
