import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../../../components/BottomNavigation';
import useI18n from '../../../hooks/useI18n';
import { COLORS } from '../../../constants/colors';

export default function FriendsHub() {
  const { t } = useI18n();

  const MenuCard = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    bgColor,
    iconBgColor,
    iconColor = COLORS.appDarkGrey,
    showPaw = false
  }: {
    icon: string;
    title: string;
    description: string;
    onPress: () => void;
    bgColor: string;
    iconBgColor: string;
    iconColor?: string;
    showPaw?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-4"
    >
      <View 
        className="rounded-2xl overflow-hidden shadow-lg border border-appLightGrey" 
        style={{ 
          elevation: 3,
          backgroundColor: bgColor,
        }}
      >
        <View className="p-5">
          <View className="flex-row items-center">
            <View 
              style={{ backgroundColor: iconBgColor }}
              className="w-14 h-14 rounded-xl items-center justify-center mr-4 shadow-sm"
            >
              <Ionicons name={icon as any} size={26} color={iconColor} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-nunito-bold text-appDarkGrey mb-1 flex-1">
                  {title}
                </Text>
                {showPaw && (
                  <Text className="text-xl ml-2">🐾</Text>
                )}
              </View>
              <Text className="text-sm font-nunito-regular text-appMediumGrey leading-5">
                {description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.appMediumGrey} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-appBgWhite">
      <SafeAreaView className="flex-1 px-5 pt-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-appLightGrey items-center justify-center mr-4"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.appDarkGrey} />
          </TouchableOpacity>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Image
                source={require('../../../assets/images/calle-dog-icon.png')}
                className="w-10 h-10 mr-2"
              />
              <Text className="text-3xl font-nunito-bold text-appBlack">
                {t('friends.friends')}
              </Text>
            </View>
            <Text className="text-sm font-nunito-regular text-appMediumGrey mt-1">
              {t('friends.manageYourFriends')}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Friends List */}
          <MenuCard
            icon="people"
            title={t('friends.friendsList')}
            description={t('friends.friendsListDescription')}
            onPress={() => router.push('/(private)/friends/list')}
            bgColor={COLORS.appBgBeige}
            iconBgColor={COLORS.appYellow}
            iconColor={COLORS.appDarkGrey}
            showPaw={true}
          />

          {/* Search Users */}
          <MenuCard
            icon="search"
            title={t('friends.searchUsers')}
            description={t('friends.searchUsersDescription')}
            onPress={() => router.push('/(private)/friends/search')}
            bgColor={COLORS.appLightGrey}
            iconBgColor={COLORS.appDarkGrey}
            iconColor="white"
            showPaw={true}
          />

          {/* Received Requests */}
          <MenuCard
            icon="mail"
            title={t('friends.receivedRequests')}
            description={t('friends.receivedRequestsDescription')}
            onPress={() => router.push('/(private)/friends/requests-received')}
            bgColor={COLORS.appBgBeige}
            iconBgColor={COLORS.appRed}
            iconColor="white"
            showPaw={true}
          />

          {/* Sent Requests */}
          <MenuCard
            icon="send"
            title={t('friends.sentRequests')}
            description={t('friends.sentRequestsDescription')}
            onPress={() => router.push('/(private)/friends/requests-sent')}
            bgColor={COLORS.appLightGrey}
            iconBgColor={COLORS.appDarkGrey}
            iconColor="white"
            showPaw={true}
          />

          <View className="items-center mt-4 mb-6">
            <Text className="text-2xl">🐾</Text>
            <Text className="text-xs font-nunito-regular text-appMediumGrey mt-1">
              {t('friends.manageYourFriends')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      
      <BottomNavigation />
    </View>
  );
}

