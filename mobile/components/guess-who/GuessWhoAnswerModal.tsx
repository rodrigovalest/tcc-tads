import { Modal, Text, TouchableOpacity, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface GuessWhoAnswerModalProps {
  visible: boolean;
  answer: boolean;
  onClose: () => void;
}

export default function GuessWhoAnswerModal({
  visible,
  answer,
  onClose,
}: GuessWhoAnswerModalProps) {
  const message = answer
    ? "A resposta foi SIM! Elimine personagens ou tente um palpite."
    : "A resposta foi NÃO! Elimine personagens ou tente um palpite.";

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

          {/* Title */}
          <Text className="text-white text-lg font-semibold mb-1">
            {message}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
