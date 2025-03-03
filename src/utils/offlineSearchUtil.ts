// src/utils/offlineSearch.ts
import NetInfo from '@react-native-community/netinfo';
import { Place, placeStorageService } from '../utils/placeStorage';
import { GHANA_PLACES } from '../constants/ghanaPlaces';

/**
 * Interface for search result with offline status indicator
 */
export interface SearchResult {
  results: Place[];
  isOfflineResult: boolean;
}

/**
 * Initialize offline search capability
 */
export const initializeOfflineSearch = async (): Promise<boolean> => {
  try {
    // Check if offline places are already stored
    const storedPlaces = await placeStorageService.getOfflinePlaces();

    if (storedPlaces.length === 0) {
      // Store Ghana places for offline use
      await placeStorageService.storeOfflinePlaces(GHANA_PLACES);
      console.log('Initialized offline places database');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize offline search:', error);
    return false;
  }
};

/**
 * Search for places with automatic online/offline fallback
 */
export const searchPlaces = async (query: string): Promise<SearchResult> => {
  // Empty query returns no results
  if (!query.trim()) {
    return { results: [], isOfflineResult: false };
  }

  // Check network status
  const netInfo = await NetInfo.fetch();
  const isConnected = netInfo.isConnected;

  if (isConnected) {
    try {
      // In a real app, you would call your backend API or Google Places API here
      // For now, we'll simulate an online search with our local data

      // Pretend this is an API call
      const results = await new Promise<Place[]>((resolve) => {
        setTimeout(() => {
          const filtered = GHANA_PLACES.filter(
            place =>
              place.name.toLowerCase().includes(query.toLowerCase()) ||
              place.address.toLowerCase().includes(query.toLowerCase())
          );
          resolve(filtered);
        }, 500); // Simulate network delay
      });

      return { results, isOfflineResult: false };
    } catch (error) {
      console.error('Online search failed, falling back to offline:', error);
      // Fall back to offline search
    }
  }

  // Offline search using stored data
  try {
    // Get stored offline places
    const offlinePlaces = await placeStorageService.getOfflinePlaces();

    // Also include saved places and recent places in offline search
    const [savedPlaces, recentPlaces, homeLocation, workLocation] = await Promise.all([
      placeStorageService.getSavedPlaces(),
      placeStorageService.getRecentPlaces(),
      placeStorageService.getHomeLocation(),
      placeStorageService.getWorkLocation()
    ]);

    // Combine all available places
    let allPlaces: Place[] = [...offlinePlaces];

    // Add saved places if not already included
    savedPlaces.forEach(place => {
      if (!allPlaces.some(p => p.id === place.id)) {
        allPlaces.push(place);
      }
    });

    // Add recent places if not already included
    recentPlaces.forEach(place => {
      if (!allPlaces.some(p => p.id === place.id)) {
        allPlaces.push(place);
      }
    });

    // Add home and work if available and not already included
    if (homeLocation && !allPlaces.some(p => p.id === homeLocation.id)) {
      allPlaces.push(homeLocation);
    }

    if (workLocation && !allPlaces.some(p => p.id === workLocation.id)) {
      allPlaces.push(workLocation);
    }

    // Filter based on search query
    const results = allPlaces.filter(
      place =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.address.toLowerCase().includes(query.toLowerCase())
    );

    return { results, isOfflineResult: true };
  } catch (error) {
    console.error('Offline search failed:', error);
    return { results: [], isOfflineResult: true };
  }
};

export default { initializeOfflineSearch, searchPlaces };