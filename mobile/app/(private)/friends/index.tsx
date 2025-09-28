import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../../../components/BottomNavigation';
import useI18n from '../../../hooks/useI18n';
import { COLORS } from '../../../constants/colors';

export default function FriendsHub() {
  const { t } = useI18n();

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-6 pt-6">
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-full bg-appLightGrey items-center justify-center mr-4"
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.appDarkGrey} />
          </TouchableOpacity>
          <Text className="text-3xl font-nunito-bold text-appBlack">
            {t('friends.friends')}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Friends List */}
          <View className="bg-appBgBeige rounded-xl p-6 mb-6 border border-appLightGrey shadow-sm">
            <View className="flex-row items-center mb-4">
              <View 
                style={{ backgroundColor: COLORS.appYellow }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="people" size={24} color={COLORS.appDarkGrey} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {t('friends.friendsList')}
                </Text>
                <Text className="text-sm font-nunito-regular text-appMediumGrey">
                  {t('friends.friendsListDescription')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(private)/friends/list')}
              style={{ backgroundColor: COLORS.appYellow }}
              className="w-full py-4 px-6 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-base font-nunito-bold text-appDarkGrey mr-2">
                {t('friends.viewFriends')}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.appDarkGrey} />
            </TouchableOpacity>
          </View>

          {/* Search Users */}
          <View className="bg-appBgBeige rounded-xl p-6 mb-6 border border-appLightGrey shadow-sm">
            <View className="flex-row items-center mb-4">
              <View 
                style={{ backgroundColor: COLORS.appDarkGrey }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="search" size={24} color={COLORS.appBgBeige} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {t('friends.searchUsers')}
                </Text>
                <Text className="text-sm font-nunito-regular text-appMediumGrey">
                  {t('friends.searchUsersDescription')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(private)/friends/search')}
              style={{ backgroundColor: COLORS.appDarkGrey }}
              className="w-full py-4 px-6 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-base font-nunito-bold text-appBgBeige mr-2">
                {t('friends.searchUsers')}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.appBgBeige} />
            </TouchableOpacity>
          </View>

          {/* Received Requests */}
          <View className="bg-appBgBeige rounded-xl p-6 mb-6 border border-appLightGrey shadow-sm">
            <View className="flex-row items-center mb-4">
              <View 
                style={{ backgroundColor: COLORS.appMediumRed }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="mail" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {t('friends.receivedRequests')}
                </Text>
                <Text className="text-sm font-nunito-regular text-appMediumGrey">
                  {t('friends.receivedRequestsDescription')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(private)/friends/requests-received')}
              style={{ backgroundColor: COLORS.appMediumRed }}
              className="w-full py-4 px-6 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-base font-nunito-bold text-white mr-2">
                {t('friends.viewReceivedRequests')}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Sent Requests */}
          <View className="bg-appBgBeige rounded-xl p-6 mb-6 border border-appLightGrey shadow-sm">
            <View className="flex-row items-center mb-4">
              <View 
                style={{ backgroundColor: COLORS.testblue }}
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="send" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {t('friends.sentRequests')}
                </Text>
                <Text className="text-sm font-nunito-regular text-appMediumGrey">
                  {t('friends.sentRequestsDescription')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(private)/friends/requests-sent')}
              style={{ backgroundColor: COLORS.testblue }}
              className="w-full py-4 px-6 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-base font-nunito-bold text-white mr-2">
                {t('friends.viewSentRequests')}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Add some bottom padding for better scrolling */}
          <View className="h-4" />
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation />
    </View>
  );
}

