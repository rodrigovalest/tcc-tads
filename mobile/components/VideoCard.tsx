import { View, Image, Text } from "react-native";
import { RTCView, MediaStream } from "react-native-webrtc";

interface IVideoCardProps {
  stream: any;
  name: string;
  countryFlagEmoji: string;
}

const VideoCardComponent = ({
  stream,
  name,
  countryFlagEmoji,
}: IVideoCardProps) => {
  return (
    <View className="items-center p-2 bg-[rgba(217,217,217,0.2)] rounded-2xl">
      <View className="h-28 w-28 rounded-2xl border-appBlack border-2 mb-2 overflow-hidden bg-appBlack items-center justify-center">
        {stream ? (
          <RTCView
            pointerEvents="none"
            streamURL={stream.toURL()}
            objectFit="cover"
            zOrder={1}
            style={{ width: 100, height: 100 }}
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
        <Text className="text-white text-xl font-nunito-medium">{`${countryFlagEmoji} ${name}`}</Text>
      </View>
    </View>
  );
};

export default VideoCardComponent;
