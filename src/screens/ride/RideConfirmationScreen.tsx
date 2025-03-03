// src/screens/ride/RideConfirmationScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RiderTabNavigationProp } from "../../navigation/types";
import { ROUTES } from "../../constants/routes";
import { COLORS } from "../../constants/theme";
import {
  Phone,
  MessageCircle,
  X,
  Shield,
  Star,
  MapPin,
  AlertTriangle,
  Share2,
} from "lucide-react-native";
import SkeletonLoader from "../../components/common/SkeletonLoader";

// Components
import DriverInfoCard from "../../components/rides/DriverInfoCard";
import FindingDriverCard from "../../components/rides/FindingDriverCard";
import RideCancelledCard from "../../components/rides/RideCancelledCard";

// Types
import { RideStatus, Driver, Vehicle } from "../../screens/ride/types/rides";

// Utils
import {
  createMockRouteCoordinates,
  generateMockDriver,
  formatTime,
  decodePolyline,
} from "../../utils/rideUtils";

// Constants
const DEFAULT_LOCATION = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.0222,
  longitudeDelta: 0.0121,
};

const MAP_PADDING = { top: 200, right: 50, bottom: 250, left: 50 };
const DRIVER_ANIMATION_DURATION = 12000;
const DRIVER_ROUTE_PROGRESS_MAX = 0.3; // Only animate up to 30% of the route

/**
 * RideConfirmationScreen handles the post-ride-request experience,
 * showing driver assignment, arrival animation, and ride status.
 */
