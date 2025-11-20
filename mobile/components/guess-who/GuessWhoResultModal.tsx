import { Modal, View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import IGuessWhoCharacter from "../../models/interfaces/guess-who/guess-who-character";
import { CHARACTERS } from "../../constants/guess-who-characters";

interface GuessWhoResultModalProps {
  status: "win" | "lose" | "wrong_guess" | "buddy_wrong_guess";
  guessCharacter: IGuessWhoCharacter | null;
  buddyCharacterWhenLose: IGuessWhoCharacter | null;
  onClose?: () => void; // opcional para buddy_wrong_guess
}

export default function GuessWhoResultModal({
  status,
  guessCharacter,
  buddyCharacterWhenLose,
}: GuessWhoResultModalProps) {
  if (!status) return null;

  return (
    <Modal 
			transparent 
			animationType="fade"
		>
      <View className="flex-1 bg-black/50 items-center justify-center px-8">
        <View className="bg-[#1E2330] rounded-2xl px-6 py-6 w-full items-center relative">
          {status === "win" && (
            <>
              <Text className="text-white text-lg font-semibold text-center mb-4">
                You did a correct guess and won! Congratulations!
              </Text>
            </>
          )}

          {status === "lose" && buddyCharacterWhenLose && (
            <>
              <Text className="text-white text-lg font-semibold text-center mb-3">
                {`You lost! Your buddy's character was:`}
              </Text>

              <Image
                source={CHARACTERS[buddyCharacterWhenLose.image]}
                className="w-28 h-28 mb-3"
                resizeMode="contain"
              />

              <Text className="text-white text-base font-bold text-center">
                {buddyCharacterWhenLose.name}
              </Text>
            </>
          )}

          {status === "wrong_guess" && (
            <>
              <Text className="text-white text-lg font-semibold text-center mb-2">
                You did a wrong guess!
              </Text>
            </>
          )}

          {status === "buddy_wrong_guess" && guessCharacter && (
            <>
              <Text className="text-white text-lg font-semibold text-center mb-3">
                {`Your buddy made a wrong guess:`}
              </Text>

              <Image
                source={CHARACTERS[guessCharacter.image]}
                className="w-28 h-28 mb-3"
                resizeMode="contain"
              />

              <Text className="text-white text-base font-bold text-center">
                {guessCharacter.name}
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
