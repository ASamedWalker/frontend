// src/types/rides.ts
// Ride status enum
export enum RideStatus {
  FINDING_DRIVER = "FINDING_DRIVER",
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  DRIVER_ARRIVING = "DRIVER_ARRIVING",
  RIDE_CANCELLED = "RIDE_CANCELLED",
  RIDE_STARTED = "RIDE_STARTED",
  RIDE_COMPLETED = "RIDE_COMPLETED"
}

// Vehicle information
export interface Vehicle {
  model: string;
  color: string;
  licensePlate: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  photo: any; // Image source
  vehicle: Vehicle;
  completedRides: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  heading: number;
  type: "okada" | "taxi" | "premium";
}

export interface RideOption {
  id: string;
  name: string;
  image: any;
  basePrice: number;
  pricePerKm: number;
  baseEta: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

// Ride information
export interface Ride {
  id: string;
  status: RideStatus;
  driver: Driver | null;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  destinationLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  rideOption: RideOption;
  estimatedPrice: string;
  estimatedArrival: string;
  estimatedDistance: number;
  estimatedDuration: number;
  createdAt: Date;
}

// Coordinate type
export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Driver position with heading
export interface DriverPosition extends Coordinate {
  heading: number;
}