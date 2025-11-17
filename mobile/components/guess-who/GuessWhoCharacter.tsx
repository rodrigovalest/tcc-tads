import { View, Text, Image, TouchableOpacity } from "react-native";

interface GuessWhoCharacterProps {
  id: string;
  name: string;
  image: any;
  disabled: boolean;
  onPress?: () => void;
}

export default function GuessWhoCharacter({
  id,
  name,
  image,
  disabled,
  onPress,
}: GuessWhoCharacterProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress?.()}
      className="w-[22%] mx-[1%] items-center mt-3"
      activeOpacity={0.7}
    >
      <View className="relative w-full">
        <Image
          source={image}
          className="w-full h-20"
          resizeMode="contain"
          style={{ opacity: disabled ? 0.35 : 1 }}
        />

        {disabled && (
          <View className="absolute inset-0 bg-black/40 rounded-md" />
        )}
      </View>

      <Text
        className="text-sm font-medium mt-1 text-white text-center"
        style={{ opacity: disabled ? 0.4 : 1 }}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}
