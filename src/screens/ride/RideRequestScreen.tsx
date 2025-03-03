// src/screens/ride/RideRequestScreen.tsx
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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  Polyline,
  Region,
} from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RiderTabNavigationProp } from "../../navigation/types";
import { useLocationStore } from "../../store/locationStore";
import { ROUTES } from "../../constants/routes";
import { COLORS } from "../../constants/theme";
import { MapPin, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import RideOptions from "../../components/rides/RideOptions";

// Utils
import {
  decodePolyline,
  getFallbackRoute,
  calculateDistance,
  formatDistance,
  formatDuration,
} from "../../utils/mapUtils";
import {
  generateNearbyDrivers,
  updateDriverPositions,
  filterDriversByType,
} from "../../utils/driverUtils";

// Types
import { Driver } from "../ride/types/rides";

// Constants
const DEFAULT_LOCATION = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.0222,
  longitudeDelta: 0.0121,
};

const BOTTOM_SHEET_MIN_HEIGHT = 250;
const BOTTOM_SHEET_MAX_HEIGHT = 400;

// Ride options
const RIDE_OPTIONS = [
  {
    id: "okada",
    name: "Okada Rickshaw",
    image: require("../../assets/rickshaw.png"),
    basePrice: 15,
    pricePerKm: 1.2,
    baseEta: 3,
  },
  {
    id: "taxi",
    name: "Taxi",
    image: require("../../assets/taxi.png"),
    basePrice: 25,
    pricePerKm: 2.0,
    baseEta: 5,
  },
  {
    id: "premium",
    name: "Premium",
    image: require("../../assets/premium-car.png"),
    basePrice: 35,
    pricePerKm: 2.5,
    baseEta: 7,
  },
];

