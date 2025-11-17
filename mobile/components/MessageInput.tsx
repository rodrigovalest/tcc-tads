import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useI18n from '../hooks/useI18n';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function MessageInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder,
  maxLength = 1000
}: MessageInputProps) {
  const { t } = useI18n();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (text: string) => {
    setMessage(text);
    
    if (text.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    }
    
    if (!text.trim() && isTyping) {
      setIsTyping(false);
      onTypingStop();
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (text.trim()) {
      typingTimeoutRef.current = window.setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTypingStop();
        }
      }, 1000);
    }
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (trimmedMessage.length > maxLength) {
      Alert.alert(
        t('chat.messageTooLong'),
        t('chat.messageTooLongDescription', { maxLength })
      );
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
    
    if (isTyping) {
      setIsTyping(false);
      onTypingStop();
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <View className="flex-row items-end px-4 py-3 bg-white border-t border-appLighterGray">
      <View className="flex-1 bg-appLightGrey rounded-2xl px-4 py-3 mr-3 max-h-24">
        <TextInput
          className="text-base font-nunito-regular text-appBlack"
          placeholder={placeholder || t('chat.typeMessage')}
          placeholderTextColor="#7C7C7F"
          value={message}
          onChangeText={handleTextChange}
          onKeyPress={handleKeyPress}
          multiline
          maxLength={maxLength}
          editable={!disabled}
          style={{
            minHeight: 20,
            maxHeight: 80,
          }}
        />
      </View>
      
      <TouchableOpacity
        onPress={handleSend}
        disabled={!message.trim() || disabled}
        className={`w-12 h-12 rounded-full items-center justify-center ${
          message.trim() && !disabled
            ? 'bg-appBlack'
            : 'bg-appLightGrey'
        }`}
        style={{
          shadowColor: message.trim() && !disabled ? '#000' : 'transparent',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Ionicons
          name="send"
          size={18}
          color={message.trim() && !disabled ? 'white' : '#7C7C7F'}
        />
      </TouchableOpacity>
    </View>
  );
}
