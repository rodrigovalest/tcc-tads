import { View, StyleSheet, Image, Text } from "react-native";
import { RTCView, MediaStream } from "react-native-webrtc";

interface GuessWhoVideoCardProps {
  stream: MediaStream | null;
  name: string;
  countryFlag: any;
}

const GuessWhoVideoCardComponent = ({
  stream,
  name,
  countryFlag,
}: GuessWhoVideoCardProps) => {
  return (
    <View className="items-center p-2 bg-[rgba(217,217,217,0.2)] rounded-2xl">
      <View className="h-28 w-28 rounded-2xl border-appBlack border-2 mb-2 overflow-hidden bg-appBlack items-center justify-center">
        {stream ? (
          <RTCView
            streamURL={stream.toURL()}
            objectFit="cover"
            zOrder={1}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View className="w-full h-full bg-appBlack items-center justify-center">
            <Text className="text-white text-xs opacity-60">
              No Video
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center mt-1">
        <Image
          source={countryFlag}
          className="w-7 h-5 mr-2 rounded-lg"
        />
        <Text className="text-white text-xl font-nunito-medium">{name}</Text>
      </View>
    </View>
  );
};

export default GuessWhoVideoCardComponent;
