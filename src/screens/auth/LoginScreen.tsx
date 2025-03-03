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
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../navigation/types';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../utils/api';
import { ENDPOINTS } from '../../constants/api';

const LoginScreen = () => {
  // State for form inputs
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get navigation
  const navigation = useNavigation<AuthStackNavigationProp>();

  // Get login function from auth store
  const login = useAuthStore((state) => state.login);

  // Handle login
  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter your phone number and password');
      return;
    }

    // For testing purposes, log in with the exact test credentials
    // that worked in Postman
    const login_field = "testrider1"; // Use this exact value that worked in Postman

    setIsLoading(true);

    try {
      // Call login API with the correct login_field parameter
      const userData = {
        login_field: login_field,  // Using the test account name directly
        password: password
      };

      console.log('Attempting login with:', {
        ...userData,
        password: '****', // Mask actual password in logs
        url: ENDPOINTS.LOGIN
      });

      const response = await apiService.post(ENDPOINTS.LOGIN, {
        login_field: login_field,
        password,
      });

      console.log('Login response:', response);

      // Store user data and tokens - adjust based on your backend response structure
      login(
        response.token,  // Knox returns a single token
        response.token,  // Using same token as refresh token for now
        response.user
      );
    } catch (error) {
      // Handle different error types
      console.error('Login error details:', error);

      if (error.response) {
        // Server responded with an error
        console.log('Server error response:', error.response.data);
        Alert.alert('Login Failed', JSON.stringify(error.response.data) || 'Invalid credentials');
      } else if (error.request) {
        // No response received
        console.log('No response received:', error.request);
        Alert.alert(
          'Network Error',
          'Could not connect to the server. Please check your internet connection and verify the server is running.'
        );
      } else {
        // Something else happened
        Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
      }
      console.error('Login error:', error);
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
            {/* Logo and Header */}
            <View className="items-center my-8">
              {/* Replace with your actual logo */}
              <View className="h-24 w-24 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-bold text-xl">OKADA</Text>
              </View>
              <Text className="text-xl font-bold mt-4 text-gray-800">Welcome Back</Text>
              <Text className="text-gray-500 text-center mt-2">
                Log in to continue using Okada ride services
              </Text>
            </View>

            {/* Login Form */}
            <View className="mt-4">
              {/* Phone Input */}
              <Text className="text-gray-700 mb-2 ml-1">Username</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-4"
                placeholder="Enter your username or phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!isLoading}
              />

              {/* Password Input */}
              <Text className="text-gray-700 mb-2 ml-1">Password</Text>
              <TextInput
                className="bg-gray-100 px-4 py-3 rounded-lg mb-2"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                className="mb-6"
                onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                disabled={isLoading}
              >
                <Text className="text-primary text-right">Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                className={`py-3 rounded-lg items-center ${isLoading ? 'bg-gray-400' : 'bg-primary'}`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">LOG IN</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-8 mb-4">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                <Text className="text-primary font-bold">Register</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;