import { View, TouchableOpacity } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

interface VideoCallControlsProps {
  onSwitchAudio: () => void;
  onSwitchVideo: () => void;
  onEndCall: () => void;
  isMicMuted: boolean;
  isVideoMuted: boolean;
}

const VideoCallControlsComponent = ({
  onSwitchAudio,
  onSwitchVideo,
  onEndCall,
  isMicMuted,
  isVideoMuted,
}: VideoCallControlsProps) => {
  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-appBlack px-10 pt-8 pb-10 flex-row justify-between items-center rounded-t-3xl"
      style={{ width: "100%" }}
    >
      <TouchableOpacity
        className="bg-[#4F4F47] rounded-full p-4"
        onPress={onSwitchAudio}
      >
        <Feather
          name={isMicMuted ? "mic" : "mic-off"}
          size={26}
          color="#FEFBF4"
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-[#4F4F47] rounded-full p-4"
        onPress={onSwitchVideo}
      >
        <Feather
          name={isVideoMuted ? "video" : "video-off"}
          size={26}
          color="#FEFBF4"
        />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-appMediumRed rounded-full p-4"
        onPress={onEndCall}
      >
        <MaterialIcons name="call-end" size={26} color="#FEFBF4" />
      </TouchableOpacity>
    </View>
  );
};

export default VideoCallControlsComponent;
