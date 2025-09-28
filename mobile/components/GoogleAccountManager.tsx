import React from "react";
import { View, Text, Alert } from "react-native";
import Button from "./Button";
import { useGoogleLink, useGoogleUnlink } from "../hooks/useGoogleAuth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useI18n from "../hooks/useI18n";

interface GoogleAccountManagerProps {
  isLinked: boolean;
  googleEmail?: string;
  onUpdate?: () => void;
}

const GoogleAccountManager: React.FC<GoogleAccountManagerProps> = ({
  isLinked,
  googleEmail,
  onUpdate,
}) => {
  const { t } = useI18n();
  const { mutate: linkGoogle, isPending: isLinking } = useGoogleLink();
  const { mutate: unlinkGoogle, isPending: isUnlinking } = useGoogleUnlink();

  const handleLinkGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        linkGoogle(userInfo.data.idToken, {
          onSuccess: () => {
            onUpdate?.();
          },
        });
      }
    } catch (error: any) {
      if (error.code === "SIGN_IN_CANCELLED") {
        return;
      }
      console.error("Google linking error:", error);
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
          text: t("profile.googleUnlink.confirm.action"),
          style: "destructive",
          onPress: () => {
            unlinkGoogle(undefined, {
              onSuccess: () => {
                onUpdate?.();
              },
            });
          },
        },
      ]
    );
  };

  if (isLinked) {
    return (
      <View className="bg-white rounded-lg p-4 mb-4 border border-appLightGrey">
        <Text className="text-lg font-nunito-bold text-appDarkGrey mb-2">
          {t("profile.googleAccount.title")}
        </Text>

        <View className="flex-row items-center mb-3">
          <Text className="text-sm text-appMediumGrey">
            {t("profile.googleAccount.linkedTo")}:
          </Text>
          <Text className="text-sm text-appDarkGrey ml-2 font-nunito-medium">
            {googleEmail}
          </Text>
        </View>

        <Button
          title={t("profile.googleAccount.unlink")}
          onPress={handleUnlinkGoogle}
          loading={isUnlinking}
          textColor="text-appRed"
          textColorActivate="text-white"
          textSize="base"
          bgColor="bg-white"
          bgColorActivate="bg-appRed"
          borderColor="border-appRed"
          borderColorActivate="border-appRed"
        />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 mb-4 border border-appLightGrey">
      <Text className="text-lg font-nunito-bold text-appDarkGrey mb-2">
        {t("profile.googleAccount.title")}
      </Text>

      <Text className="text-sm text-appMediumGrey mb-4">
        {t("profile.googleAccount.linkDescription")}
      </Text>

      <Button
        title={t("profile.googleAccount.link")}
        onPress={handleLinkGoogle}
        loading={isLinking}
        textColor="text-black"
        textColorActivate="text-white"
        textSize="base"
        bgColor="bg-white"
        bgColorActivate="bg-black"
        borderColor="border-appLightGrey"
        borderColorActivate="border-black"
        iconLeft="google"
        iconLeftColor="black"
        iconLeftColorActivate="white"
      />
    </View>
  );
};

export default GoogleAccountManager;
