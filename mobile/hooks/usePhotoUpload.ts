import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import useI18n from "./useI18n";

interface UsePhotoUploadProps {
  onPhotoChange: (uri: string | null) => void;
}

interface UsePhotoUploadReturn {
  isLoading: boolean;
  pickFromGallery: () => Promise<void>;
  takePhoto: () => Promise<void>;
  removePhoto: () => void;
}

export const usePhotoUpload = ({
  onPhotoChange,
}: UsePhotoUploadProps): UsePhotoUploadReturn => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const requestGalleryPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return false;
    }
    return true;
  };

  const pickFromGallery = async (): Promise<void> => {
    if (!(await requestGalleryPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        t("register.photo.errorTitle"),
        t("register.photo.errorSelectImage")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async (): Promise<void> => {
    if (!(await requestCameraPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        t("register.photo.errorTitle"),
        t("register.photo.errorTakePhoto")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = (): void => {
    Alert.alert(
      t("register.photo.removePhoto"),
      t("register.photo.removePhotoConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("register.photo.remove"),
          style: "destructive",
          onPress: () => onPhotoChange(null),
        },
      ]
    );
  };

  return {
    isLoading,
    pickFromGallery,
    takePhoto,
    removePhoto,
  };
};
