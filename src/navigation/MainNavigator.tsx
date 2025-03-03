import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { MainStackParamList } from './types';
import RiderTabNavigator from './RiderTabNavigator';
import { useAuthStore } from '../store/authStore';
import RideRequestScreen from '../screens/ride/RideRequestScreen';
import RideConfirmationScreen from '../screens/ride/RideConfirmationScreen';
import LocationSearchScreen from '../screens/ride/LocationSearchScreen';

// Create placeholder screens for screens we haven't built yet
const PlaceholderScreen = ({ route }: any) => (
  <View className="flex-1 justify-center items-center bg-background">
    <Text className="text-2xl font-bold text-primary">{route.name} Screen</Text>
    <Text className="text-base text-gray mt-2">This screen is not implemented yet</Text>
  </View>
);

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  // Get user role from auth store
  const { user } = useAuthStore();

  // Determine if user is a driver
  const isDriver = user?.role === 'driver';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main tabs are different based on user role */}
      <Stack.Screen
        name={ROUTES.DASHBOARD}
        options={{ title: 'Dashboard' }}
      >
        {() => isDriver ? (
          // Driver tabs - we'll implement this later
          <PlaceholderScreen route={{ name: 'Driver App' }} />
        ) : (
          // Rider tabs
          <RiderTabNavigator />
        )}
      </Stack.Screen>

      {/* Location Search Screen */}
      <Stack.Screen
        name={ROUTES.LOCATION_SEARCH}
        component={LocationSearchScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />

      {/* Common screens */}
      <Stack.Screen name={ROUTES.RIDE_REQUEST} component={RideRequestScreen} />
      <Stack.Screen name={ROUTES.RIDE_CONFIRMATION} component={RideConfirmationScreen} />
      <Stack.Screen name={ROUTES.RIDE_IN_PROGRESS} component={PlaceholderScreen} />
      <Stack.Screen name={ROUTES.RIDE_COMPLETED} component={PlaceholderScreen} />
      <Stack.Screen name={ROUTES.PROFILE_EDIT} component={PlaceholderScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={PlaceholderScreen} />
      <Stack.Screen name={ROUTES.PAYMENT_METHODS} component={PlaceholderScreen} />
      <Stack.Screen name={ROUTES.HELP_CENTER} component={PlaceholderScreen} />

      {/* Driver-specific screens */}
      {isDriver && (
        <>
          <Stack.Screen name={ROUTES.DRIVER_TRIP_REQUEST} component={PlaceholderScreen} />
          <Stack.Screen name={ROUTES.DRIVER_TRIP_NAVIGATION} component={PlaceholderScreen} />
          <Stack.Screen name={ROUTES.DRIVER_TRIP_COMPLETED} component={PlaceholderScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator;