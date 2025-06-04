import React from "react";
import {
  Text,
  Image,
  View,
  TouchableOpacity,
  ImageURISource,
  ImageRequireSource,
} from "react-native";

export interface GameMode {
  id: string;
  title: string;
  image: ImageURISource | ImageRequireSource;
  aspectRatio?: number;
  isGroup?: boolean;
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

  return (
    <TouchableOpacity
      className="mb-4 rounded-2xl"
      style={{ width: cardWidth }}
      activeOpacity={0.7}
      onPress={mode.onPress}
    >
      <View className="items-center">
        <Image
          source={mode.image}
          style={{
            width: cardWidth,
            height: cardHeight,
            borderRadius: 12,
          }}
          className="border border-black border-2"
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
};

export default GameModeCard;
