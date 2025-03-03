// src/services/placeStorage.ts
import storageService from '../utils/storage';

// Storage keys for place-related data
export const PLACE_KEYS = {
  RECENT_PLACES: 'okada_recent_places',
  SAVED_PLACES: 'okada_saved_places',
  HOME_LOCATION: 'okada_home_location',
  WORK_LOCATION: 'okada_work_location',
  OFFLINE_PLACES: 'okada_offline_places',
};

// Types
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinate;
  type?: string;
  timestamp?: number;
}

/**
 * Service for managing place-related storage
 */
export const placeStorageService = {
  /**
   * Get recent places
   */
  getRecentPlaces: async (): Promise<Place[]> => {
    return await storageService.retrieve(PLACE_KEYS.RECENT_PLACES) || [];
  },

  /**
   * Add a place to recent places
   */
  addToRecentPlaces: async (place: Place): Promise<boolean> => {
    try {
      // Add timestamp
      const placeWithTimestamp = {
        ...place,
        timestamp: Date.now()
      };

      // Get current places
      const currentPlaces = await placeStorageService.getRecentPlaces();

      // Remove if already exists
      const filteredPlaces = currentPlaces.filter(p => p.id !== place.id);

      // Add to beginning and limit to 10 entries
      const updatedPlaces = [placeWithTimestamp, ...filteredPlaces].slice(0, 10);

      // Store updated list
      return await storageService.store(PLACE_KEYS.RECENT_PLACES, updatedPlaces);
    } catch (error) {
      console.error('Error adding to recent places:', error);
      return false;
    }
  },

  /**
   * Get saved places
   */
  getSavedPlaces: async (): Promise<Place[]> => {
    return await storageService.retrieve(PLACE_KEYS.SAVED_PLACES) || [];
  },

  /**
   * Save or update a place
   */
  savePlace: async (place: Place): Promise<boolean> => {
    try {
      // Get current saved places
      const currentPlaces = await placeStorageService.getSavedPlaces();

      // Check if place already exists
      const existingIndex = currentPlaces.findIndex(p => p.id === place.id);

      let updatedPlaces;
      if (existingIndex >= 0) {
        // Update existing place
        updatedPlaces = [...currentPlaces];
        updatedPlaces[existingIndex] = place;
      } else {
        // Add new place
        updatedPlaces = [...currentPlaces, place];
      }

      // Store updated list
      return await storageService.store(PLACE_KEYS.SAVED_PLACES, updatedPlaces);
    } catch (error) {
      console.error('Error saving place:', error);
      return false;
    }
  },

  /**
   * Remove a saved place
   */
  removeSavedPlace: async (placeId: string): Promise<boolean> => {
    try {
      // Get current saved places
      const currentPlaces = await placeStorageService.getSavedPlaces();

      // Filter out place to remove
      const updatedPlaces = currentPlaces.filter(p => p.id !== placeId);

      // Store updated list
      return await storageService.store(PLACE_KEYS.SAVED_PLACES, updatedPlaces);
    } catch (error) {
      console.error('Error removing saved place:', error);
      return false;
    }
  },

  /**
   * Get home location
   */
  getHomeLocation: async (): Promise<Place | null> => {
    return await storageService.retrieve(PLACE_KEYS.HOME_LOCATION);
  },

  /**
   * Set home location
   */
  setHomeLocation: async (place: Place): Promise<boolean> => {
    return await storageService.store(PLACE_KEYS.HOME_LOCATION, place);
  },

  /**
   * Get work location
   */
  getWorkLocation: async (): Promise<Place | null> => {
    return await storageService.retrieve(PLACE_KEYS.WORK_LOCATION);
  },

  /**
   * Set work location
   */
  setWorkLocation: async (place: Place): Promise<boolean> => {
    return await storageService.store(PLACE_KEYS.WORK_LOCATION, place);
  },

  /**
   * Store offline places data
   */
  storeOfflinePlaces: async (places: Place[]): Promise<boolean> => {
    return await storageService.store(PLACE_KEYS.OFFLINE_PLACES, places);
  },

  /**
   * Get offline places data
   */
  getOfflinePlaces: async (): Promise<Place[]> => {
    return await storageService.retrieve(PLACE_KEYS.OFFLINE_PLACES) || [];
  },

  /**
   * Clear all place-related data
   */
  clearAllPlaceData: async (): Promise<boolean> => {
    try {
      const keys = Object.values(PLACE_KEYS);
      for (const key of keys) {
        await storageService.remove(key);
      }
      return true;
    } catch (error) {
      console.error('Error clearing place data:', error);
      return false;
    }
  }
};

export default placeStorageService;