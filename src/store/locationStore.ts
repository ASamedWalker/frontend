import { create } from 'zustand';
import * as Location from 'expo-location';

// Define location coordinate type
interface Coordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

// Define address type
interface Address {
  name?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  formattedAddress?: string;
}

// Define favorite location type
interface FavoriteLocation {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
  icon: string;
}

// Define location state
interface LocationState {
  currentLocation: Coordinate | null;
  errorMsg: string | null;
  locationPermission: Location.PermissionStatus | null;
  backgroundPermission: Location.PermissionStatus | null;
  isLocationServiceEnabled: boolean;
  pickupLocation: { coordinate: Coordinate; address: Address } | null;
  dropoffLocation: { coordinate: Coordinate; address: Address } | null;
  favoriteLocations: FavoriteLocation[];
  recentLocations: { coordinate: Coordinate; address: Address }[];

  // Actions
  setCurrentLocation: (location: Coordinate | null) => void;
  setErrorMsg: (msg: string | null) => void;
  setLocationPermission: (status: Location.PermissionStatus | null) => void;
  setBackgroundPermission: (status: Location.PermissionStatus | null) => void;
  setLocationServiceEnabled: (enabled: boolean) => void;
  setPickupLocation: (location: { coordinate: Coordinate; address: Address } | null) => void;
  setDropoffLocation: (location: { coordinate: Coordinate; address: Address } | null) => void;
  addFavoriteLocation: (location: FavoriteLocation) => void;
  removeFavoriteLocation: (id: string) => void;
  addRecentLocation: (location: { coordinate: Coordinate; address: Address }) => void;
}

// Create location store
export const useLocationStore = create<LocationState>()((set, get) => ({
  currentLocation: null,
  errorMsg: null,
  locationPermission: null,
  backgroundPermission: null,
  isLocationServiceEnabled: false,
  pickupLocation: null,
  dropoffLocation: null,
  favoriteLocations: [],
  recentLocations: [],

  // Action implementations
  setCurrentLocation: (location) => set({ currentLocation: location }),

  setErrorMsg: (msg) => set({ errorMsg: msg }),

  setLocationPermission: (status) => set({ locationPermission: status }),

  setBackgroundPermission: (status) => set({ backgroundPermission: status }),

  setLocationServiceEnabled: (enabled) => set({ isLocationServiceEnabled: enabled }),

  setPickupLocation: (location) => set({ pickupLocation: location }),

  setDropoffLocation: (location) => set({ dropoffLocation: location }),

  addFavoriteLocation: (location) => {
    const favorites = get().favoriteLocations;
    set({ favoriteLocations: [...favorites, location] });
  },

  removeFavoriteLocation: (id) => {
    const favorites = get().favoriteLocations;
    set({ favoriteLocations: favorites.filter(loc => loc.id !== id) });
  },

  addRecentLocation: (location) => {
    const recents = get().recentLocations;
    // Keep only the last 5 recent locations
    const updatedRecents = [location, ...recents].slice(0, 5);
    set({ recentLocations: updatedRecents });
  },
}));