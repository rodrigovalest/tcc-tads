import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useI18n from "../hooks/useI18n";
import { useGoogleLink, useGoogleUnlink } from "../hooks/useGoogleAuth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Button from "./Button";

interface GoogleAccountLinkingProps {
  isLinked: boolean;
  userEmail?: string;
}

const GoogleAccountLinking: React.FC<GoogleAccountLinkingProps> = ({
  isLinked,
  userEmail,
}) => {
  const { t } = useI18n();
  const { mutate: linkGoogle, isPending: isLinking } = useGoogleLink();
  const { mutate: unlinkGoogle, isPending: isUnlinking } = useGoogleUnlink();

  const handleLinkGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error("Failed to get Google ID token");
      }

      linkGoogle(userInfo.data.idToken);
    } catch (error: any) {
      console.warn("Google linking error:", error);
    }
  };

  const handleUnlinkGoogle = () => {
    Alert.alert(
      t("profile.googleUnlink.confirm.title"),
      t("profile.googleUnlink.confirm.message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("profile.googleUnlink.confirm.button"),
          style: "destructive",
          onPress: () => unlinkGoogle(),
        },
      ]
    );
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4 border border-appLightGrey">
      <View className="flex-row items-center mb-3">
        <Ionicons name="logo-google" size={24} color="#4285F4" />
        <Text className="text-lg font-nunito-semibold ml-3 text-appDarkGrey">
          {t("profile.googleAccount.title")}
        </Text>
      </View>

      {isLinked ? (
        <View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-appDarkGrey font-nunito-medium ml-2">
              {t("profile.googleAccount.linked")}
            </Text>
          </View>

          {userEmail && (
            <Text className="text-appMediumGrey font-nunito-regular mb-3">
              {userEmail}
            </Text>
          )}

          <Button
            title={t("profile.googleAccount.unlink")}
            onPress={handleUnlinkGoogle}
            loading={isUnlinking}
            textSize="base"
            textColor="text-appRed"
            textColorActivate="text-white"
            bgColor="bg-white"
            bgColorActivate="bg-appRed"
            borderColor="border-appRed"
            borderColorActivate="border-appRed"
          />
        </View>
      ) : (
        <View>
          <Text className="text-appMediumGrey font-nunito-regular mb-3">
            {t("profile.googleAccount.notLinked")}
          </Text>

          <Button
            title={t("profile.googleAccount.link")}
            onPress={handleLinkGoogle}
            loading={isLinking}
            textSize="base"
            textColor="text-white"
            textColorActivate="text-white"
            bgColor="bg-black"
            bgColorActivate="bg-gray-700"
            borderColor="border-black"
            borderColorActivate="border-gray-700"
            iconLeft="google"
            iconLeftColor="white"
            iconLeftColorActivate="white"
          />
        </View>
      )}
    </View>
  );
};

export default GoogleAccountLinking;
