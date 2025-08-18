import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import useI18n from "../hooks/useI18n";

interface ProfilePhotoUploadProps {
  photoUri?: string;
  onPhotoChange: (uri: string | null) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  photoUri,
  onPhotoChange,
}) => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t('register.photo.permissionRequired'),
        t('register.photo.galleryPermission')
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t('register.photo.permissionRequired'),
        t('register.photo.cameraPermission')
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (!(await requestPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduzido para 50% da qualidade
        base64: false, // Não converter para base64 ainda
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('register.photo.errorTitle'), t('register.photo.errorSelectImage'));
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!(await requestCameraPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduzido para 50% da qualidade
        base64: false, // Não converter para base64 ainda
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('register.photo.errorTitle'), t('register.photo.errorTakePhoto'));
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = () => {
    Alert.alert(
      t('register.photo.removePhoto'),
      t('register.photo.removePhotoConfirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('register.photo.remove'), style: "destructive", onPress: () => onPhotoChange(null) },
      ]
    );
  };

  return (
    <View className="space-y-6">
      <Text className="text-lg font-semibold text-gray-800 text-center">
        {t('register.photo.title')}
      </Text>
      
      <Text className="text-sm text-gray-600 text-center">
        {t('register.photo.subtitle')}
      </Text>

      {/* Photo display */}
      <View className="items-center">
        {photoUri ? (
          <View className="relative">
            <Image
              source={{ uri: photoUri }}
              className="w-32 h-32 rounded-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={removePhoto}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-32 h-32 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 items-center justify-center">
            <Ionicons name="person" size={48} color="#9ca3af" />
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View className="space-y-3">
        <TouchableOpacity
          onPress={takePhoto}
          disabled={isLoading}
          className="flex-row items-center justify-center space-x-2 bg-blue-500 p-4 rounded-lg"
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text className="text-white font-medium text-lg">
            {isLoading ? t('register.photo.loading') : t('register.photo.takePhoto')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          disabled={isLoading}
          className="flex-row items-center justify-center space-x-2 bg-gray-500 p-4 rounded-lg"
        >
          <Ionicons name="images" size={20} color="white" />
          <Text className="text-white font-medium text-lg">
            {isLoading ? t('register.photo.loading') : t('register.photo.chooseFromGallery')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-xs text-gray-500 text-center">
        {t('register.photo.optional')}
      </Text>
    </View>
  );
};

export default ProfilePhotoUpload; 