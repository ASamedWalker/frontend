import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ROUTES } from "../constants/routes";
import { RiderTabParamList } from "./types";
import RiderHomeScreen from "../screens/home/RiderHomeScreen";
import { COLORS } from "../constants/theme";

// Create placeholder screens for tabs we haven't built yet
const PlaceholderScreen = ({ route }: any) => (
  <View className="flex-1 justify-center items-center bg-background">
    <Text className="text-2xl font-bold text-primary">{route.name} Screen</Text>
    <Text className="text-base text-gray mt-2">
      This screen is not implemented yet
    </Text>
  </View>
);

// Tab icons - we're using text emoji for now, you can replace with proper icons
const getTabIcon = (routeName: string, focused: boolean) => {
  let icon = "";
  let color = focused ? COLORS.PRIMARY : COLORS.GRAY;

  switch (routeName) {
    case ROUTES.RIDER_HOME:
      icon = "🏠";
      break;
    case ROUTES.RIDER_RIDES:
      icon = "🛵";
      break;
    case ROUTES.RIDER_PROFILE:
      icon = "👤";
      break;
    default:
      icon = "⚫";
  }

  return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
};

const Tab = createBottomTabNavigator<RiderTabParamList>();

const RiderTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => getTabIcon(route.name, focused),
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY,
        headerShown: false,
        tabBarStyle: {
          paddingVertical: 8,
          backgroundColor: COLORS.CARD,
          borderTopWidth: 1,
          borderTopColor: COLORS.BORDER,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: 4,
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.RIDER_HOME}
        component={RiderHomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name={ROUTES.RIDER_RIDES}
        component={PlaceholderScreen}
        options={{ tabBarLabel: "My Rides" }}
      />
      <Tab.Screen
        name={ROUTES.RIDER_PROFILE}
        component={PlaceholderScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default RiderTabNavigator;
