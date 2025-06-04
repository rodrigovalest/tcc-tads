import React from "react";
import {
  Text,
  Image,
  View,
  TouchableOpacity,
  ImageURISource,
  ImageRequireSource,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

export type PlayerType = "solo" | "duo" | "group";

export interface GameMode {
  id: string;
  title: string;
  image: ImageURISource | ImageRequireSource;
  aspectRatio?: number;
  playerTypes: PlayerType[];
  onPress?: () => void;
}

interface GameModeCardProps {
  mode: GameMode;
  width?: number;
}

const GameModeCard = ({ mode, width = 160 }: GameModeCardProps) => {
  const cardWidth = width;
  const cardHeight = mode.aspectRatio
    ? cardWidth * mode.aspectRatio
    : cardWidth;

  const getIconForPlayerType = (playerType: PlayerType) => {
    switch (playerType) {
      case "solo":
        return "user";
      case "duo":
        return "user-friends";
      case "group":
        return "users";
      default:
        return "user";
    }
  };

  return (
    <TouchableOpacity
      className="mb-4 rounded-2xl"
      style={{ width: cardWidth }}
      activeOpacity={0.7}
      onPress={mode.onPress}
    >
      <View className="items-center relative">
        <Image
          source={mode.image}
          style={{
            width: cardWidth,
            height: cardHeight,
            borderRadius: 12,
          }}
          className="border border-black border-2"
          resizeMode="cover"        />
        <View
          className="absolute top-2 left-2 flex-row" 
          style={{ gap: 4 }}
        >
          {mode.playerTypes.map((playerType, index) => (
            <View
              key={`${playerType}-${index}`}
              className="bg-white bg-opacity-90 rounded-full p-1.5"
            >
              <Icon
                name={getIconForPlayerType(playerType)}
                size={12}
                color="#000"
              />
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GameModeCard;
