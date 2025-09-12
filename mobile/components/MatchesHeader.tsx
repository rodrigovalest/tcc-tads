import React from "react";
import { Text, Image, View } from "react-native";

const MatchesHeader = () => {
  return (
    <View className="flex flex-row items-end justify-start">
      <Image
        source={require("../assets/images/calle-dog-icon.png")}
        className="w-24 h-24"
      />
      <Text className="text-7xl text-center pl-4 font-nunito-extrabold text-appBlack">Calle</Text>
    </View>
  );
};

export default MatchesHeader;
