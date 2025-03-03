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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../navigation/types';
import { ROUTES } from '../../constants/routes';
import { apiService } from '../../utils/api';
import { ENDPOINTS } from '../../constants/api';

const RegisterScreen = () => {
  // State for form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'rider' | 'driver'>('rider');
  const [isLoading, setIsLoading] = useState(false);

  // Get navigation
  const navigation = useNavigation<AuthStackNavigationProp>();

  // Handle register
  const handleRegister = async () => {
    // Validate inputs
    if (!name || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Format phone number (you may need to adjust this based on Ghana's format)
    const formattedPhone = phone.startsWith('+233') ? phone : `+233${phone.replace(/^0/, '')}`;

    setIsLoading(true);

    try {
      // Call register API
      await apiService.post(ENDPOINTS.REGISTER, {
        username: name.replace(/\s+/g, '_').toLowerCase(), // Create username from name
        phone_number: formattedPhone,
        email: email || undefined, // Make email optional
        password: password,
        password2: confirmPassword,
        user_type: userType,
      });

      // Show success message
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in.',
        [{ text: 'OK', onPress: () => navigation.navigate(ROUTES.LOGIN) }]
      );
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with an error
        Alert.alert('Registration Failed', error.response.data.message || 'Unable to create account');
      } else if (error.request) {
        // No response received
        Alert.alert('Network Error', 'Please check your internet connection');
      } else {
        // Something else happened
        Alert.alert('Error', 'An unexpected error occurred');
      }
      console.error('Registration error:', error);
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
        <ScrollView className="flex-1 bg-white">
          <SafeAreaView className="flex-1 px-5">
            {/* Header */}
            <View className="items-center my-6">
              <Text className="text-xl font-bold text-gray-800">Create Account</Text>
              <Text className="text-gray-500 text-center mt-2">
                Sign up to start using Okada ride services
              </Text>
            </View>

            {/* Register Form */}
            <View className="mt-2">
              {/* Full Name */}
              <Text className="text-gray-700 mb-2 ml-1">Full Name</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-4"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />

              {/* Phone Input */}
              <Text className="text-gray-700 mb-2 ml-1">Phone Number</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-4"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!isLoading}
              />

              {/* Email (Optional) */}
              <Text className="text-gray-700 mb-2 ml-1">Email (Optional)</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-4"
                placeholder="Enter your email address"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                autoCapitalize="none"
              />

              {/* Password */}
              <Text className="text-gray-700 mb-2 ml-1">Password</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-4"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />

              {/* Confirm Password */}
              <Text className="text-gray-700 mb-2 ml-1">Confirm Password</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-4"
                placeholder="Confirm your password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />

              {/* User Type Selection */}
              <View className="flex-row justify-between mb-6">
                <TouchableOpacity
                  className={`flex-1 py-3 mx-1 rounded-lg items-center ${
                    userType === 'rider' ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setUserType('rider')}
                  disabled={isLoading}
                >
                  <Text
                    className={`font-bold ${
                      userType === 'rider' ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    I'm a Rider
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3 mx-1 rounded-lg items-center ${
                    userType === 'driver' ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onPress={() => setUserType('driver')}
                  disabled={isLoading}
                >
                  <Text
                    className={`font-bold ${
                      userType === 'driver' ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    I'm a Driver
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                className={`py-3 rounded-lg items-center ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">REGISTER</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6 mb-4">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
                <Text className="text-primary font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;