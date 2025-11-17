import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { GuessWhoStage } from "../../../../models/types/guess-who-stage.type";
import Animated, { FadeIn, FadeOut, SlideInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import useAuthStore from "../../../../store/auth-store";
import useMatchStore from "../../../../store/match-store";
import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { COLORS } from "../../../../constants/colors";
import useGuessWhoDuo from "../../../../hooks/useGuessWhoDuo";
import useGuessWhoStore from "../../../../store/guess-who-store";
import { CHARACTERS } from "../../../../constants/guess-who-characters";
import GuessWhoVideoCardComponent from "../../../../components/guess-who/GuessWhoVideoCard";
import GuessWhoTimerComponent from "../../../../components/guess-who/GuessWhoTimer";
import VideoCallControlsComponent from "../../../../components/guess-who/VideoCallControls";
import GuessWhoModal from "../../../../components/guess-who/GuessWhoModal";
import GuessWhoCharacter from "../../../../components/guess-who/GuessWhoCharacter";
import IGuessWhoCharacter from "../../../../models/interfaces/guess-who-character";
import GuessWhoCharacterSelectModal from "../../../../components/guess-who/GuessWhoCharacterSelectModal";

export default function GuessWhoDuoGame() {
  const [stage, setStage] = useState<GuessWhoStage>("intro");
  const {
    localStream,
    remoteStream,
    start,
    switchAudio,
    switchVideo,
    isMicMuted,
    isVideoMuted,
    endCall,
    handleAnswer,
  } = useGuessWhoDuo(() => {
    router.replace("/(private)/match-rate-duo");
  });

  const { user: loggedUser } = useAuthStore();
  const { buddy } = useMatchStore();
  const { 
    characters, 
    pairCharacter,
    roundStartTime,
    roundEndTime,
    status,
    eliminated,
    toggleEliminated,
  } = useGuessWhoStore();
  const [selectedCharacter, setSelectedCharacter] = useState<IGuessWhoCharacter | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage("reveal"), 5000),
      setTimeout(() => setStage("game"), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    start();

    return () => {
      endCall();
    };
  }, []);

  if (status === "answering" || status === "questioning" || status === "waiting") {
    console.log(status, roundStartTime, roundEndTime);
  }

  return (
    <LinearGradient
      colors={["#501E3F", "#49AA8F"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      {stage === "intro" && (
        <Animated.View
          entering={FadeIn.duration(800)}
          exiting={FadeOut.duration(1000)}
          className="items-center px-6"
        >
          <Text className="text-appBgWhite text-4xl font-nunito-bold text-center">
            Guess Who
          </Text>

          <View className="flex-row justify-between items-center w-full px-10 my-6">
            <View className="items-center">
              <View className="relative">
                <View className="p-1 bg-appBgWhite rounded-full">
                  {loggedUser?.photoUri ? (
                    <Image
                      source={{ uri: loggedUser.photoUri }}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="account"
                      size={70}
                      color={COLORS.appDarkGrey}
                    />
                  )}
                </View>

                <Image
                  source={require("../../../../assets/images/flags/brazil.png")}
                  className="w-8 h-8 rounded-full absolute -top-2 -right-2 border-2 border-white"
                />
              </View>

              <Text className="my-2 text-appBgWhite text-xl font-nunito-medium">
                {loggedUser?.username || "João"}
              </Text>
            </View>

            <Text className="text-appBgWhite text-2xl font-nunito-bold">
              vs.
            </Text>

            <View className="items-center">
              <View className="relative">
                <View className="p-1 bg-appBgWhite rounded-full">
                  {buddy?.photoUri ? (
                    <Image
                      source={{ uri: buddy.photoUri }}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="account"
                      size={70}
                      color={COLORS.appDarkGrey}
                    />
                  )}
                </View>

                <Image
                  source={require("../../../../assets/images/flags/brazil.png")}
                  className="w-8 h-8 rounded-full absolute -top-2 -right-2 border-2 border-white"
                />
              </View>

              <Text className="my-2 text-appBgWhite text-xl font-nunito-medium">
                {buddy?.username || "Adam"}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {stage === "reveal" && (
        <Animated.View
          entering={SlideInUp.springify().damping(14)}
          exiting={FadeOut.duration(1000)}
          className="items-center"
        >
          <View className="bg-[#E5FF55] rounded-2xl pb-6 px-8 items-center mt-12 relative">
            <View className="absolute -top-12">
              <Image
                source={CHARACTERS[pairCharacter!.image]}
                className="w-36 h-36"
                resizeMode="contain"
              />
            </View>

            <Text className="text-appDarkGrey text-base font-nunito-medium mt-28">
              Buddy character's is:
            </Text>

            <Text className="text-appDarkGrey text-4xl font-nunito-bold">
              {pairCharacter!.name}
            </Text>
          </View>
        </Animated.View>
      )}

      {stage === "game" && (
        <View className="w-full h-full items-center bg-gradient-to-b from-[#3B1347] to-[#0C141F]">
          {/* --- Header --- */}
          <View className="flex-row justify-between items-center w-full px-6 pt-8">
            {/* Player 1 */}
            <GuessWhoVideoCardComponent
              stream={localStream}
              name={loggedUser?.username || "you"}
              countryFlag={require("../../../../assets/images/flags/brazil.png")}
            />

            {/* Timer */}
            {roundStartTime && roundEndTime && (
              <GuessWhoTimerComponent
                startTime={new Date(roundStartTime)}
                endTime={new Date(roundEndTime)}
              />
            )}

            {/* Player 2 */}
            <GuessWhoVideoCardComponent
              stream={remoteStream}
              name={buddy?.username || "Buddy"}
              countryFlag={require("../../../../assets/images/flags/brazil.png")}
            />
          </View>

          {/* Board */}
          <View className="bg-appDarkGrey w-[95%] justify-center items-center p-4 mt-4 rounded-2xl">
            <View className="bg-[#E5FF55] rounded-2xl pb-2 px-4 items-center mt-12 w-auto">
              <View className="absolute -top-12">
                <Image
                  source={CHARACTERS[pairCharacter!.image]}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
              </View>

              <Text className="text-appDarkGrey text-xs font-nunito-medium mt-10">
                Buddy character's is
              </Text>

              <Text className="text-appDarkGrey text-xl font-nunito-bold">
                {pairCharacter!.name}
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={{ alignItems: "center" }}
              className="mt-8 mb-2 flex-grow"
            >
              <View className="flex-wrap flex-row justify-center">
                {characters!.map((char: IGuessWhoCharacter) => {
                  return (
                    <GuessWhoCharacter
                      key={char.id}
                      id={char.id}
                      name={char.name}
                      image={CHARACTERS[char.image]}
                      disabled={eliminated[char.id] === true}
                      onPress={() => { setSelectedCharacter(char) }}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
          
          {(status === "answering" || status === "questioning" || status === "waiting") && (
            <GuessWhoModal
              startTime={roundStartTime ? new Date(roundStartTime) : new Date()}
              endTime={roundEndTime ? new Date(roundEndTime) : new Date()}
              status={status}
              onAnswer={handleAnswer}
              visible={true}
            />
          )}

          {/* --- Bottom controls */}
          <VideoCallControlsComponent
            onSwitchAudio={switchAudio}
            onSwitchVideo={switchVideo}
            onEndCall={endCall}
            isMicMuted={isMicMuted}
            isVideoMuted={isVideoMuted}
          />

          <GuessWhoCharacterSelectModal
            visible={selectedCharacter !== null}
            character={selectedCharacter}
            eliminated={selectedCharacter ? eliminated?.[selectedCharacter.id] === true : false}
            onToggle={(id) => toggleEliminated(id)}
            onClose={() => setSelectedCharacter(null)}
            onGuess={(id) => console.log("palpite", id)}
          />
        </View>
      )}
    </LinearGradient>
  );
}
