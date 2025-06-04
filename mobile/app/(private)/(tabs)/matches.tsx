import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Image, View } from "react-native";
import { useRouter } from "expo-router";
import GameModes from "@/components/GameModes";
import { GameMode } from "@/components/GameModeCard";

export default function Matches() {
  const router = useRouter();

  const navigateToLanguageSelection = (gameMode: string, isGroup: boolean) => {
    router.push({
      pathname: "/(private)/language-selection",
      params: {
        gameMode,
        isGroup: isGroup.toString(),
      },
    });
  };
  const gameModes: GameMode[] = [
    {
      id: "1",
      title: "Just Chilling",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 1.2,
      isGroup: false,
      onPress: () => navigateToLanguageSelection("Just Chilling", false),
    },
    {
      id: "2",
      title: "Casual Talk",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 2,
      isGroup: true,
      onPress: () => navigateToLanguageSelection("Casual Talk", true),
    },
    {
      id: "3",
      title: "Game Night",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 2.1,
      isGroup: true,
      onPress: () => navigateToLanguageSelection("Game Night", true),
    },
    {
      id: "4",
      title: "Movie Time",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 1.11,
      isGroup: false,
      onPress: () => navigateToLanguageSelection("Movie Time", false),
    },
    {
      id: "5",
      title: "Outdoor Fun",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 2.0,
      isGroup: true,
      onPress: () => navigateToLanguageSelection("Outdoor Fun", true),
    },
    {
      id: "6",
      title: "Study Session",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 1.5,
      isGroup: false,
      onPress: () => navigateToLanguageSelection("Study Session", false),
    },
    {
      id: "7",
      title: "Coffee Chat",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 2.2,
      isGroup: false,
      onPress: () => navigateToLanguageSelection("Coffee Chat", false),
    },
    {
      id: "8",
      title: "Exercise Buddy",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 1.6,
      isGroup: false,
      onPress: () => navigateToLanguageSelection("Exercise Buddy", false),
    },
    {
      id: "9",
      title: "Food Explorer",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 2.8,
      isGroup: true,
      onPress: () => navigateToLanguageSelection("Food Explorer", true),
    },
    {
      id: "10",
      title: "Adventure Time",
      image: require("@/assets/images/just-chilling-icon.png"),
      aspectRatio: 1.9,
      isGroup: true,
      onPress: () => navigateToLanguageSelection("Adventure Time", true),
    },  ];

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <View className="flex-1">
        <View className="flex flex-row items-end justify-start pl-10 pt-8">
          <Image
            source={require("@/assets/images/calle-dog-icon.png")}
            className="w-24 h-24"
          />
          <Text className="text-7xl text-center font-bold pl-4">Calle</Text>
        </View>

        <GameModes modes={gameModes} />
      </View>
    </SafeAreaView>
  );
}
