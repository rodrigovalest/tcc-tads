import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import useI18n from "../../../hooks/useI18n";
import useAuthStore from "../../../store/auth-store";
import { Link } from "expo-router";
import userService from "../../../services/user-service";
import { useQuery } from "@tanstack/react-query";
import { COLORS } from "../../../constants/colors";
import {
  getCountryData,
  getLanguageData,
} from "../../../utils/country-language-utils";
import Spinner from "../../../components/Spinner";
import { LinearGradient } from "expo-linear-gradient";

export default function Profile() {
  const { t } = useI18n();
  const authUser = useAuthStore((s) => s.user);

  const {
    data: fullUser,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", authUser?.sub],
    queryFn: () => userService.findById(authUser!.sub),
    enabled: !!authUser?.sub,
  });

  const getFluencyText = (level: number): string => {
    const levels: { [key: number]: string } = {
      1: t("profile.fluency.beginner"),
      2: t("profile.fluency.intermediate"),
      3: t("profile.fluency.advanced"),
      4: t("profile.fluency.fluent"),
      5: t("profile.fluency.native"),
    };
    return levels[level] || t("profile.fluency.unknown");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="w-full h-full bg-appBgWhite flex items-center justify-center">
        <Spinner />
        <Text className="mt-4 text-appDarkGrey font-nunito-medium">
          {t("profile.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="w-full h-full bg-appBgWhite flex items-center justify-center px-6">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={COLORS.appRed}
        />
        <Text className="text-appDarkGrey font-nunito-medium text-center mt-4 mb-6">
          {t("profile.errorLoading")}
        </Text>
        <TouchableOpacity
          className="bg-appDarkGrey px-6 py-3 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-nunito-medium">
            {t("common.tryAgain")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const countryData = fullUser?.nationality
    ? getCountryData(fullUser.nationality)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        <LinearGradient
          colors={[COLORS.appBgBeige, COLORS.appBgWhite]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-6 pb-8 px-5"
        >
          <View className="items-center">
            <View className="relative mb-5">
              {fullUser?.photoUri ? (
                <Image
                  source={{ uri: fullUser.photoUri }}
                  className="w-36 h-36 rounded-full border-4 border-white shadow-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-36 h-36 rounded-full bg-appLightGrey items-center justify-center border-4 border-white shadow-xl">
                  <MaterialCommunityIcons
                    name="account"
                    size={70}
                    color={COLORS.appMediumGrey}
                  />
                </View>
              )}

              <View
                className={`absolute bottom-1 right-1 w-7 h-7 rounded-full border-3 border-white shadow-lg ${
                  fullUser?.isActive ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </View>

            <View className="items-center w-full">
              <Text className="text-2xl font-nunito-bold text-appDarkGrey">
                {fullUser?.name}
              </Text>
              <Text className="text-appMediumGrey font-nunito-semibold mt-1">
                @{fullUser?.username || authUser?.username}
              </Text>
              <Text className="text-appMediumGrey font-nunito-medium mt-1 text-sm">
                {fullUser?.email || authUser?.email}
              </Text>

              {countryData && (
                <View className="flex-row items-center mt-4 bg-white px-5 py-2.5 rounded-full shadow-sm border border-appLightGrey">
                  <Text className="text-2xl mr-2">{countryData.flag}</Text>
                  <Text className="text-appDarkGrey font-nunito-medium">
                    {countryData.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        <View className="px-5">

        {fullUser?.personalDescription && (
          <View className="mb-6 bg-white rounded-2xl p-5 border border-appLightGrey shadow-sm">
            <View className="flex-row items-center mb-3">
              <Text className="text-lg font-nunito-bold text-appDarkGrey flex-1">
              {t("profile.aboutMe")}
              </Text>
              <Text className="text-lg">🐾</Text>
            </View>
            <Text className="text-appDarkGrey font-nunito-regular leading-6">
              {fullUser.personalDescription}
            </Text>
          </View>
        )}

        {fullUser?.languages && fullUser.languages.length > 0 && (
          <View className="mb-6 bg-white rounded-2xl p-5 border border-appLightGrey shadow-sm">
            <View className="flex-row items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey flex-1">
                {t("profile.languages")}
              </Text>
              <Text className="text-lg">🐾</Text>
            </View>
            <View>
              {fullUser.languages.map((language, index) => {
                const languageData = getLanguageData(language.languageCode);
                const isLast = index === fullUser.languages.length - 1;
                return (
                  <View
                    key={language.id}
                    className={`flex-row items-center justify-between p-3 bg-appLightGrey rounded-lg ${
                      !isLast ? "mb-3" : ""
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-3">
                        {languageData?.flag || "🌐"}
                      </Text>
                      <View>
                        <Text className="text-appDarkGrey font-nunito-medium">
                          {languageData?.name || language.languageCode}
                        </Text>
                        <Text className="text-appMediumGrey font-nunito-regular text-sm">
                          {getFluencyText(language.fluencyLevel)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row">
                      {[...Array(5)].map((_, index) => (
                        <Ionicons
                          key={index}
                          name={
                            index < language.fluencyLevel
                              ? "star"
                              : "star-outline"
                          }
                          size={16}
                          color={
                            index < language.fluencyLevel
                              ? COLORS.appYellow
                              : COLORS.appMediumGrey
                          }
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {fullUser?.interestTopics && fullUser.interestTopics.length > 0 && (
          <View className="mb-6 bg-white rounded-2xl p-5 border border-appLightGrey shadow-sm">
            <View className="flex-row items-center mb-4">
              <Text className="text-lg font-nunito-bold text-appDarkGrey flex-1">
                {t("profile.interests")}
              </Text>
              <Text className="text-lg">🐾</Text>
            </View>
            <View className="flex-row flex-wrap">
              {fullUser.interestTopics.map((topic) => (
                <View
                  key={topic.id}
                  className="bg-appDarkGrey px-4 py-2 rounded-full mr-2 mb-2"
                >
                  <Text className="text-white font-nunito-medium text-sm">
                    {topic.topic}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

          <Link href="../../../profile-edit" asChild>
            <TouchableOpacity className="bg-appDarkGrey rounded-xl py-4 items-center flex-row justify-center shadow-md mb-4">
              <Ionicons
                name="create-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-nunito-semibold">
                {t("profile.editProfile")}
              </Text>
              <Text className="text-white text-lg ml-2">🐾</Text>
            </TouchableOpacity>
          </Link>

          <View className="items-center mt-4 mb-2">
            <Text className="text-2xl">🐾</Text>
            <Text className="text-xs font-nunito-regular text-appMediumGrey mt-1">
              Calle - Aprenda idiomas de forma divertida
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
