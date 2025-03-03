// src/components/rides/FindingDriverCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Shield, Share2 } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface FindingDriverCardProps {
  onShareRide: () => void;
  onCancelRide: () => void;
}

const FindingDriverCard = ({ onShareRide, onCancelRide }: FindingDriverCardProps) => {
  return (
    <View className="p-4 bg-white rounded-t-3xl">
      <View className="items-center mb-4">
        <Text className="text-lg font-bold mb-1">Finding your driver</Text>
        <Text className="text-gray-500 text-sm">Your ride request has been confirmed</Text>
      </View>

      <View className="flex-row mb-4 items-center justify-center">
        <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{ marginRight: 10 }} />
        <Text className="text-primary font-medium">Connecting with nearby drivers</Text>
      </View>

      <View className="flex-row justify-between mb-2">
        <View className="flex-row items-center">
          <Shield size={18} color="#777" className="mr-2" />
          <Text className="text-gray-600 text-sm">Your ride is insured</Text>
        </View>
        <TouchableOpacity onPress={onShareRide}>
          <Share2 size={18} color="#777" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-white border border-gray-300 py-3 rounded-lg items-center mt-2"
        onPress={onCancelRide}
      >
        <Text className="text-gray-800 font-bold">Cancel Request</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FindingDriverCard;