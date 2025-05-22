import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.appDarkGrey,
          height: 135,
          paddingTop: 15,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30
        },
        tabBarLabelStyle: {
          fontFamily: "nunito-bold",
          fontSize: 12,
        },
        tabBarActiveTintColor: COLORS.appBgBeige,
        tabBarInactiveTintColor: COLORS.appMediumGrey,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="matches"
        options={{
          title: "Match",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cards-playing-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clock" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
