// src/utils/driverUtils.ts
import { Driver } from '../types/rides';

/**
 * Generates nearby drivers around a given coordinate
 */
export const generateNearbyDrivers = (pickupCoordinate: {latitude: number, longitude: number}): Driver[] => {
  if (!pickupCoordinate) {
    console.log("No pickup coordinate available for generating drivers");
    return [];
  }

  // Create different numbers of drivers by type
  const numOkada = Math.floor(Math.random() * 4) + 3; // 3-6 okadas
  const numTaxi = Math.floor(Math.random() * 3) + 1; // 1-3 taxis
  const numPremium = Math.floor(Math.random() * 2) + 1; // 1-2 premium cars

  const drivers: Driver[] = [];

  // Generate Okada drivers
  for (let i = 0; i < numOkada; i++) {
    const randomDistance = 0.005 + Math.random() * 0.005;
    const randomAngle = Math.random() * Math.PI * 2;

    const latOffset = randomDistance * Math.cos(randomAngle);
    const lngOffset = randomDistance * Math.sin(randomAngle);

    drivers.push({
      id: `okada-${i}`,
      coordinate: {
        latitude: pickupCoordinate.latitude + latOffset,
        longitude: pickupCoordinate.longitude + lngOffset,
      },
      heading: Math.random() * 360,
      type: "okada",
    });
  }

  // Generate Taxi drivers
  for (let i = 0; i < numTaxi; i++) {
    const randomDistance = 0.007 + Math.random() * 0.007;
    const randomAngle = Math.random() * Math.PI * 2;

    const latOffset = randomDistance * Math.cos(randomAngle);
    const lngOffset = randomDistance * Math.sin(randomAngle);

    drivers.push({
      id: `taxi-${i}`,
      coordinate: {
        latitude: pickupCoordinate.latitude + latOffset,
        longitude: pickupCoordinate.longitude + lngOffset,
      },
      heading: Math.random() * 360,
      type: "taxi",
    });
  }

  // Generate Premium drivers
  for (let i = 0; i < numPremium; i++) {
    const randomDistance = 0.009 + Math.random() * 0.009;
    const randomAngle = Math.random() * Math.PI * 2;

    const latOffset = randomDistance * Math.cos(randomAngle);
    const lngOffset = randomDistance * Math.sin(randomAngle);

    drivers.push({
      id: `premium-${i}`,
      coordinate: {
        latitude: pickupCoordinate.latitude + latOffset,
        longitude: pickupCoordinate.longitude + lngOffset,
      },
      heading: Math.random() * 360,
      type: "premium",
    });
  }

  return drivers;
};

/**
 * Update driver positions for animation
 */
export const updateDriverPositions = (drivers: Driver[]): Driver[] => {
  return drivers.map((driver) => {
    const latChange = (Math.random() - 0.5) * 0.0002;
    const lngChange = (Math.random() - 0.5) * 0.0002;
    const headingChange = (Math.random() - 0.5) * 10;

    return {
      ...driver,
      coordinate: {
        latitude: driver.coordinate.latitude + latChange,
        longitude: driver.coordinate.longitude + lngChange,
      },
      heading: (driver.heading + headingChange) % 360,
    };
  });
};

/**
 * Filter drivers by type
 */
export const filterDriversByType = (drivers: Driver[], type: "okada" | "taxi" | "premium"): Driver[] => {
  return drivers.filter((driver) => driver.type === type);
};