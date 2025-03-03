import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import { ROUTES } from "../constants/routes";
import { AuthStackParamList } from "./types";

// Import screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Create a placeholder component for screens we haven't built yet
const PlaceholderScreen = ({ route }: any) => (
  <View className="flex-1 justify-center items-center bg-background">
    <Text className="text-2xl font-bold text-primary">{route.name} Screen</Text>
    <Text className="text-base text-gray mt-2">
      This screen is not implemented yet
    </Text>
  </View>
);

// Create auth stack navigator
const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.LOGIN}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen
        name={ROUTES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
