// src/utils/rideUtils.ts
import { Coordinate, Driver } from "../screens/ride/types/rides";

/**
 * Create mock route coordinates between two points
 */
export const createMockRouteCoordinates = (
  origin: Coordinate,
  destination: Coordinate
): Coordinate[] => {
  // Simple route with a few waypoints for visualization
  return [
    origin,
    {
      latitude: (origin.latitude + destination.latitude) * 0.4 + 0.001,
      longitude: (origin.longitude + destination.longitude) * 0.3,
    },
    {
      latitude: (origin.latitude + destination.latitude) * 0.6 - 0.002,
      longitude: (origin.longitude + destination.longitude) * 0.7,
    },
    destination,
  ];
};

/**
 * Format a Date object to a time string (hours and minutes)
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

/**
 * Generate a mock driver with random properties
 */
export const generateMockDriver = (): Driver => {
  const driverNames = [
    "Kwame Mensah",
    "Kofi Adu",
    "Emmanuel Boateng",
    "Isaac Owusu",
    "Ama Serwaa",
  ];

  const vehicleColors = ["Yellow", "Blue", "Green", "Red", "White"];
  const vehicleModels = [
    "Bajaj RE",
    "Honda CG",
    "Yamaha YBR",
    "TVS King",
    "Piaggio Ape",
  ];

  // Generate a random driver
  return {
    id: "DRV-" + Math.floor(Math.random() * 1000),
    name: driverNames[Math.floor(Math.random() * driverNames.length)],
    phone: "+233 55 " + Math.floor(1000000 + Math.random() * 9000000),
    rating: (3.5 + Math.random() * 1.5).toFixed(1) as unknown as number,
    photo: require("../assets/driver-avatar.png"),
    vehicle: {
      model: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
      color: vehicleColors[Math.floor(Math.random() * vehicleColors.length)],
      licensePlate:
        "GR-" +
        Math.floor(1000 + Math.random() * 9000) +
        "-" +
        Math.floor(10 + Math.random() * 90),
    },
    completedRides: Math.floor(50 + Math.random() * 950),
    coordinate: {
      latitude: 5.6037 + Math.random() * 0.1,
      longitude: -0.1870 + Math.random() * 0.1,
    },
    heading: Math.random() * 360,
    type: "okada",
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Convert degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};


/**
 * Decode Google Directions API polyline into coordinates
 * @param encoded - Encoded polyline string from Google Directions API
 * @returns Array of coordinates (latitude/longitude)
 */
export const decodePolyline = (encoded: string): Coordinate[] => {
  // Initialize variables
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const coordinates = [];

  while (index < len) {
    // For both latitude and longitude
    for (let i = 0; i < 2; i++) {
      let shift = 0;
      let result = 0;

      // Decode 5-bit chunks
      while (true) {
        const b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
        if (b < 0x20) break;
      }

      // Convert to actual coordinate value
      const value = ((result & 1) ? ~(result >> 1) : (result >> 1));
      if (i === 0) {
        lat += value;
      } else {
        lng += value;
      }
    }

    // Store coordinate
    coordinates.push({
      latitude: lat / 100000,
      longitude: lng / 100000
    });
  }

  return coordinates;
}