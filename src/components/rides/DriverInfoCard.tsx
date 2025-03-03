// src/components/rides/DriverInfoCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Phone, MessageCircle, Star, AlertTriangle } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Driver } from '../../screens/ride/types/rides';

interface DriverInfoCardProps {
  driver: Driver;
  estimatedArrival: string;
  cancellingRide: boolean;
  onCallDriver: () => void;
  onMessageDriver: () => void;
  onCancelRide: () => void;
}

const DriverInfoCard = ({
  driver,
  estimatedArrival,
  cancellingRide,
  onCallDriver,
  onMessageDriver,
  onCancelRide,
}: DriverInfoCardProps) => {
  return (
    <View className="p-4 bg-white rounded-t-3xl">
      {/* Driver Profile Section */}
      <View className="flex-row items-center mb-3">
        <View className="mr-3">
          <Image
            source={driver.photo}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
          <View className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
        </View>

        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-bold mr-2">{driver.name}</Text>
            <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
              <Star size={14} color="#FFD700" className="mr-1" />
              <Text className="text-sm font-medium">{driver.rating}</Text>
            </View>
          </View>

          <Text className="text-gray-600 mb-1">
            {driver.vehicle.color} {driver.vehicle.model}
          </Text>

          <Text className="text-gray-800 font-bold">
            {driver.vehicle.licensePlate}
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            className="bg-gray-100 p-2 rounded-full mr-2"
            onPress={onMessageDriver}
          >
            <MessageCircle size={22} color={COLORS.PRIMARY} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-primary p-2 rounded-full"
            onPress={onCallDriver}
          >
            <Phone size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ETA Alert */}
      <View className="flex-row items-center mb-3 p-3 bg-blue-50 rounded-lg">
        <View className="mr-3 bg-blue-100 p-2 rounded-full">
          <AlertTriangle size={18} color={COLORS.PRIMARY} />
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 font-medium">Driver is on the way</Text>
          <Text className="text-gray-600 text-sm">
            Estimated arrival at {estimatedArrival}
          </Text>
        </View>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity
        className={`${
          cancellingRide ? "bg-gray-300" : "bg-white border border-gray-300"
        } py-3 rounded-lg items-center mt-2`}
        onPress={onCancelRide}
        disabled={cancellingRide}
      >
        {cancellingRide ? (
          <ActivityIndicator size="small" color="#777" />
        ) : (
          <Text className="text-gray-800 font-bold">Cancel Ride</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DriverInfoCard;