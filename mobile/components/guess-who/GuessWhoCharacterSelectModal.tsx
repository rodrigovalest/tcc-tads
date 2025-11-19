import { View, Text, TouchableOpacity, Image, Modal, Pressable } from "react-native";
import IGuessWhoCharacter from "../../models/interfaces/guess-who-character";
import { CHARACTERS } from "../../constants/guess-who-characters";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export interface GuessWhoCharacterSelectModalProps {
  visible: boolean;
  character: IGuessWhoCharacter | null;
  eliminated: boolean;
  onClose: () => void;
  onToggle: (characterId: string) => void;
  onGuess?: (guessCharacter: IGuessWhoCharacter) => void;
}

export default function GuessWhoCharacterSelectModal({
  visible,
  character,
  eliminated,
  onClose,
  onToggle,
  onGuess,
}: GuessWhoCharacterSelectModalProps) {
  if (!character) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable 
        className="flex-1 bg-[rgba(0,0,0,0.45)] justify-center items-center"
        onPress={onClose}
      >

        {/* Card — impedir clique fechar */}
        <Pressable 
          className="bg-[#1E2530] w-[80%] rounded-2xl p-6 items-center relative"
          onPress={(e) => e.stopPropagation()}
        >
          {/* X button */}
          <TouchableOpacity 
            onPress={onClose} 
            className="absolute top-3 right-3 bg-red-600 rounded-full w-8 h-8 items-center justify-center"
          >
            <MaterialCommunityIcons name="close" size={18} color="white" />
          </TouchableOpacity>

          {/* Character */}
          <Image
            source={CHARACTERS[character.image]}
            className="w-24 h-24 mb-3"
            resizeMode="contain"
          />

          {/* Title */}
          <Text className="text-white text-lg font-semibold mb-1">
            You select
          </Text>

          <Text className="text-white text-3xl font-bold mb-5">
            {character.name}
          </Text>

          {/* DESCARTAR */}
          <TouchableOpacity
            className="bg-[#2E3742] px-6 py-3 rounded-full w-full items-center mb-3 flex-row justify-center gap-2"
            onPress={() => {
              onToggle(character.id);
              onClose();
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#FF6B6B" />
            <Text className="text-white text-base font-semibold">
              DESCARTAR
            </Text>
          </TouchableOpacity>

          {/* DAR UM PALPITE */}
          <TouchableOpacity
            className="bg-[#2E3742] px-6 py-3 rounded-full w-full items-center flex-row justify-center gap-2"
            onPress={() => {
              onGuess?.(character);
              onClose();
            }}
          >
            <MaterialCommunityIcons name="check" size={20} color="#59C36A" />
            <Text className="text-[#59C36A] text-base font-semibold">
              DAR UM PALPITE
            </Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}
