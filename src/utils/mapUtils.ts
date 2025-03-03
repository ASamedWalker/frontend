// Add this utility file to your project:
// src/utils/mapUtils.ts

/**
 * Decodes an encoded polyline string into a series of coordinates
 * This is used for Google Directions API encoded polylines
 */
export const decodePolyline = (encoded: string) => {
  const points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }

  return points;
};

/**
 * Helper function to get a fallback route when API fails
 */
export const getFallbackRoute = (startCoord, endCoord) => {
  const numPoints = 10;
  const route = [];

  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;

    // Linear interpolation between pickup and dropoff
    const lat = startCoord.latitude + fraction * (endCoord.latitude - startCoord.latitude);
    const lng = startCoord.longitude + fraction * (endCoord.longitude - startCoord.longitude);

    // Add some randomness to make it look like a road (avoid straight line)
    const jitter = 0.0008 * Math.sin(fraction * Math.PI);

    route.push({
      latitude: lat + (i > 0 && i < numPoints ? jitter : 0),
      longitude: lng + (i > 0 && i < numPoints ? jitter : 0),
    });
  }

  return route;
};

/**
 * Calculates the distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Formats a distance in kilometers for display
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    // Convert to meters if less than 1km
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Formats a duration in minutes for display
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};