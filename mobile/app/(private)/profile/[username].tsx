import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import userService from "../../../services/user-service";
import { COLORS } from "../../../constants/colors";
import useI18n from "../../../hooks/useI18n";
import { getCountryData, getLanguageData } from "../../../utils/country-language-utils";
import Spinner from "../../../components/Spinner";

export default function SeeUserProfile() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { t } = useI18n();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      try {
        const users = await userService.findAll();
        return users.find(u => u.username === username);
      } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
      }
    },
    enabled: !!username,
  });

  const onBack = async () => {
    router.canGoBack() ? router.back() : router.replace("/(private)/(tabs)/history");
  };

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
      <SafeAreaView className="flex-1 bg-appBgWhite">
        <View className="flex-1 items-center justify-center">
          <Spinner />
          <Text className="mt-4 text-appDarkGrey font-nunito-medium">
            {t("profile.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView className="flex-1 bg-appBgWhite">
        <TouchableOpacity
          className="w-full py-3 px-4"
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.appDarkGrey} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.appMediumGrey} />
          <Text className="text-xl font-nunito-bold text-appBlack mt-4 text-center">
            {t("profile.error")}
          </Text>
          <Text className="text-base font-nunito-regular text-appMediumGrey mt-2 text-center">
            {t("profile.errorLoading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const countryData = getCountryData(user.nationality);

  return (
    <SafeAreaView className="flex-1 bg-appBgWhite">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-16 pb-8"
        >
          <TouchableOpacity
            className="px-4 mb-6"
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>

          <View className="items-center px-6">
            <View className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4">
              {user.photoUri ? (
                <Image
                  source={{ uri: user.photoUri }}
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full rounded-full bg-appMediumGrey items-center justify-center">
                  <Ionicons name="person" size={64} color="white" />
                </View>
              )}
            </View>

            <Text className="text-2xl font-nunito-bold text-white mb-1">
              {user.name}
            </Text>
            <Text className="text-base font-nunito-medium text-white/80 mb-4">
              @{user.username}
            </Text>

            {countryData && (
              <View className="flex-row items-center bg-white/20 rounded-full px-4 py-2 mb-4">
                <Ionicons name="location" size={18} color="white" />
                <Text className="text-sm font-nunito-medium text-white ml-2">
                  {countryData.name}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View className="px-5 -mt-4">
          {user.personalDescription && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-appLightGrey">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-appYellow items-center justify-center mr-3">
                  <Ionicons name="person-circle-outline" size={24} color={COLORS.appDarkGrey} />
                </View>
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {t("profile.aboutMe")}
                </Text>
              </View>
              <Text className="text-appDarkGrey font-nunito-regular leading-6">
                {user.personalDescription}
              </Text>
            </View>
          )}
          {user.languages && user.languages.length > 0 && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-appLightGrey">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-appYellow items-center justify-center mr-3">
                  <Ionicons name="language" size={24} color={COLORS.appDarkGrey} />
                </View>
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {t("profile.languages")}
                </Text>
              </View>
              <View>
                {user.languages.map((language, index) => {
                  const languageData = getLanguageData(language.languageCode);
                  const isLast = index === user.languages.length - 1;
                  return (
                    <View
                      key={language.id}
                      className={`flex-row items-center justify-between py-3 ${!isLast ? 'border-b border-appLightGrey' : ''}`}
                    >
                      <View className="flex-1">
                        <Text className="text-base font-nunito-bold text-appBlack">
                          {languageData?.name || language.languageCode}
                        </Text>
                        <Text className="text-sm font-nunito-regular text-appMediumGrey mt-1">
                          {getFluencyText(language.fluencyLevel)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <View
                            key={i}
                            className={`w-3 h-3 rounded-full mx-0.5 ${
                              i < language.fluencyLevel
                                ? 'bg-appYellow'
                                : 'bg-appLightGrey'
                            }`}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          {user.interestTopics && user.interestTopics.length > 0 && (
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-appLightGrey">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-appYellow items-center justify-center mr-3">
                  <Ionicons name="heart" size={24} color={COLORS.appDarkGrey} />
                </View>
                <Text className="text-lg font-nunito-bold text-appBlack">
                  {t("profile.interests")}
                </Text>
              </View>
              <View className="flex-row flex-wrap">
                {user.interestTopics.map((topic) => (
                  <View
                    key={topic.id}
                    className="bg-appLightGrey rounded-full px-4 py-2 mr-2 mb-2"
                  >
                    <Text className="text-sm font-nunito-medium text-appDarkGrey">
                      {topic.topic}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-appLightGrey">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-appYellow items-center justify-center mr-3">
                <Ionicons name="information-circle-outline" size={24} color={COLORS.appDarkGrey} />
              </View>
              <Text className="text-lg font-nunito-bold text-appBlack">
                {t("profile.accountInfo")}
              </Text>
            </View>
            <View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-sm font-nunito-medium text-appMediumGrey">
                  {t("profile.memberSince")}
                </Text>
                <Text className="text-sm font-nunito-bold text-appBlack">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-t border-appLightGrey mt-2">
                <Text className="text-sm font-nunito-medium text-appMediumGrey">
                  {t("profile.accountStatus")}
                </Text>
                <View className="flex-row items-center">
                  <View 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: user.isActive ? '#10B981' : '#EF4444' }}
                  />
                  <Text className="text-sm font-nunito-bold text-appBlack">
                    {user.isActive ? t("profile.active") : t("profile.inactive")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
