import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage utility for AsyncStorage with type safety and error handling
 */
export const storageService = {
  /**
   * Store a value in AsyncStorage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   * @returns Promise<boolean> - Success status
   */
  store: async <T>(key: string, value: T): Promise<boolean> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error("Storage error:", error);
      return false;
    }
  },

  /**
   * Retrieve a value from AsyncStorage
   * @param key - Storage key
   * @returns Promise<T | null> - Retrieved value or null if not found
   */
  retrieve: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (error) {
      console.error("Storage error:", error);
      return null;
    }
  },

  /**
   * Remove a value from AsyncStorage
   * @param key - Storage key
   * @returns Promise<boolean> - Success status
   */
  remove: async (key: string): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage error:", error);
      return false;
    }
  },

  /**
   * Clear all values from AsyncStorage
   * @returns Promise<boolean> - Success status
   */
  clear: async (): Promise<boolean> => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage error:", error);
      return false;
    }
  },

  /**
   * Get all keys from AsyncStorage
   * @returns Promise<string[]> - Array of keys
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.error("Storage error:", error);
      return [];
    }
  },
};

export default storageService;
