import React, { useEffect, useRef } from "react";
import ProfilePhotoUpload from "../../ProfilePhotoUpload";
import { MultiStepRegisterData } from "../../../models/types/register.types";

interface PhotoStepProps {
  formData: MultiStepRegisterData;
  updateFormData: (field: keyof MultiStepRegisterData, value: any) => void;
  googlePhoto?: string;
  onDownloadGooglePhoto?: (photoUrl: string) => Promise<string | null>;
}

export const PhotoStep: React.FC<PhotoStepProps> = ({
  formData,
  updateFormData,
  googlePhoto,
  onDownloadGooglePhoto,
}) => {
  const processedGooglePhoto = useRef<string | null>(null);

  useEffect(() => {
    if (formData.isGoogleAccount === false) {
      if (processedGooglePhoto.current) {
        processedGooglePhoto.current = null;
      }
      return;
    }

    if (
      !googlePhoto ||
      processedGooglePhoto.current === googlePhoto ||
      formData.photo
    ) {
      return;
    }

    if (onDownloadGooglePhoto) {
      const loadGooglePhoto = async () => {
        try {
          const base64Photo = await onDownloadGooglePhoto(googlePhoto);
          if (base64Photo) {
            updateFormData("photo", base64Photo);
            updateFormData("googlePhoto", googlePhoto);
            processedGooglePhoto.current = googlePhoto;
          }
        } catch (error) {
          console.error("Error downloading Google photo:", error);
        }
      };
      loadGooglePhoto();
    }
  }, [googlePhoto, onDownloadGooglePhoto, formData.isGoogleAccount]);

  useEffect(() => {
    if (!formData.photo && processedGooglePhoto.current) {
      processedGooglePhoto.current = null;
    }
  }, [formData.photo]);

  return (
    <ProfilePhotoUpload
      photoUri={formData.photo}
      onPhotoChange={(uri) => updateFormData("photo", uri)}
    />
  );
};
