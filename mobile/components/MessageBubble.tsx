import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useI18n from '../hooks/useI18n';
import { Message } from '../types/friendship.types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showTime?: boolean;
  onLongPress?: () => void;
}
export default function MessageBubble({ 
  message, 
  isOwnMessage, 
  showTime = true,
  onLongPress 
}: MessageBubbleProps) {
  const { t } = useI18n();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.7}
      className={`mb-3 ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      <View className={`max-w-[85%]`}>
        <View className={`${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <View
            className={`px-4 py-3 rounded-2xl ${
              isOwnMessage
                ? 'bg-appBlack rounded-br-md'
                : 'bg-white border border-appLighterGray rounded-bl-md shadow-sm'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              className={`text-base font-nunito-regular leading-5 ${
                isOwnMessage ? 'text-white' : 'text-appBlack'
              }`}
            >
              {message.content}
            </Text>
          </View>
          
          {showTime && (
            <View className={`flex-row items-center mt-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
              <Text className="text-xs font-nunito-regular text-appMediumGrey mr-1">
                {formatTime(message.createdAt)}
              </Text>
              {isOwnMessage && (
                <View className="ml-1">
                  {message.isRead ? (
                    <Ionicons name="checkmark-done" size={12} color="#4CAF50" />
                  ) : (
                    <Ionicons name="checkmark" size={12} color="#7C7C7F" />
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
