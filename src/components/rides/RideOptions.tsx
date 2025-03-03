// src/components/rides/RideOptions.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';
import SkeletonLoader from '../common/SkeletonLoader';

// Define prop types
interface RideOptionsProps {
  isLoading: boolean;
  rideOptions: any[];
  selectedRideOption: any;
  estimatedArrival: string;
  estimatedPrice: string;
  driversNearby: number;
  onSelectOption: (option: any) => void;
}

const RideOptions = ({
  isLoading,
  rideOptions,
  selectedRideOption,
  estimatedArrival,
  estimatedPrice,
  driversNearby,
  onSelectOption,
}: RideOptionsProps) => {
  // Render skeleton loaders while loading
  if (isLoading) {
    // Use actual ride options to create more realistic skeletons
    return (
      <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            className={`flex-row items-center p-4 mb-2 rounded-lg ${
              i === 0 ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
            }`}
          >
            {/* Vehicle icon skeleton */}
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
              <SkeletonLoader width={24} height={24} borderRadius={12} />
            </View>

            {/* Text content skeleton */}
            <View className="flex-1">
              {/* Ride name - vary width based on index */}
              <SkeletonLoader
                width={i === 0 ? 130 : i === 1 ? 80 : 110}
                height={18}
                style={{ marginBottom: 8 }}
              />

              {/* Info row with clock icon placeholder */}
              <View className="flex-row items-center">
                <View className="w-4 h-4 mr-1">
                  <SkeletonLoader width={14} height={14} borderRadius={7} />
                </View>
                <SkeletonLoader width={50} height={14} style={{ marginRight: 8 }} />
                <SkeletonLoader width={60} height={14} />
              </View>
            </View>

            {/* Price skeleton */}
            <SkeletonLoader width={55} height={20} borderRadius={4} />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
      {rideOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          className={`flex-row items-center p-4 mb-2 rounded-lg ${
            selectedRideOption.id === option.id
              ? "bg-blue-50 border border-blue-200"
              : "bg-gray-50"
          }`}
          onPress={() => onSelectOption(option)}
        >
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
            {option.id === "okada" ? (
              <Image
                source={require("../../assets/rickshaw.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ) : option.id === "taxi" ? (
              <Image
                source={require("../../assets/taxi.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require("../../assets/premium-car.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            )}
          </View>
          <View className="flex-1">
            <Text className="font-bold text-base mb-1">{option.name}</Text>
            <View className="flex-row items-center">
              <Clock size={14} color="#777" className="mr-1" />
              <Text className="text-gray-500 text-sm mr-2">
                {option.id === selectedRideOption.id
                  ? estimatedArrival
                  : `${option.baseEta}-${option.baseEta + 3} min`}
              </Text>
              {driversNearby > 0 && (
                <Text className="text-gray-500 text-sm">
                  •{" "}
                  {option.id === "okada"
                    ? driversNearby
                    : Math.max(1, Math.floor(driversNearby / 2))}{" "}
                  nearby
                </Text>
              )}
            </View>
          </View>
          <Text className="font-bold text-base">
            {option.id === selectedRideOption.id
              ? estimatedPrice
              : `₵${option.basePrice}-${option.basePrice + 10}`}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default RideOptions;