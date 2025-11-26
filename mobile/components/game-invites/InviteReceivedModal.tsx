import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameInvite } from '../../services/game-invite-service';
import { AVALIABLE_MATCH_MODES } from '../../constants/available-match-modes';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';

interface InviteReceivedModalProps {
  visible: boolean;
  invite: GameInvite | null;
  onAccept: () => void;
  onReject: () => void;
}

export const InviteReceivedModal: React.FC<InviteReceivedModalProps> = ({
  visible,
  invite,
  onAccept,
  onReject,
}) => {
  const { t } = useI18n();
  
  if (!invite) {
    return null;
  }
  

  const matchMode = AVALIABLE_MATCH_MODES[invite.matchMode];
  const inviter = invite.inviter;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onReject}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-appBgWhite rounded-3xl p-6 w-full max-w-sm">
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-appYellow rounded-full items-center justify-center mb-4">
              <Ionicons name="game-controller" size={40} color={COLORS.appDarkGrey} />
            </View>

            <Text className="text-xl font-nunito-bold text-appBlack mb-2 text-center">
              {t('friends.gameInvite')}
            </Text>

            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-appMediumGrey rounded-full items-center justify-center mr-3">
                {inviter.photo ? (
                  <Image
                    source={{ uri: inviter.photo }}
                    className="w-12 h-12 rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={24} color="white" />
                )}
              </View>
              <View>
                <Text className="text-base font-nunito-bold text-appBlack">
                  {inviter.name || inviter.username}
                </Text>
                <Text className="text-sm font-nunito-regular text-appMediumGrey">
                  {t('friends.invitedYouToPlay')}
                </Text>
              </View>
            </View>

            {matchMode && (
              <View className="bg-appLightGrey rounded-xl p-4 w-full items-center">
                {matchMode.image && (
                  <Image
                    source={matchMode.image}
                    className="w-16 h-16 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                )}
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {matchMode.title}
                </Text>
                <Text className="text-sm font-nunito-regular text-appMediumGrey">
                  {t('friends.language')}: {invite.matchLanguage}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row">
            <TouchableOpacity
              onPress={onReject}
              className="flex-1 bg-appMediumGrey py-4 px-4 rounded-xl mr-2 items-center"
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text className="text-white font-nunito-bold text-base mt-1">
                Recusar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onAccept}
              className="flex-1 bg-appYellow py-4 px-4 rounded-xl ml-2 items-center"
            >
              <Ionicons name="checkmark-circle" size={24} color={COLORS.appDarkGrey} />
              <Text className="text-appDarkGrey font-nunito-bold text-base mt-1">
                Aceitar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

