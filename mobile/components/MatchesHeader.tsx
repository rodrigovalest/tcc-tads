import React from "react";
import { Text, Image, View } from "react-native";

const MatchesHeader = () => {
  return (
    <View className="flex flex-row items-end justify-start pl-10 pt-8">
      <Image
        source={require("../assets/images/calle-dog-icon.png")}
        className="w-24 h-24"
      />
      <Text className="text-7xl text-center font-bold pl-4">Calle</Text>
    </View>
  );
};

export default MatchesHeader;
