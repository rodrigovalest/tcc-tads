import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import useI18n from '../hooks/useI18n';

export default function BottomNavigation() {
  const { t } = useI18n();
  const pathname = usePathname();

  const tabs = [
    {
      key: 'profile',
      title: t('navigation.profile'),
      icon: 'account-circle-outline',
      iconType: 'MaterialCommunityIcons',
      route: '/(private)/(tabs)/profile'
    },
    {
      key: 'chat',
      title: t('navigation.chat'),
      icon: 'chat',
      iconType: 'MaterialIcons',
      route: '/(private)/(tabs)/chat'
    },
    {
      key: 'matches',
      title: t('navigation.matches'),
      icon: 'cards-playing-outline',
      iconType: 'MaterialCommunityIcons',
      route: '/(private)/(tabs)/matches'
    },
    {
      key: 'history',
      title: t('navigation.history'),
      icon: 'clock',
      iconType: 'MaterialCommunityIcons',
      route: '/(private)/(tabs)/history'
    },
    {
      key: 'settings',
      title: t('navigation.settings'),
      icon: 'settings-outline',
      iconType: 'Ionicons',
      route: '/(private)/(tabs)/settings'
    }
  ];

  const isActiveRoute = (route: string) => {
    return pathname.includes(route.split('/').pop() || '');
  };

  const renderIcon = (iconType: string, iconName: string, color: string, size: number) => {
    switch (iconType) {
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName as any} color={color} size={size} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} color={color} size={size} />;
      case 'Ionicons':
        return <Ionicons name={iconName as any} color={color} size={size} />;
      default:
        return <Ionicons name={iconName as any} color={color} size={size} />;
    }
  };

  return (
    <View 
      style={{
        backgroundColor: COLORS.appDarkGrey,
        height: 135,
        paddingTop: 15,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start'
      }}
    >
      {tabs.map((tab) => {
        const isActive = isActiveRoute(tab.route);
        const color = isActive ? COLORS.appBgBeige : COLORS.appMediumGrey;
        
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => router.push(tab.route as any)}
            style={{
              alignItems: 'center',
              flex: 1,
              paddingVertical: 8
            }}
          >
            {renderIcon(tab.iconType, tab.icon, color, 24)}
            <Text 
              style={{
                fontFamily: 'nunito-bold',
                fontSize: 12,
                color: color,
                marginTop: 4,
                textAlign: 'center'
              }}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}