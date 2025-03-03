import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { RiderTabNavigationProp } from "../../navigation/types";
import { useLocationStore } from "../../store/locationStore";
import { ROUTES } from "../../constants/routes";
import { COLORS } from "../../constants/theme";
import { MapPin, Search, Locate, Clock, Star } from 'lucide-react-native';
import { Image } from 'react-native';

// Default location (center of Accra, Ghana)
const DEFAULT_LOCATION = {
  latitude: 5.6037,
  longitude: -0.1870,
  latitudeDelta: 0.0222,
  longitudeDelta: 0.0121,
};

const INITIAL_BOTTOM_SHEET_HEIGHT = 180; // Accounting for bottom tabs

const RiderHomeScreen = () => {
  // Refs
  const mapRef = useRef(null);
  const bottomSheetAnim = useRef(new Animated.Value(INITIAL_BOTTOM_SHEET_HEIGHT)).current;

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(DEFAULT_LOCATION);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState([
    { id: 1, name: 'Home', address: '123 Accra St' },
    { id: 2, name: 'Work', address: 'Business District' }
  ]);
  const [recentPlaces, setRecentPlaces] = useState([
    { id: 1, name: 'Makola Market', address: 'Central Accra' },
    { id: 2, name: 'Accra Mall', address: 'Spintex Road' }
  ]);

  // Navigation
  const navigation = useNavigation();

  // Location store
  const {
    currentLocation,
    setCurrentLocation,
    setLocationPermission,
    setErrorMsg,
  } = useLocationStore();

  // Request location permission and get current location
  useEffect(() => {
    const getLocationPermission = async () => {
      setIsLoading(true);

      try {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);

        if (status !== "granted") {
          setErrorMsg("Location access is required to use this app");
          // Force Ghana location if permission not granted
          setMapRegion(DEFAULT_LOCATION);
          setSelectedLocation({
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
          });
          setIsLoading(false);
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error("Invalid coordinates received");
        }

        // For demonstration, force Accra location - REMOVE THIS FOR PRODUCTION
        // When testing outside Ghana
        const useAccraLocation = true; // Set to false to use actual device location
        const finalLatitude = useAccraLocation ? DEFAULT_LOCATION.latitude : latitude;
        const finalLongitude = useAccraLocation ? DEFAULT_LOCATION.longitude : longitude;

        // Save to store
        setCurrentLocation({
          latitude: finalLatitude,
          longitude: finalLongitude,
          accuracy: location.coords.accuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
          timestamp: location.timestamp,
        });

        // Update map region with smaller delta for closer zoom
        setMapRegion({
          latitude: finalLatitude,
          longitude: finalLongitude,
          latitudeDelta: 0.01, // Smaller delta for closer zoom
          longitudeDelta: 0.01,
        });

        // Set as selected location
        setSelectedLocation({
          latitude: finalLatitude,
          longitude: finalLongitude
        });
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Failed to get current location");
        setMapRegion(DEFAULT_LOCATION);
        setSelectedLocation({
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
        });
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    getLocationPermission();
  }, []);

  // Handle map ready event
  const onMapReady = () => {
    console.log("Map is ready with default provider");
    setIsMapReady(true);

    // If we already have the current location, center the map
    if (currentLocation) {
      centerOnUserLocation();
    }
  };

  // Center map on current location
  const centerOnUserLocation = () => {
    if (!currentLocation) {
      Alert.alert(
        "Location not available",
        "Unable to get your current location"
      );
      return;
    }

    if (mapRef.current && isMapReady) {
      // Ensure we're zoomed in closer to Ghana
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500
      );

      setSelectedLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    }
  };

  // Handle map region change
  const onRegionChangeComplete = (region) => {
    if (!isNaN(region.latitude) && !isNaN(region.longitude)) {
      setMapRegion(region);
    }
  };

  // Handle map press
  const onMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    if (
      coordinate &&
      !isNaN(coordinate.latitude) &&
      !isNaN(coordinate.longitude)
    ) {
      setSelectedLocation(coordinate);
    }
  };

  // Navigate to location search screen
  const navigateToLocationSearch = () => {
    if (!selectedLocation) {
      Alert.alert("Location unavailable", "Unable to determine your location");
      return;
    }

    navigation.navigate(ROUTES.LOCATION_SEARCH, {
      pickupCoordinate: selectedLocation,
    });
  };

  // Navigate to saved place
  const handleSavedPlaceSelect = (place) => {
    // In a real app, you would use geocoding to get coordinates
    // For now, just navigate to the location search with the place name
    navigation.navigate(ROUTES.LOCATION_SEARCH, {
      pickupCoordinate: selectedLocation,
      destinationName: place.name,
      destinationAddress: place.address
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Map View */}
      <View className="flex-1 relative">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text className="mt-4 text-gray-600">Getting your location...</Text>
          </View>
        ) : !showMap || mapError ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-red-500 text-center mb-4">
              {mapError || "Failed to load map"}
            </Text>
            <TouchableOpacity
              className="bg-primary py-2 px-4 rounded"
              onPress={() => {
                setMapError(null);
                setShowMap(true);
              }}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialCamera={{
              center: {
                latitude: DEFAULT_LOCATION.latitude,
                longitude: DEFAULT_LOCATION.longitude,
              },
              pitch: 0,
              heading: 0,
              zoom: 15,
            }}
            initialRegion={mapRegion}
            onMapReady={onMapReady}
            onRegionChangeComplete={onRegionChangeComplete}
            onPress={onMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={true}
            showsBuildings={false}
            showsTraffic={false}
            showsIndoors={false}
          >
            {isMapReady && selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                pinColor={COLORS.PRIMARY}
                title="Pickup location"
              />
            )}
          </MapView>
        )}

        {/* Center on location button */}
        {!isLoading && showMap && !mapError && (
          <TouchableOpacity
            className="absolute bottom-32 right-4 bg-white p-3 rounded-full shadow-md"
            onPress={centerOnUserLocation}
          >
            <View className="w-6 h-6 items-center justify-center">
              <Locate size={24} color={COLORS.PRIMARY} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Sheet */}
      {!isLoading && !mapError && (
        <Animated.View
          style={[styles.bottomSheet, { height: bottomSheetAnim }]}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-4 pb-6 shadow-lg"
        >
          {/* Handle for bottom sheet */}
          <View className="items-center py-2">
            <View className="w-12 h-1 bg-gray-300 rounded-full"></View>
          </View>

          {/* Destination input */}
          <TouchableOpacity
            className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-3"
            onPress={navigateToLocationSearch}
          >
            <Search size={20} color="#777" className="mr-2" />
            <Text className="text-gray-500">Where to?</Text>
          </TouchableOpacity>

          {/* Quick shortcuts */}
          <View className="flex-row justify-around mb-4">
            {savedPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                className="items-center"
                onPress={() => handleSavedPlaceSelect(place)}
              >
                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-1">
                  {place.name === 'Home' ? (
                    <MapPin size={22} color={COLORS.PRIMARY} />
                  ) : (
                    <Star size={22} color={COLORS.PRIMARY} />
                  )}
                </View>
                <Text className="text-xs text-center">{place.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="items-center"
              onPress={navigateToLocationSearch}
            >
              <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-1">
                <Clock size={22} color={COLORS.PRIMARY} />
              </View>
              <Text className="text-xs text-center">Recent</Text>
            </TouchableOpacity>
          </View>

          {/* Recent place - Show only the most recent one */}
          {recentPlaces.length > 0 && (
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={() => handleSavedPlaceSelect(recentPlaces[0])}
            >
              <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Clock size={16} color="#777" />
              </View>
              <View>
                <Text className="font-medium text-sm">{recentPlaces[0].name}</Text>
                <Text className="text-xs text-gray-500">{recentPlaces[0].address}</Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  bottomSheet: {
    // Height will be controlled by Animated.Value
    // Other styles are handled by NativeWind classNames
  }
});

export default RiderHomeScreen;