const RideRequestScreen = () => {
  // Refs
  const mapRef = useRef<MapView>(null);
  const bottomSheetAnim = useRef(
    new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)
  ).current;

  // Route and navigation
  const route = useRoute();
  const { pickupCoordinate, dropoffCoordinate } = route.params || {};
  const navigation = useNavigation<RiderTabNavigationProp>();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_LOCATION);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedRideOption, setSelectedRideOption] = useState(RIDE_OPTIONS[0]);
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [driversNearby, setDriversNearby] = useState(0);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);

  // Initialize map and route
  useEffect(() => {
    setIsLoadingRoute(true);
    if (!pickupCoordinate || !dropoffCoordinate) {
      Alert.alert("Error", "Missing pickup or dropoff location");
      navigation.goBack();
      return;
    }

    // Center map between pickup and destination
    const midLat = (pickupCoordinate.latitude + dropoffCoordinate.latitude) / 2;
    const midLng =
      (pickupCoordinate.longitude + dropoffCoordinate.longitude) / 2;

    // Calculate deltas to ensure both points are visible
    const latDelta =
      Math.abs(pickupCoordinate.latitude - dropoffCoordinate.latitude) * 1.5;
    const lngDelta =
      Math.abs(pickupCoordinate.longitude - dropoffCoordinate.longitude) * 1.5;

    setMapRegion({
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(0.02, latDelta),
      longitudeDelta: Math.max(0.02, lngDelta),
    });

    // Calculate route
    calculateRoute();

    // Initialize drivers
    initializeDrivers();

    setIsLoading(false);
  }, [pickupCoordinate, dropoffCoordinate]);

  // Initialize drivers and set up animation interval
  const initializeDrivers = () => {
    // Generate initial drivers
    const initialDrivers = generateNearbyDrivers(pickupCoordinate);
    setNearbyDrivers(initialDrivers);

    // Filter for initial display
    const okadaDrivers = filterDriversByType(initialDrivers, "okada");
    setFilteredDrivers(okadaDrivers);
    setDriversNearby(okadaDrivers.length);

    // Set up driver animation interval
    const driverInterval = setInterval(() => {
      // Update driver positions
      setNearbyDrivers((prevDrivers) => {
        if (prevDrivers.length === 0) return initialDrivers;

        const updatedDrivers = updateDriverPositions(prevDrivers);

        // Update filtered view after position update
        const type = selectedRideOption?.id as "okada" | "taxi" | "premium";
        const filtered = filterDriversByType(updatedDrivers, type);
        setFilteredDrivers(filtered);

        return updatedDrivers;
      });
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(driverInterval);
  };

  // Calculate route between pickup and destination
  const calculateRoute = async () => {
    setIsLoadingRoute(true);

    // Add a minimum timeout to ensure the loading state is visible
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!pickupCoordinate || !dropoffCoordinate) {
      setIsLoadingRoute(false);
      return;
    }

    try {
      const API_KEY = "AIzaSyC2JXoIWZ4DjIOj679klaltHU6swNa3ELo"; // Replace with your Google API key

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickupCoordinate.latitude},${pickupCoordinate.longitude}&destination=${dropoffCoordinate.latitude},${dropoffCoordinate.longitude}&mode=driving&key=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        // Process directions API response
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);

        // Get distance and duration
        const distanceInMeters = data.routes[0].legs[0].distance.value;
        const durationInSeconds = data.routes[0].legs[0].duration.value;

        const distanceInKm = distanceInMeters / 1000;
        const durationInMinutes = Math.ceil(durationInSeconds / 60);

        setDistance(distanceInKm);
        setDuration(durationInMinutes);

        // Update price estimates
        updatePriceAndETA(distanceInKm, selectedRideOption);

        // Fit map to route
        fitMapToRoute(points);
      } else {
        console.warn("Directions API error:", data.status);
        useFallbackRouteCalculation();
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      useFallbackRouteCalculation();
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Fallback route calculation
  const useFallbackRouteCalculation = () => {
    const route = getFallbackRoute(pickupCoordinate, dropoffCoordinate);
    setRouteCoordinates(route);

    const calculatedDistance = calculateDistance(
      pickupCoordinate.latitude,
      pickupCoordinate.longitude,
      dropoffCoordinate.latitude,
      dropoffCoordinate.longitude
    );

    const roundedDistance = Math.round(calculatedDistance * 10) / 10;
    setDistance(roundedDistance);

    const estimatedDuration = Math.max(5, Math.round(roundedDistance * 3));
    setDuration(estimatedDuration);

    updatePriceAndETA(roundedDistance, selectedRideOption);
    fitMapToRoute(route);
  };

  // Fit map to show the entire route
  const fitMapToRoute = (coordinates) => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
        animated: true,
      });
    }
  };

  // Update price and ETA based on distance and selected ride option
  const updatePriceAndETA = (distance, rideOption) => {
    // Base calculation
    const basePrice = rideOption.basePrice;
    const pricePerKm = rideOption.pricePerKm;
    const price = basePrice + distance * pricePerKm;

    // Time of day factors (peak pricing)
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const timeOfDayFactor = isPeakHour ? 1.2 : 1.0;
    const trafficFactor = isPeakHour ? 1.5 : 1.0;

    // Apply pricing factors
    const adjustedPrice = price * timeOfDayFactor;
    const minPrice = Math.floor(adjustedPrice * 0.95);
    const maxPrice = Math.ceil(adjustedPrice * 1.05);
    setEstimatedPrice(`₵${minPrice}-${maxPrice}`);

    // Calculate ETA
    const baseEta = rideOption.baseEta;
    const eta = baseEta + Math.round(distance * 2 * trafficFactor);
    const minEta = Math.max(1, eta - 2);
    const maxEta = eta + 2;
    setEstimatedArrival(`${minEta}-${maxEta} min`);

    // Update nearby driver count for selected type
    const type = rideOption.id as "okada" | "taxi" | "premium";
    const filteredByType = filterDriversByType(nearbyDrivers, type);
    setFilteredDrivers(filteredByType);
    setDriversNearby(filteredByType.length);
  };

  // Toggle bottom sheet expansion
  const toggleBottomSheet = () => {
    const toValue = isBottomSheetExpanded
      ? BOTTOM_SHEET_MIN_HEIGHT
      : BOTTOM_SHEET_MAX_HEIGHT;

    Animated.spring(bottomSheetAnim, {
      toValue,
      friction: 8,
      useNativeDriver: false,
    }).start();

    setIsBottomSheetExpanded(!isBottomSheetExpanded);
  };

  // Handle ride option selection
  const handleSelectRideOption = (option) => {
    setSelectedRideOption(option);
    updatePriceAndETA(distance, option);
  };

  // Request a ride
  // In RideRequestScreen.tsx

  // Request a ride
  const handleRequestRide = () => {
    const mockRideId = `RIDE-${Math.floor(Math.random() * 10000)}`;

    // Create the params object with all the data we need to pass
    const navigationParams = {
      rideId: mockRideId,
      pickupCoordinate: {
        latitude: pickupCoordinate.latitude,
        longitude: pickupCoordinate.longitude,
      },
      dropoffCoordinate: {
        latitude: dropoffCoordinate.latitude,
        longitude: dropoffCoordinate.longitude,
      },
      selectedRideType: selectedRideOption.id,
    };

    // Log what we're passing
    console.log("Navigating to confirmation with params:", navigationParams);

    // Navigate with our params
    navigation.navigate(
      ROUTES.RIDE_CONFIRMATION as never,
      navigationParams as never
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Map View */}
      <View className="flex-1 relative">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text className="mt-4 text-gray-600">Loading route...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={mapRegion}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={true}
            showsBuildings={false}
            showsTraffic={false}
            showsIndoors={false}
            mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            {/* Nearby Drivers */}
            {filteredDrivers.map((driver) => (
              <Marker
                key={driver.id}
                coordinate={driver.coordinate}
                anchor={{ x: 0.5, y: 0.5 }}
                rotation={driver.heading}
              >
                <Image
                  source={
                    driver.type === "okada"
                      ? require("../../assets/rickshaw.png")
                      : driver.type === "taxi"
                      ? require("../../assets/taxi.png")
                      : require("../../assets/premium-car-map.png")
                  }
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  resizeMode="contain"
                />
              </Marker>
            ))}

            {/* Pickup and Dropoff Markers */}
            <Marker coordinate={pickupCoordinate} title="Pickup">
              <View className="bg-green-500 p-2 rounded-full border-2 border-white">
                <MapPin size={20} color="white" />
              </View>
            </Marker>

            <Marker coordinate={dropoffCoordinate} title="Destination">
              <View className="bg-primary p-2 rounded-full border-2 border-white">
                <MapPin size={20} color="white" />
              </View>
            </Marker>

            {/* Route Line */}
            {!isLoadingRoute && routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor={COLORS.PRIMARY}
              />
            )}
          </MapView>
        )}

        {/* Back Button */}
        <TouchableOpacity
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>

        {/* Route Info Card */}
        {!isLoading && !isLoadingRoute && (
          <View className="absolute top-4 right-4 left-16 bg-white p-3 rounded-lg shadow-md">
            <Text className="font-bold text-base">
              {distance.toFixed(1)} km • {duration} min
            </Text>
            <Text className="text-gray-500 text-sm">
              {estimatedArrival} arrival
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      {!isLoading && (
        <Animated.View
          style={[styles.bottomSheet, { height: bottomSheetAnim }]}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-4 pb-6 shadow-lg"
        >
          {/* Handle for bottom sheet */}
          <TouchableOpacity
            className="items-center py-3"
            onPress={toggleBottomSheet}
          >
            <View className="w-12 h-1 bg-gray-300 rounded-full"></View>
            {isBottomSheetExpanded ? (
              <ChevronDown size={20} color="#777" className="mt-2" />
            ) : (
              <ChevronUp size={20} color="#777" className="mt-2" />
            )}
          </TouchableOpacity>

          {/* Ride Options Component */}
          <RideOptions
            isLoading={isLoadingRoute}
            rideOptions={RIDE_OPTIONS}
            selectedRideOption={selectedRideOption}
            estimatedArrival={estimatedArrival}
            estimatedPrice={estimatedPrice}
            driversNearby={driversNearby}
            onSelectOption={handleSelectRideOption}
          />

          {/* Request Ride Button */}
          {isLoadingRoute ? (
            <View className="py-3 mt-2">
              <SkeletonLoader width="100%" height={48} borderRadius={8} />
            </View>
          ) : (
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center mt-2"
              onPress={handleRequestRide}
            >
              <Text className="text-white font-bold text-lg">
                Request {selectedRideOption.name}
              </Text>
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
    // Height controlled by Animated.Value
  },
});

export default RideRequestScreen;
