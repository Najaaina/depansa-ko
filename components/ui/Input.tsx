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
    <View className="mb-6">
      {/* LABEL */}
      <Text className="text-sm font-semibold text-slate-700 mb-2 tracking-wide">
        {label}
      </Text>

      {/* INPUT CONTAINER */}
      <View
        className={`
          flex-row items-center
          bg-slate-100
          rounded-2xl
          border
          px-3
          ${showError ? "border-red-500" : "border-slate-200"}
        `}
      >
        {/* ICON */}
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color="#64748B"
            style={{ marginRight: 8 }}
          />
        )}

        {/* TEXT INPUT */}
        <TextInput
          className="flex-1 h-14 text-base text-slate-800"
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {/* PASSWORD TOGGLE */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="p-2"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ERROR */}
      {showError && (
        <Text className="text-xs text-red-500 mt-2 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};