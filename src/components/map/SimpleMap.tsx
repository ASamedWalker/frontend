// src/components/SimpleMap.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView from 'react-native-maps';

const SimpleMap = () => {
  const [mapError, setMapError] = useState<string | null>(null);

  // If map fails to load, show error UI instead
  if (mapError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Map failed to load: {mapError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 5.6037,
          longitude: -0.187,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onError={(error) => {
          console.error('Map error:', error);
          setMapError(error.nativeEvent?.error || 'Unknown map error');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default SimpleMap;