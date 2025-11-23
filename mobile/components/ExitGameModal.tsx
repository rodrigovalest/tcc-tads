import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import useI18n from "../hooks/useI18n";
import Button from "./Button";

interface ExitGameModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitGameModal: React.FC<ExitGameModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 items-center justify-center"
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="bg-appBgWhite rounded-xl p-6 mx-8 w-4/5 max-w-sm"
        >
          <Text className="text-xl font-nunito-bold text-appDarkGrey text-center mb-4">
            {t("wordBuilder.exitGame")}
          </Text>

          <Text className="text-base font-nunito-medium text-appMediumGrey text-center mb-6">
            {t("wordBuilder.confirmExit")}
          </Text>

          <View className="flex-row space-x-3 gap-4">
            <Button
              title={t("wordBuilder.no")}
              onPress={onCancel}
              className="flex-1"
              bgColor="bg-appLightGrey"
              bgColorActivate="bg-appMediumGrey"
              textColor="text-appDarkGrey"
              textColorActivate="text-appDarkGrey"
            />

            <Button
              title={t("wordBuilder.yes")}
              onPress={onConfirm}
              className="flex-1"
              bgColor="bg-appMediumRed"
              bgColorActivate="bg-red-700"
              textColor="text-appBgWhite"
              textColorActivate="text-appBgWhite"
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ExitGameModal;
