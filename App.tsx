import React, { useEffect, useState } from "react";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ROUTES } from "./src/constants/routes";
import { RootStackParamList } from "./src/navigation/types";
import { useAuthStore } from "./src/store/authStore";
import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";
import { Text, View } from "react-native";

// Create a React Query client
const queryClient = new QueryClient();

// Create Stack navigator for the root navigation
const Stack = createNativeStackNavigator<RootStackParamList>();

// Placeholder for OnboardingScreen (will implement later)
const OnboardingScreen = () => (
  <View className="flex-1 justify-center items-center bg-background">
    <Text className="text-2xl font-bold text-primary">Onboarding Screen</Text>
    <Text className="text-base text-gray mt-2">
      This screen is not implemented yet
    </Text>
  </View>
);

export default function App() {
  // Get auth state from store
  const { isLoggedIn, isInitialized, setInitialized } = useAuthStore();

  // State to track if onboarding has been completed
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  // Initialize app - would check for stored data, etc.
  useEffect(() => {
    // Here you would check if user has completed onboarding
    // For now, we'll assume they have

    // Mark app as initialized
    setInitialized(true);
  }, []);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-2xl font-bold text-white">Okada</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            {!isLoggedIn ? (
              // Auth flow
              <>
                {!hasCompletedOnboarding ? (
                  <Stack.Screen
                    name={ROUTES.ONBOARDING}
                    component={OnboardingScreen}
                  />
                ) : null}
                <Stack.Screen name={ROUTES.AUTH} component={AuthNavigator} />
              </>
            ) : (
              // Main app
              <Stack.Screen name={ROUTES.MAIN} component={MainNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
