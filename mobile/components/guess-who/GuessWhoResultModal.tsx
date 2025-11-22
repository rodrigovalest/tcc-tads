import { Modal, View, Text, Image } from "react-native";
import IGuessWhoCharacter from "../../models/interfaces/guess-who/guess-who-character";
import { CHARACTERS } from "../../constants/guess-who-characters";
import useI18n from "../../hooks/useI18n";

interface GuessWhoResultModalProps {
  status: "win" | "lose" | "wrong_guess" | "buddy_wrong_guess";
  guessCharacter: IGuessWhoCharacter | null;
  buddyCharacterWhenLose: IGuessWhoCharacter | null;
  onClose?: () => void;
}

export default function GuessWhoResultModal({
  status,
  guessCharacter,
  buddyCharacterWhenLose,
}: GuessWhoResultModalProps) {
  const { t } = useI18n();

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
              <Text className="text-white text-xl mb-2 text-center font-nunito-bold">
                {t("guessWho.winTitle")}
              </Text>
              
              <Text className="text-white text-lg font-nunito-semibold text-center mb-4">
                {t("guessWho.winDescription")}
              </Text>
            </>
          )}

          {status === "lose" && buddyCharacterWhenLose && (
            <>
              <Text className="text-white text-xl mb-2 text-center font-nunito-bold">
                {t("guessWho.loseTitle")}
              </Text>

              <Text className="text-white text-lg font-nunito-semibold text-center mb-3">
                {t("guessWho.loseDescription")}
              </Text>

              <Image
                source={CHARACTERS[buddyCharacterWhenLose.image]}
                className="w-28 h-28 mb-3"
                resizeMode="contain"
              />

              <Text className="text-white text-base font-nunito-bold text-center">
                {buddyCharacterWhenLose.name}
              </Text>
            </>
          )}

          {status === "wrong_guess" && (
            <>
              <Text className="text-white text-lg font-semibold text-center mb-2">
                {t("guessWho.wrong_guess")}
              </Text>
            </>
          )}

          {status === "buddy_wrong_guess" && guessCharacter && (
            <>
              <Text className="text-white text-lg font-semibold text-center mb-3">
                {t("guessWho.buddy_wrong_guess")}
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
