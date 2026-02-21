import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  touched?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Input: React.FC<CustomInputProps> = ({
  label,
  error,
  touched,
  icon,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const showError = touched && error;

  return (
    <View className="mb-5">
      <Text className="text-sm font-semibold text-gray-800 mb-2">{label}</Text>
      <View
        className={`flex-row items-center bg-gray-50 rounded-xl border ${showError ? "border-red-500" : "border-gray-200"}`}
      >
        {icon && (
          <Ionicons name={icon} size={20} color="#666" className="ml-4" />
        )}
        <TextInput
          className="flex-1 h-12 px-4 text-base text-gray-800"
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="p-4"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
      {showError && (
        <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
};
