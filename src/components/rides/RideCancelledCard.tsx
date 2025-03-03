// src/components/rides/RideCancelledCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';

interface RideCancelledCardProps {
  onBackToHome: () => void;
}

const RideCancelledCard = ({ onBackToHome }: RideCancelledCardProps) => {
  return (
    <View className="p-4 bg-white rounded-t-3xl">
      <View className="items-center mb-4">
        <View className="bg-gray-200 p-3 rounded-full mb-3">
          <X size={24} color="#777" />
        </View>
        <Text className="text-lg font-bold mb-1">Ride Cancelled</Text>
        <Text className="text-gray-500 text-sm">
          Your ride has been cancelled successfully
        </Text>
      </View>

      <TouchableOpacity
        className="bg-primary py-3 rounded-lg items-center mt-3"
        onPress={onBackToHome}
      >
        <Text className="text-white font-bold">Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RideCancelledCard;