import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameInvite } from '../../services/game-invite-service';
import { COLORS } from '../../constants/colors';
import useI18n from '../../hooks/useI18n';
import { AVALIABLE_MATCH_MODES } from '../../constants/available-match-modes';

interface GameInviteCardProps {
  invite: GameInvite;
  onAccept?: (inviteId: number) => void;
  onReject?: (inviteId: number) => void;
  onCancel?: (inviteId: number) => void;
  isReceived?: boolean;
}

export const GameInviteCard: React.FC<GameInviteCardProps> = ({
  invite,
  onAccept,
  onReject,
  onCancel,
  isReceived = true,
}) => {
  const { t } = useI18n();
  const matchMode = AVALIABLE_MATCH_MODES[invite.matchMode];
  const user = isReceived ? invite.inviter : invite.invitee;

  return (
    <View className="bg-appLightGrey rounded-xl p-5 mb-4">
      <View className="flex-row items-center mb-4">
        <View className="w-14 h-14 bg-appMediumGrey rounded-full items-center justify-center mr-4">
          {user.photo ? (
            <Image
              source={{ uri: user.photo }}
              className="w-14 h-14 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color="white" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-lg font-nunito-bold text-appBlack">
            {user.name || user.username}
          </Text>
          <Text className="text-sm font-nunito-medium text-appMediumGrey mb-1">
            @{user.username}
          </Text>
        </View>
      </View>

      <View className="bg-appBgBeige rounded-lg p-4 mb-4">
        <View className="flex-row items-center mb-2">
          {matchMode?.image && (
            <Image
              source={matchMode.image}
              className="w-12 h-12 rounded-lg mr-3"
              resizeMode="cover"
            />
          )}
          <View className="flex-1">
            <Text className="text-base font-nunito-bold text-appBlack">
              {matchMode?.title || invite.matchMode}
            </Text>
            <Text className="text-sm font-nunito-regular text-appMediumGrey">
              Idioma: {invite.matchLanguage}
            </Text>
          </View>
        </View>
      </View>

      {isReceived ? (
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => onAccept?.(invite.id)}
            className="flex-1 bg-appYellow py-3 px-4 rounded-xl flex-row items-center justify-center mr-2"
          >
            <Ionicons name="checkmark-circle" size={18} color={COLORS.appDarkGrey} />
            <Text className="text-appDarkGrey font-nunito-bold text-base ml-2">
              Aceitar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onReject?.(invite.id)}
            className="flex-1 bg-appMediumRed py-3 px-4 rounded-xl flex-row items-center justify-center ml-2"
          >
            <Ionicons name="close-circle" size={18} color="white" />
            <Text className="text-white font-nunito-bold text-base ml-2">
              Recusar
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => onCancel?.(invite.id)}
          className="w-full bg-appMediumGrey py-3 px-4 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="close-circle" size={18} color="white" />
          <Text className="text-white font-nunito-bold text-base ml-2">
            Cancelar Convite
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


