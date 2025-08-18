import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useI18n from "../hooks/useI18n";

interface InterestTopicsSelectorProps {
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  error?: string;
}

const InterestTopicsSelector: React.FC<InterestTopicsSelectorProps> = ({
  selectedTopics,
  onTopicsChange,
  error,
}) => {
  const { t } = useI18n();

  const AVAILABLE_TOPICS = [
    "technology",
    "sports",
    "music",
    "art",
    "literature",
    "travel",
    "cooking",
    "photography",
    "games",
    "science",
    "history",
    "politics",
    "fashion",
    "health",
    "education",
    "business",
    "environment",
    "cinema",
    "theater",
    "dance",
  ];
  const toggleTopic = (topicKey: string) => {
    const translatedTopic = t(`register.topics.${topicKey}`);
    if (selectedTopics.includes(translatedTopic)) {
      onTopicsChange(selectedTopics.filter(t => t !== translatedTopic));
    } else if (selectedTopics.length < 3) {
      onTopicsChange([...selectedTopics, translatedTopic]);
    }
  };

  const isTopicSelected = (topicKey: string) => {
    const translatedTopic = t(`register.topics.${topicKey}`);
    return selectedTopics.includes(translatedTopic);
  };
  const canSelectMore = selectedTopics.length < 3;

  return (
    <View className="space-y-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">
        {t('register.interests.title')}
      </Text>
      
      <View className="mb-4">
        <Text className="text-sm text-gray-600">
          {t('register.interests.selected')}: {selectedTopics.length}/3
        </Text>
        {selectedTopics.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {selectedTopics.map((topic) => (
              <View
                key={topic}
                className="bg-blue-100 border border-blue-300 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
              >
                <Text className="text-blue-800 text-sm mr-2">{topic}</Text>
                <TouchableOpacity
                  onPress={() => {
                    // Find the topic key for removal
                    const topicKey = AVAILABLE_TOPICS.find(key => t(`register.topics.${key}`) === topic);
                    if (topicKey) toggleTopic(topicKey);
                  }}
                  className="w-5 h-5 rounded-full bg-blue-300 items-center justify-center"
                >
                  <Ionicons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <ScrollView className="max-h-64">
        <View className="flex-row flex-wrap">
          {AVAILABLE_TOPICS.map((topicKey) => {
            const selected = isTopicSelected(topicKey);
            const disabled = !selected && !canSelectMore;

            return (
              <TouchableOpacity
                key={topicKey}
                onPress={() => toggleTopic(topicKey)}
                disabled={disabled}
                className={`m-1 px-4 py-3 rounded-lg border-2 ${
                  selected
                    ? "border-blue-500 bg-blue-50"
                    : disabled
                    ? "border-gray-200 bg-gray-100"
                    : "border-gray-300 bg-white"
                }`}
              >
                <Text
                  className={`font-medium ${
                    selected
                      ? "text-blue-800"
                      : disabled
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {t(`register.topics.${topicKey}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {error && (
        <Text className="text-red-500 text-sm mt-2">{error}</Text>
      )}

      <Text className="text-sm text-gray-600 mt-4">
        {canSelectMore
          ? t('register.interests.canSelectMore')
          : t('register.interests.maxSelected')}
      </Text>
    </View>
  );
};

export default InterestTopicsSelector; 