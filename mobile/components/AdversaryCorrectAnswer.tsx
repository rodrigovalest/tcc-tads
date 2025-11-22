import React from "react";
import { View, Text, Modal, TouchableOpacity, Image } from "react-native";
import useI18n from "../hooks/useI18n";
import Button from "./Button";
import { ImageSourcePropType } from "react-native";

interface AdversaryCorrectAnswerModalProps {
  visible: boolean;
  correctImage?: ImageSourcePropType | null;
  characterName?: string;
  isGiveUp?: boolean;
  adversaryIsImageRole?: boolean;
  myIsImageRole?: boolean;
}

const AdversaryCorrectAnswerModal: React.FC<AdversaryCorrectAnswerModalProps> = ({
  visible,
  correctImage,
  characterName,
  isGiveUp = false,
  adversaryIsImageRole = false,
  myIsImageRole = false,
}) => {
  const { t } = useI18n();


  const getMessage = () => {
    if (isGiveUp) {
      return "Your adversary surrendered";
    }
    return "Congrats,";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="rounded-xl p-6 mx-8 w-4/5 max-w-sm" style={{ backgroundColor: '#1C1D2C', borderWidth: 2, borderColor: '#E5FF55' }}>
        <Text className="text-xl font-nunito-bold text-appBgWhite text-center mb-4">
            {isGiveUp ? "Your adversary surrendered" : "Congrats,"} {!isGiveUp && "It was"}
          </Text>
          <Text className="text-xl font-nunito-bold text-appBgWhite text-center mb-4">
            {characterName || ""}
          </Text>

          
          {correctImage && (
            <View className="w-full h-80 mb-6 rounded-xl overflow-hidden">
              <Image
                source={correctImage}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          )}

          <Text className="text-base font-nunito-medium text-appMediumGrey text-center mb-6">
          </Text>

          <Text className="text-sm font-nunito-medium text-appBgWhite text-center">
            Loading a new character...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default AdversaryCorrectAnswerModal;
