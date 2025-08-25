import React from "react";
import { View, Text } from "react-native";
import useI18n from "../hooks/useI18n";
import { PhotoPreview } from "./PhotoPreview";
import { PhotoActions } from "./PhotoActions";
import { usePhotoUpload } from "../hooks/usePhotoUpload";

interface ProfilePhotoUploadProps {
  photoUri?: string;
  onPhotoChange: (uri: string | null) => void;
  showOptionalMessage?: boolean;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  photoUri,
  onPhotoChange,
  showOptionalMessage = true,
}) => {
  const { t } = useI18n();
  const { isLoading, pickFromGallery, takePhoto, removePhoto } = usePhotoUpload({
    onPhotoChange,
  });

  return (
    <View className="space-y-6">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-800 text-center">
          {t('register.photo.title')}
        </Text>
        <Text className="text-sm text-gray-600 text-center mt-2">
          {t('register.photo.subtitle')}
        </Text>
      </View>

      <PhotoPreview 
        photoUri={photoUri} 
        onRemove={removePhoto}
      />

      <PhotoActions
        isLoading={isLoading}
        onTakePhoto={takePhoto}
        onPickFromGallery={pickFromGallery}
      />

      {showOptionalMessage && (
        <Text className="text-xs text-gray-500 text-center mt-4">
          {t('register.photo.optional')}
        </Text>
      )}
    </View>
  );
};

export default ProfilePhotoUpload;