const RideConfirmationScreen = () => {
  // Refs
  const mapRef = useRef<MapView>(null);
  const driverAnimationValue = useRef(new Animated.Value(0)).current;

  // Route and navigation
  const route = useRoute();
  const params = route.params || {};
  const { rideId } = params;
  const navigation = useNavigation<RiderTabNavigationProp>();

  // State
  const [rideStatus, setRideStatus] = useState<RideStatus>(
    RideStatus.FINDING_DRIVER
  );
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingRide, setCancellingRide] = useState(false);

  // Location state
  const [mapRegion, setMapRegion] = useState(DEFAULT_LOCATION);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [pickupLocation, setPickupLocation] = useState({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
  });
  const [destinationLocation, setDestinationLocation] = useState({
    latitude: DEFAULT_LOCATION.latitude + 0.012,
    longitude: DEFAULT_LOCATION.longitude + 0.009,
  });

  // Driver state
  const [driverInfo, setDriverInfo] = useState<Driver | null>(null);
  const [driverPosition, setDriverPosition] = useState({
    latitude: DEFAULT_LOCATION.latitude - 0.008,
    longitude: DEFAULT_LOCATION.longitude - 0.005,
    heading: 45,
  });
  const [estimatedArrival, setEstimatedArrival] = useState("");

  // Setup initial data and state
  useEffect(() => {
    initializeRide();
    return () => {
      // Clean up animations when component unmounts
      driverAnimationValue.stopAnimation();
    };
  }, []);

  // Add this useEffect to properly handle coordinate initialization
  useEffect(() => {
    // Log what we received in params
    console.log("RideConfirmationScreen route params:", params);

    // Check if we have coordinates in params
    if (params.pickupCoordinate && params.dropoffCoordinate) {
      console.log("Using coordinates from params");
      setPickupLocation({ ...params.pickupCoordinate });
      setDestinationLocation({ ...params.dropoffCoordinate });

      // Update map region
      const midLat =
        (params.pickupCoordinate.latitude + params.dropoffCoordinate.latitude) /
        2;
      const midLng =
        (params.pickupCoordinate.longitude +
          params.dropoffCoordinate.longitude) /
        2;

      // Calculate appropriate deltas
      const latDelta =
        Math.abs(
          params.pickupCoordinate.latitude - params.dropoffCoordinate.latitude
        ) * 1.5;
      const lngDelta =
        Math.abs(
          params.pickupCoordinate.longitude - params.dropoffCoordinate.longitude
        ) * 1.5;

      setMapRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(0.02, latDelta),
        longitudeDelta: Math.max(0.02, lngDelta),
      });
    } else {
      console.warn("No coordinates in params, using defaults");
    }
  }, [params]);

  // Update the useEffect to reconnect the animation
  useEffect(() => {
    if (routeCoordinates.length >= 2) {
      const listener = driverAnimationValue.addListener(({ value }) => {
        // Only update driver position when we're actually animating
        if (rideStatus === RideStatus.DRIVER_ARRIVING) {
          updateDriverPosition(value);
        }
      });

      return () => {
        driverAnimationValue.removeListener(listener);
      };
    }
  }, [routeCoordinates, driverAnimationValue, rideStatus]);

  // Then modify initializeRide to not set coordinates (they're now set in useEffect)
  const initializeRide = () => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);

      // Setup the route using Google Directions API
      // This will use the coordinates set in the useEffect
      setupRoute();

      // Start the driver finding animation
      simulateFindingDriver();
    }, 1500);
  };

  // Fix the heading calculation in initializeDriverPosition
  const initializeDriverPosition = () => {
    const pickup = params.pickupCoordinate;
    const dropoff = params.dropoffCoordinate;

    if (!pickup || !dropoff) return;

    // Calculate vector from pickup to dropoff
    const dx = dropoff.latitude - pickup.latitude;
    const dy = dropoff.longitude - pickup.longitude;

    // Normalize the vector
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    // Place driver in a realistic position - 500m away from pickup in a sensible direction
    const driverDistance = 0.005; // roughly 500m in lat/lng

    // Calculate heading to point TOWARD the pickup
    const heading = Math.atan2(normalizedDy, normalizedDx) * (180 / Math.PI);

    // Position driver away from pickup in opposite direction of destination
    // This creates a more realistic scenario where driver approaches pickup from outside
    const driverPos = {
      latitude: pickup.latitude - normalizedDx * driverDistance,
      longitude: pickup.longitude - normalizedDy * driverDistance,
      heading: (heading + 180) % 360, // Point toward pickup
    };

    setDriverPosition(driverPos);

    console.log("Driver positioned at:", driverPos);
    return driverPos;
  };

  // Use a simpler approach with waypoints instead of multiple API calls
  // Clear setupRoute function to start with the basics
  // const setupRoute = async () => {
  //   try {
  //     // IMPORTANT: Get coordinates directly from params every time
  //     const pickup = params.pickupCoordinate;
  //     const dropoff = params.dropoffCoordinate;

  //     if (!pickup || !dropoff) {
  //       console.error("Missing coordinates in setupRoute:", {
  //         pickup,
  //         dropoff,
  //       });
  //       return;
  //     }

  //     console.log("SETUP ROUTE - Using exact coordinates from params:");
  //     console.log("Pickup:", pickup);
  //     console.log("Dropoff:", dropoff);

  //     // Initialize driver position first - this creates a realistic starting point
  //     const driverPos = initializeDriverPosition();

  //     // Use Google Directions API with these coordinates
  //     const API_KEY = "Your API Key";

  //     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}&mode=driving&key=${API_KEY}`;

  //     console.log("Directions API URL:", url);

  //     const response = await fetch(url);
  //     const data = await response.json();

  //     if (data.status === "OK" && data.routes.length > 0) {
  //       const points = decodePolyline(data.routes[0].overview_polyline.points);
  //       console.log(`Received ${points.length} points for route`);
  //       setRouteCoordinates(points);

  //       // Position driver slightly away from pickup
  //       const driverPos = {
  //         latitude: pickup.latitude - 0.003,
  //         longitude: pickup.longitude - 0.003,
  //         heading: 45,
  //       };
  //       setDriverPosition(driverPos);

  //       // Calculate total ETA based on the entire route
  //       let totalDurationInSeconds = 0;
  //       data.routes[0].legs.forEach((leg) => {
  //         totalDurationInSeconds += leg.duration.value;
  //       });

  //       // Set ETA
  //       const durationInSeconds = data.routes[0].legs[0].duration.value;
  //       const now = new Date();
  //       now.setSeconds(now.getSeconds() + durationInSeconds);
  //       setEstimatedArrival(formatTime(now));

  //       // Fit map to include all important points
  //       if (mapRef.current) {
  //         mapRef.current.fitToCoordinates(
  //           [
  //             { latitude: driverPos.latitude, longitude: driverPos.longitude },
  //             pickup,
  //             dropoff,
  //           ],
  //           {
  //             edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
  //             animated: true,
  //           }
  //         );
  //       }
  //     } else {
  //       console.error("Directions API failed:", data.status);
  //     }
  //   } catch (error) {
  //     console.error("Error in setupRoute:", error);
  //     useFallbackRoute();
  //   }
  // };

  // Modified setupRoute for consistent zoom level with RideRequestScreen
  const setupRoute = async () => {
    try {
      // Get coordinates directly from params
      const pickup = params.pickupCoordinate;
      const dropoff = params.dropoffCoordinate;

      if (!pickup || !dropoff) {
        console.error("Missing coordinates in setupRoute");
        return;
      }

      console.log("Setting up route from", pickup, "to", dropoff);

      // Use Google Directions API with identical parameters as RideRequestScreen
      const API_KEY = "Your API Key";

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}&mode=driving&key=${API_KEY}`;

      console.log("Getting route with URL:", url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        // Process directions API response - identical to RideRequestScreen
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        console.log(`Received ${points.length} points for route`);
        setRouteCoordinates(points);

        // Calculate duration from API response
        const durationInSeconds = data.routes[0].legs[0].duration.value;
        const now = new Date();
        now.setSeconds(now.getSeconds() + durationInSeconds);
        setEstimatedArrival(formatTime(now));

        // Calculate map region identical to RideRequestScreen
        const midLat = (pickup.latitude + dropoff.latitude) / 2;
        const midLng = (pickup.longitude + dropoff.longitude) / 2;

        // Calculate deltas to ensure both points are visible
        const latDelta = Math.abs(pickup.latitude - dropoff.latitude) * 1.5;
        const lngDelta = Math.abs(pickup.longitude - dropoff.longitude) * 1.5;

        // Set map region with the exact same approach as RideRequestScreen
        setMapRegion({
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.max(0.02, latDelta),
          longitudeDelta: Math.max(0.02, lngDelta),
        });

        // Position driver near pickup but outside the visible area
        // This will make the animation visible when it starts
        const driverDistance = 0.001; // Very close to pickup

        // Determine direction from pickup to dropoff
        const dx = dropoff.latitude - pickup.latitude;
        const dy = dropoff.longitude - pickup.longitude;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        // Position driver slightly away from pickup, opposite of destination
        setDriverPosition({
          latitude: pickup.latitude - normalizedDx * driverDistance,
          longitude: pickup.longitude - normalizedDy * driverDistance,
          heading:
            Math.atan2(normalizedDy, normalizedDx) * (180 / Math.PI) + 180,
        });

        // Fit map to route
        fitMapToRoute(points);
      } else {
        console.error("Directions API failed:", data.status);
        useFallbackRoute();
      }
    } catch (error) {
      console.error("Error in setupRoute:", error);
      useFallbackRoute();
    }
  };

  // Simpler fallback route function
  const useFallbackRoute = () => {
    const pickup = params.pickupCoordinate;
    const dropoff = params.dropoffCoordinate;

    if (!pickup || !dropoff) return;

    // Position driver close to pickup
    const driverPos = {
      latitude: pickup.latitude - 0.002,
      longitude: pickup.longitude - 0.002,
      heading: 45,
    };
    setDriverPosition(driverPos);

    // Simple straight-line route from pickup to dropoff
    const simplifiedRoute = [
      pickup,
      {
        latitude: (pickup.latitude + dropoff.latitude) / 2,
        longitude: (pickup.longitude + dropoff.longitude) / 2,
      },
      dropoff,
    ];

    setRouteCoordinates(simplifiedRoute);

    // Set ETA
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    setEstimatedArrival(formatTime(now));

    // Fit map with identical zoom as RideRequestScreen
    fitMapToRoute([pickup, dropoff]);

    console.log("Using fallback route");
  };

  // Enhanced map fitting function to handle any coordinates
  const fitMapToCoordinates = (coordinates) => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: MAP_PADDING,
        animated: true,
      });
    }
  };

  // // Helper function to find the closest point in the route to the pickup location
  // const findClosestPointIndex = (points, targetLocation) => {
  //   let closestIndex = 0;
  //   let closestDistance = Number.MAX_VALUE;

  //   points.forEach((point, index) => {
  //     const distance =
  //       Math.pow(point.latitude - targetLocation.latitude, 2) +
  //       Math.pow(point.longitude - targetLocation.longitude, 2);

  //     if (distance < closestDistance) {
  //       closestDistance = distance;
  //       closestIndex = index;
  //     }
  //   });

  //   return closestIndex;
  // };

  // // Fit map to route with proper padding
  // Better map fitting function with appropriate zoom level
  const fitMapToRoute = (coordinates) => {
    if (mapRef.current && coordinates.length > 0) {
      // Use identical parameters as RideRequestScreen
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
        animated: true,
      });
    }
  };

  // Update the simulateFindingDriver function to handle ride status changes
  const simulateFindingDriver = () => {
    // Find driver after 3 seconds
    setTimeout(() => {
      const mockDriver = generateMockDriver();
      setDriverInfo(mockDriver);
      setRideStatus(RideStatus.DRIVER_ASSIGNED);

      // Simulate driver arriving status after 5 seconds
      setTimeout(() => {
        setRideStatus(RideStatus.DRIVER_ARRIVING);

        // Re-enable driver animation
        console.log("Starting driver animation");
        startDriverAnimation();
      }, 5000);
    }, 3000);
  };

  // 4. Simpler driver animation function
  const startDriverAnimation = () => {
    // Reset animation value
    driverAnimationValue.setValue(0);

    // Use a quick animation for more obvious movement
    Animated.timing(driverAnimationValue, {
      toValue: 1,
      duration: 5000, // 5 seconds is enough to be noticeable
      useNativeDriver: false,
    }).start();
  };

  // Modified animation to make driver movement more obvious
  const updateDriverPosition = (animationValue) => {
    // Don't update if no route coordinates
    if (!params.pickupCoordinate) return;

    // Get pickup point
    const pickup = params.pickupCoordinate;

    // Calculate more visible movement from starting position to pickup
    const startPos = {
      latitude: driverPosition.latitude,
      longitude: driverPosition.longitude,
    };

    // Linear interpolation for now - simple but effective
    const latitude =
      startPos.latitude +
      (pickup.latitude - startPos.latitude) * animationValue;
    const longitude =
      startPos.longitude +
      (pickup.longitude - startPos.longitude) * animationValue;

    // Update driver position
    setDriverPosition({
      latitude,
      longitude,
      heading: driverPosition.heading,
    });

    // // Log occasionally for debugging
    // if (Math.round(animationValue * 10) % 2 === 0) {
    //   console.log(
    //     `Driver animation progress: ${(animationValue * 100).toFixed(0)}%`
    //   );
    // }
  };

  // Handler functions
  const handleCallDriver = () => {
    if (driverInfo?.phone) {
      Linking.openURL(`tel:${driverInfo.phone}`);
    }
  };

  const handleMessageDriver = () => {
    if (driverInfo?.phone) {
      Linking.openURL(`sms:${driverInfo.phone}`);
    }
  };

  const handleShareRide = () => {
    Alert.alert(
      "Share Ride",
      "Your ride details would be shared with your contacts.",
      [{ text: "OK" }]
    );
  };

  const handleCancelRide = () => {
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: processCancellation,
      },
    ]);
  };

  const processCancellation = () => {
    setCancellingRide(true);
    // Simulate cancellation process
    setTimeout(() => {
      setRideStatus(RideStatus.RIDE_CANCELLED);
      setTimeout(() => {
        navigation.navigate(ROUTES.HOME);
      }, 1500);
    }, 1000);
  };

  // Render finding driver state
  const renderFindingDriver = () => (
    <FindingDriverCard
      onShareRide={handleShareRide}
      onCancelRide={handleCancelRide}
    />
  );

  // Render driver info card
  const renderDriverInfo = () => {
    if (!driverInfo) return null;

    return (
      <DriverInfoCard
        driver={driverInfo}
        estimatedArrival={estimatedArrival}
        cancellingRide={cancellingRide}
        onCallDriver={handleCallDriver}
        onMessageDriver={handleMessageDriver}
        onCancelRide={handleCancelRide}
      />
    );
  };

  // Render ride cancelled state
  const renderRideCancelled = () => (
    <RideCancelledCard onBackToHome={() => navigation.navigate(ROUTES.HOME)} />
  );

  // Render skeleton loading state
  const renderLoadingState = () => (
    <View className="p-4 bg-white rounded-t-3xl">
      <SkeletonLoader width="100%" height={150} borderRadius={16} />
    </View>
  );

  // Render content based on ride status
  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    switch (rideStatus) {
      case RideStatus.FINDING_DRIVER:
        return renderFindingDriver();

      case RideStatus.DRIVER_ASSIGNED:
      case RideStatus.DRIVER_ARRIVING:
        return renderDriverInfo();

      case RideStatus.RIDE_CANCELLED:
        return renderRideCancelled();

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Map View */}
      <View className="flex-1 relative">
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={true}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
        >
          {/* Pickup and Destination Markers */}
          <Marker coordinate={pickupLocation} title="Pickup">
            <View className="bg-green-500 p-2 rounded-full border-2 border-white">
              <MapPin size={20} color="white" />
            </View>
          </Marker>

          <Marker coordinate={destinationLocation} title="Destination">
            <View className="bg-primary p-2 rounded-full border-2 border-white">
              <MapPin size={20} color="white" />
            </View>
          </Marker>

          {/* Driver Marker */}
          {driverInfo && rideStatus !== RideStatus.RIDE_CANCELLED && (
            <Marker
              coordinate={{
                latitude: driverPosition.latitude,
                longitude: driverPosition.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              rotation={driverPosition.heading}
            >
              <Image
                source={require("../../assets/rickshaw.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </Marker>
          )}

          {/* Route Line */}
          {routeCoordinates.length > 0 &&
            rideStatus !== RideStatus.RIDE_CANCELLED && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor={COLORS.PRIMARY}
              />
            )}
        </MapView>

        {/* Back Button */}
        <TouchableOpacity
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md"
          onPress={() => navigation.goBack()}
        >
          <X size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet with Dynamic Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: "65%",
  },
});

export default RideConfirmationScreen;
