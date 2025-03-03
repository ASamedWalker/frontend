// src/navigation/types.ts
import { ROUTES } from '../constants/routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// Define Coordinate type for consistency
export type Coordinate = {
  latitude: number;
  longitude: number;
};

// Auth Stack Parameter List
export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
};

// Rider Tab Parameter List
export type RiderTabParamList = {
  [ROUTES.RIDER_HOME]: undefined;
  [ROUTES.RIDER_RIDES]: undefined;
  [ROUTES.RIDER_PROFILE]: undefined;
};

// Driver Tab Parameter List
export type DriverTabParamList = {
  [ROUTES.DRIVER_HOME]: undefined;
  [ROUTES.DRIVER_EARNINGS]: undefined;
  [ROUTES.DRIVER_PROFILE]: undefined;
};

// Main Stack Parameter List
export type MainStackParamList = {
  [ROUTES.MAIN]: undefined;
  [ROUTES.LOCATION_SEARCH]: {
    pickupCoordinate?: Coordinate;
    destinationName?: string;
    destinationAddress?: string;
  };
  [ROUTES.RIDE_REQUEST]: {
    pickupCoordinate: Coordinate;
    dropoffCoordinate: Coordinate;
  };
  [ROUTES.RIDE_CONFIRMATION]: {
    rideId: string;
    pickupCoordinate: Coordinate;
    dropoffCoordinate: Coordinate;
    selectedRideType?: string;
  };
  [ROUTES.RIDE_IN_PROGRESS]: {
    rideId: string;
  };
  [ROUTES.RIDE_COMPLETED]: {
    rideId: string;
  };
  [ROUTES.DRIVER_TRIP_REQUEST]: {
    tripId: string;
    pickup: { latitude: number; longitude: number; address: string };
    dropoff: { latitude: number; longitude: number; address: string };
    rider: { name: string; rating: number };
    estimatedFare: number;
  };
  [ROUTES.DRIVER_TRIP_NAVIGATION]: {
    tripId: string;
  };
  [ROUTES.DRIVER_TRIP_COMPLETED]: {
    tripId: string;
  };
  [ROUTES.PROFILE_EDIT]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.PAYMENT_METHODS]: undefined;
  [ROUTES.HELP_CENTER]: undefined;

  // Dashboard
  [ROUTES.DASHBOARD]: undefined;
};

// Root Stack Parameter List
export type RootStackParamList = {
  [ROUTES.AUTH]: undefined;
  [ROUTES.ONBOARDING]: undefined;
  [ROUTES.MAIN]: undefined;
};

// Navigation Props
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export type RiderTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RiderTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

export type DriverTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<DriverTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;