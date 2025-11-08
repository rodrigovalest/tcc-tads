import React from "react";
import { View, Text, Modal, TouchableOpacity, Image } from "react-native";
import useI18n from "../hooks/useI18n";
import Button from "./Button";
import { ImageSourcePropType } from "react-native";

interface AdversaryCorrectAnswerModalProps {
  visible: boolean;
  correctImage?: ImageSourcePropType | null;
}

const AdversaryCorrectAnswerModal: React.FC<AdversaryCorrectAnswerModalProps> = ({
  visible,
  correctImage,
}) => {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-appBgWhite rounded-xl p-6 mx-8 w-4/5 max-w-sm">
          <Text className="text-xl font-nunito-bold text-appDarkGrey text-center mb-4">
            🎉 aaaaaaaaaa 🎉
          </Text>

          <Text className="text-base font-nunito-medium text-appMediumGrey text-center mb-4">
            O personagem que você era (que estava na tela do seu adversário):
          </Text>

          {correctImage && (
            <View className="w-full h-48 mb-6 rounded-xl overflow-hidden border-2 border-appBlack">
              <Image
                source={correctImage}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}

          <Text className="text-base font-nunito-medium text-appMediumGrey text-center mb-6">
            aaaaaaaaaa 🎊
          </Text>

          <Text className="text-sm font-nunito-medium text-appMediumGrey text-center">
            Continuando automaticamente...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default AdversaryCorrectAnswerModal;
