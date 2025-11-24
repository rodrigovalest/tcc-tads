import React from "react";
import { View, Text, Modal, Image } from "react-native";
import useI18n from "../../hooks/useI18n";
import { ImageSourcePropType } from "react-native";

interface CorrectAnswerModalProps {
  visible: boolean;
  correctImage?: ImageSourcePropType | null;
  characterName?: string;
  isGiveUp?: boolean;
}

const CorrectAnswerModal: React.FC<CorrectAnswerModalProps> = ({
  visible,
  correctImage,
  characterName,
  isGiveUp = false,
}) => {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="rounded-xl p-6 mx-8 w-4/5 max-w-sm" style={{ backgroundColor: '#1C1D2C', borderWidth: 2, borderColor: '#E5FF55' }}>
        <Text className="text-xl font-nunito-bold text-appBgWhite text-center mb-4">
            {isGiveUp ? "Uh oh, " : `${t("whoAmI.congrats")},`} {t("whoAmI.itWas")}
          </Text>

          <Text className="text-xl font-nunito-bold text-appBgWhite text-center mb-4">
            {characterName || ""}
          </Text>

          {correctImage && (
            <View className="w-full h-80 mb-6 rounded-2xl overflow-hidden">
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
            {t("whoAmI.loadingCharacter")}      
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default CorrectAnswerModal;
