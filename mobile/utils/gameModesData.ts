import { GameMode, PlayerType } from "@/components/GameModeCard";

export const GAME_MODES_DATA: Omit<GameMode, "onPress">[] = [
  {
    id: "1",
    title: "Just Chilling",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 1.2,
    playerTypes: ["solo"],
  },
  {
    id: "2",
    title: "Casual Talk",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 2,
    playerTypes: ["duo", "group"],
  },
  {
    id: "3",
    title: "Game Night",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 2.1,
    playerTypes: ["group"],
  },
  {
    id: "4",
    title: "Movie Time",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 1.11,
    playerTypes: ["solo", "duo"],
  },
  {
    id: "5",
    title: "Outdoor Fun",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 2.0,
    playerTypes: ["duo", "group"],
  },
  {
    id: "6",
    title: "Study Session",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 1.5,
    playerTypes: ["solo", "duo"],
  },
  {
    id: "7",
    title: "Coffee Chat",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 2.2,
    playerTypes: ["solo", "duo"],
  },
  {
    id: "8",
    title: "Exercise Buddy",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 1.6,
    playerTypes: ["solo", "duo"],
  },
  {
    id: "9",
    title: "Food Explorer",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 2.8,
    playerTypes: ["duo", "group"],
  },
  {
    id: "10",
    title: "Adventure Time",
    image: require("@/assets/images/just-chilling-icon.png"),
    aspectRatio: 1.9,
    playerTypes: ["solo", "duo", "group"],
  },
];

export const determineIsGroupMode = (playerTypes: PlayerType[]): boolean => {
  return playerTypes.includes("group") || 
         (playerTypes.includes("duo") && !playerTypes.includes("solo"));
};
