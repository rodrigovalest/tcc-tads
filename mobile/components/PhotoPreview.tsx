import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PhotoPreviewProps {
  photoUri?: string;
  onRemove: () => void;
}
export const PhotoPreview: React.FC<PhotoPreviewProps> = ({ 
  photoUri, 
  onRemove 
}) => {
  return (
    <View className="items-center my-6">
      {photoUri ? (
        <View className="relative">
          <Image
            source={{ uri: photoUri }}
            className="w-32 h-32 rounded-full"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={onRemove}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
            accessibilityLabel="Remove photo"
            accessibilityRole="button"
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
  );
};
