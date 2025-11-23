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
import IGuessWhoCharacter from "../../../../models/interfaces/guess-who/guess-who-character";
import GuessWhoCharacterSelectModal from "../../../../components/guess-who/GuessWhoCharacterSelectModal";
import { GuessWhoYourCharacterCardComponent } from "../../../../components/guess-who/GuessWhoYourCharacterCard";
import GuessWhoAnswerModal from "../../../../components/guess-who/GuessWhoAnswerModal";
import GuessWhoResultModal from "../../../../components/guess-who/GuessWhoResultModal";
import useI18n from "../../../../hooks/useI18n";
import { getCountryData } from "../../../../utils/country-language-utils";

export default function GuessWhoDuoGame() {
  const { t } = useI18n();
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
    handleGuess,
  } = useGuessWhoDuo(() => {
    router.replace("/(private)/match-rate-duo");
  });

  const { user: loggedUser } = useAuthStore();
  const { buddy } = useMatchStore();
  const { 
    characters, 
    yourCharacter,
    roundStartTime,
    roundEndTime,
    status,
    eliminated,
    answer,
    guessCharacter,
    buddyCharacterWhenLose,
    toggleEliminated,
    clearAnswer,
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

  const gradientColors: readonly [string, string] = (() => {
    if (status === "win") return ["#4F2241", "#194E16"] as const;
    if (status === "lose") return ["#4F2241", "#870E0E"] as const;
    return ["#501E3F", "#49AA8F"] as const;
  })();

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      {stage === "intro" && (
        <Animated.View
          entering={FadeIn.duration(800)}
          className="items-center px-6"
        >
          <Text className="text-appBgWhite text-4xl font-nunito-bold text-center">
            {t("guessWho.title")}
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
              </View>

              <Text className="my-2 text-appBgWhite text-xl font-nunito-medium">
                {`${getCountryData(loggedUser!.nationality)?.flag || "🏳️"} ${loggedUser?.username || t("common.you")}`}
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
              </View>

              <Text className="my-2 text-appBgWhite text-xl font-nunito-medium">
                {`${getCountryData(buddy!.nationality)?.flag || "🏳️"} ${buddy?.username || t("common.opponent")}`}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {stage === "reveal" && (
        <Animated.View
          entering={SlideInUp.springify().damping(14)}
          className="items-center"
        >
          <View className="bg-[#E5FF55] rounded-2xl pb-6 px-8 items-center mt-12 relative">
            <View className="absolute -top-12">
              <Image
                source={CHARACTERS[yourCharacter!.image]}
                className="w-36 h-36"
                resizeMode="contain"
              />
            </View>

            <Text className="text-appDarkGrey text-base font-nunito-medium mt-28">
              {t("guessWho.yourCharacter")}
            </Text>

            <Text className="text-appDarkGrey text-4xl font-nunito-bold">
              {yourCharacter!.name}
            </Text>
          </View>
        </Animated.View>
      )}

      {stage === "game" && (
        <View className="w-full h-full items-center">
          {/* --- Header --- */}
          <View className="flex-row justify-between items-center w-full px-6 pt-8">
            {/* Player 1 */}
            <GuessWhoVideoCardComponent
              stream={localStream}
              name={loggedUser?.username || t("common.you")}
              countryFlagEmoji={getCountryData(loggedUser!.nationality)?.flag || "🏳️"}
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
              name={buddy?.username || t("common.opponent")}
              countryFlagEmoji={getCountryData(buddy!.nationality)?.flag || "🏳️"}
            />
          </View>

          {/* Board */}
          <View className="bg-appDarkGrey w-[95%] justify-center items-center p-4 mt-4 rounded-2xl">
            <GuessWhoYourCharacterCardComponent 
              image={yourCharacter!.image}
              name={yourCharacter!.name}
            />

            <ScrollView
              contentContainerStyle={{ alignItems: "center" }}
              className="mt-6 mb-2 flex-grow"
            >
              <View className="flex-wrap flex-row justify-center">
                {characters!.map((char) => (
                  <GuessWhoCharacter
                    key={char.id}
                    name={char.name}
                    image={CHARACTERS[char.image]}
                    disabled={eliminated[char.id]}
                    onPress={() => setSelectedCharacter(char)}
                  />
                ))}
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

          {status === "guessing_or_unmarking" && answer !== null && (
            <GuessWhoAnswerModal
              visible={true}
              answer={answer}
              onClose={() => { clearAnswer() }}
            />
          )}

          <GuessWhoCharacterSelectModal
            visible={(status === "guessing_or_unmarking") && (selectedCharacter !== null)}
            character={selectedCharacter}
            eliminated={selectedCharacter ? eliminated?.[selectedCharacter.id] === true : false}
            onToggle={(id) => toggleEliminated(id)}
            onClose={() => setSelectedCharacter(null)}
            onGuess={(selectedCharacter) =>  { handleGuess(selectedCharacter) }}
          />

          {(status === "win" || status === "lose" || status === "wrong_guess" || status === "buddy_wrong_guess") && (
            <GuessWhoResultModal 
              status={status} 
              guessCharacter={guessCharacter} 
              buddyCharacterWhenLose={buddyCharacterWhenLose}          
            />
          )}
        </View>
      )}
    </LinearGradient>
  );
}
