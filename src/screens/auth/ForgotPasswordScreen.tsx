import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../navigation/types';
import { ROUTES } from '../../constants/routes';
import { apiService } from '../../utils/api';
import { ENDPOINTS } from '../../constants/api';

const ForgotPasswordScreen = () => {
  // State for form inputs
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Get navigation
  const navigation = useNavigation<AuthStackNavigationProp>();

  // Handle reset password
  const handleResetPassword = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Format phone number (you may need to adjust this based on Ghana's format)
    const formattedPhone = phone.startsWith('+233') ? phone : `+233${phone.replace(/^0/, '')}`;

    setIsLoading(true);

    try {
      // This endpoint is not defined yet, adjust as needed
      await apiService.post('/api/auth/reset-password/', {
        phone: formattedPhone,
      });

      // Show success message
      setResetSent(true);
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with an error
        Alert.alert('Error', error.response.data.message || 'Failed to send reset instructions');
      } else if (error.request) {
        // No response received
        Alert.alert('Network Error', 'Please check your internet connection');
      } else {
        // Something else happened
        Alert.alert('Error', 'An unexpected error occurred');
      }
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-white px-5">
          {/* Header */}
          <View className="items-center mt-8 mb-6">
            <Text className="text-xl font-bold text-gray-800">Forgot Password</Text>
            <Text className="text-gray-500 text-center mt-2">
              Enter your phone number to receive password reset instructions
            </Text>
          </View>

          {resetSent ? (
            // Success Message
            <View className="items-center mt-4">
              <View className="w-16 h-16 rounded-full bg-success items-center justify-center mb-4">
                <Text className="text-white text-2xl">✓</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-2">Check Your Phone</Text>
              <Text className="text-gray-600 text-center mb-6">
                We've sent instructions to reset your password to {phone}
              </Text>
              <TouchableOpacity
                className="bg-primary py-3 px-6 rounded-lg"
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
              >
                <Text className="text-white font-bold">BACK TO LOGIN</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Reset Form
            <View>
              {/* Phone Input */}
              <Text className="text-gray-700 mb-2 ml-1">Phone Number</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-6"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!isLoading}
              />

              {/* Submit Button */}
              <TouchableOpacity
                className={`py-3 rounded-lg items-center ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">SEND RESET INSTRUCTIONS</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity
                className="mt-6 items-center"
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
                disabled={isLoading}
              >
                <Text className="text-primary font-bold">BACK TO LOGIN</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;