// src/components/SearchInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  isLoading?: boolean;
  isOfflineMode?: boolean;
  debounceDelay?: number;
  disabled?: boolean;
}

/**
 * Performance-optimized search input with debounce capability
 */
const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value,
  onChangeText,
  onClear,
  autoFocus = false,
  isLoading = false,
  isOfflineMode = false,
  debounceDelay = 300,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update internal value when value prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Auto focus the input when the component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Handle text changes with debounce
  const handleTextChange = (text: string) => {
    setInternalValue(text);

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      onChangeText(text);
    }, debounceDelay);
  };

  // Clear the search input
  const handleClear = () => {
    setInternalValue('');
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-1">
      <Search size={20} color="#777" />

      <TextInput
        ref={inputRef}
        className="flex-1 py-2 px-2 text-base"
        placeholder={placeholder}
        placeholderTextColor="#777"
        value={internalValue}
        onChangeText={handleTextChange}
        autoCapitalize="none"
        returnKeyType="search"
        editable={!disabled}
        style={{ color: '#333' }}
      />

      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      ) : internalValue.length > 0 ? (
        <TouchableOpacity onPress={handleClear}>
          <X size={18} color="#777" />
        </TouchableOpacity>
      ) : isOfflineMode ? (
        <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
          <Text className="text-yellow-800 text-xs">Offline</Text>
        </View>
      ) : null}
    </View>
  );
};

export default SearchInput;