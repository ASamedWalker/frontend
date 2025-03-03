// src/screens/rider/LocationSearchScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X, MapPin, Clock, Navigation, Star } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import NetInfo from '@react-native-community/netinfo';

// Import custom components and utilities
import SearchInput from '../../components/common/SearchInput';
import { Place, placeStorageService } from '../../utils/placeStorage';
import { searchPlaces, initializeOfflineSearch } from '../../utils/offlineSearchUtil';

const LocationSearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [homeLocation, setHomeLocation] = useState<Place | null>(null);
  const [workLocation, setWorkLocation] = useState<Place | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isOfflineResults, setIsOfflineResults] = useState(false);

  // Extract params from route
  const { pickupCoordinate, destinationName, destinationAddress } = route.params || {};

  // Initialize offline search when component mounts
  useEffect(() => {
    initializeOfflineSearch().catch(error => {
      console.error('Failed to initialize offline search:', error);
    });
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      setIsOfflineMode(!isConnected);

      if (!isConnected) {
        // Show offline notification (but only once)
        Alert.alert(
          'Offline Mode',
          'You are currently offline. Search results will be limited to saved locations.',
          [{ text: 'OK' }]
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // Load saved places, recent places, and special locations
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [recent, saved, home, work] = await Promise.all([
          placeStorageService.getRecentPlaces(),
          placeStorageService.getSavedPlaces(),
          placeStorageService.getHomeLocation(),
          placeStorageService.getWorkLocation(),
        ]);

        setRecentPlaces(recent);

        // Filter out home and work from saved places to avoid duplication
        const filteredSaved = saved.filter(place =>
          place.id !== (home?.id || '') && place.id !== (work?.id || '')
        );
        setSavedPlaces(filteredSaved);

        if (home) setHomeLocation(home);
        if (work) setWorkLocation(work);

        // Pre-populate search if destination was provided
        if (destinationName) {
          setSearchQuery(destinationName);
          handleSearch(destinationName);
        }
      } catch (error) {
        console.error('Error loading stored location data:', error);
      }
    };

    loadStoredData();
  }, [destinationName]);

  // Search handler with debounce
  const handleSearch = useCallback(async (text: string) => {
    setSearchQuery(text);

    if (text.trim().length > 0) {
      setIsSearching(true);

      try {
        // Use our offline-capable search utility
        const { results, isOfflineResult } = await searchPlaces(text);
        setSearchResults(results);
        setIsOfflineResults(isOfflineResult);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, []);

  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle location selection (search results, recent, or saved)
  const handleSelectLocation = async (place: Place) => {
    try {
      // Add to recent places
      await placeStorageService.addToRecentPlaces(place);

      // Navigate to ride request screen with pickup and dropoff
      navigation.navigate(ROUTES.RIDE_REQUEST, {
        pickupCoordinate,
        dropoffCoordinate: place.coordinates
      });
    } catch (error) {
      console.error('Error selecting location:', error);
      Alert.alert('Error', 'Failed to select this location. Please try again.');
    }
  };

  // Handle current location selection as destination
  const selectCurrentLocation = () => {
    if (pickupCoordinate) {
      handleSelectLocation({
        id: 'current-location',
        name: 'Current Location',
        address: 'Your current location',
        coordinates: pickupCoordinate,
        type: 'current'
      });
    } else {
      Alert.alert('Error', 'Unable to determine your current location.');
    }
  };

  // Render item for search results
  const renderSearchItem = ({ item }: { item: Place }) => (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-100"
      onPress={() => handleSelectLocation(item)}
    >
      <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
        <MapPin size={20} color={COLORS.PRIMARY} />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-base">{item.name}</Text>
        <Text className="text-gray-500 text-sm">{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render recent places
  const renderRecentItem = ({ item }: { item: Place }) => (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-100"
      onPress={() => handleSelectLocation(item)}
    >
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Clock size={20} color="#777" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-base">{item.name}</Text>
        <Text className="text-gray-500 text-sm">{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'android' ? insets.top : 0
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header with back button and search */}
        <View className="px-4 pt-2 pb-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="p-2 -ml-2"
              onPress={() => navigation.goBack()}
            >
              <X size={24} color="#333" />
            </TouchableOpacity>

            {/* Search Input Component */}
            <View className="flex-1 ml-2">
              <SearchInput
                placeholder="Where to?"
                value={searchQuery}
                onChangeText={handleSearch}
                onClear={clearSearch}
                autoFocus={true}
                isLoading={isSearching}
                isOfflineMode={isOfflineMode && isOfflineResults}
                debounceDelay={300}
              />
            </View>
          </View>

          {/* Current location as destination option */}
          <TouchableOpacity
            className="flex-row items-center mt-3"
            onPress={selectCurrentLocation}
          >
            <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-2">
              <Navigation size={18} color={COLORS.PRIMARY} />
            </View>
            <Text className="text-primary font-medium">Set current location as destination</Text>
          </TouchableOpacity>
        </View>

        {/* Search results or recent/saved places */}
        {isSearching ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text className="mt-2 text-gray-500">Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View className="flex-1 px-4 pt-4">
            {/* Home and Work locations */}
            {(homeLocation || workLocation) && (
              <View className="mb-4">
                <Text className="text-gray-500 font-medium mb-2">Saved Places</Text>

                {homeLocation && (
                  <TouchableOpacity
                    className="flex-row items-center py-3 border-b border-gray-100"
                    onPress={() => handleSelectLocation(homeLocation)}
                  >
                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                      <MapPin size={20} color={COLORS.PRIMARY} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-base">Home</Text>
                      <Text className="text-gray-500 text-sm">{homeLocation.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {workLocation && (
                  <TouchableOpacity
                    className="flex-row items-center py-3 border-b border-gray-100"
                    onPress={() => handleSelectLocation(workLocation)}
                  >
                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                      <Star size={20} color={COLORS.PRIMARY} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-base">Work</Text>
                      <Text className="text-gray-500 text-sm">{workLocation.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Other saved places */}
            {savedPlaces.length > 0 && (
              <View className="mb-4">
                <Text className="text-gray-500 font-medium mb-2">Favorites</Text>
                {savedPlaces.map(place => (
                  <TouchableOpacity
                    key={place.id}
                    className="flex-row items-center py-3 border-b border-gray-100"
                    onPress={() => handleSelectLocation(place)}
                  >
                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                      <Star size={20} color="#777" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-base">{place.name}</Text>
                      <Text className="text-gray-500 text-sm">{place.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent places */}
            {recentPlaces.length > 0 && (
              <View>
                <Text className="text-gray-500 font-medium mb-2">Recent Places</Text>
                <FlatList
                  data={recentPlaces}
                  renderItem={renderRecentItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}

            {/* Offline mode indicator */}
            {isOfflineMode && (
              <View className="items-center mt-4 p-3 bg-yellow-50 rounded-lg">
                <Text className="text-yellow-800">
                  You're in offline mode. Some locations may not be available.
                </Text>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocationSearchScreen;