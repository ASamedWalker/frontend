// src/components/MapPlaceholder.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';

type Props = {
  onSelectLocation: (location: { latitude: number; longitude: number }) => void;
};

const MapPlaceholder = ({ onSelectLocation }: Props) => {
  // Simulate location selection with hardcoded points around Ghana
  const locations = [
    { name: "Current Location", latitude: 5.6037, longitude: -0.187 },
    { name: "Accra Central", latitude: 5.550, longitude: -0.217 },
    { name: "Kumasi", latitude: 6.688, longitude: -1.623 },
    { name: "Tamale", latitude: 9.403, longitude: -0.844 }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Location</Text>
      <Text style={styles.subtitle}>Maps temporarily unavailable</Text>

      {locations.map((location, index) => (
        <TouchableOpacity
          key={index}
          style={styles.locationButton}
          onPress={() => onSelectLocation({
            latitude: location.latitude,
            longitude: location.longitude
          })}
        >
          <Text style={styles.locationText}>{location.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20
  },
  locationButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center'
  },
  locationText: {
    color: 'white',
    fontWeight: '500'
  }
});

export default MapPlaceholder;