import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import Svg, { Path, G } from "react-native-svg";

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <G>
        <Path
          fill="#4285F4"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"
        />
        <Path
          fill="#34A853"
          d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <Path
          fill="#FBBC05"
          d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
        />
        <Path
          fill="#EA4335"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C42 35.8 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"
        />
      </G>
    </Svg>
  );
}

export function GoogleButton({
  onPress,
  disabled,
  loading,
  label = "Continue with Google",
}: GoogleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className="flex-row items-center justify-center border border-gray-200 rounded-2xl py-3.5 px-4 gap-3 bg-white mt-3"
      style={{ opacity: disabled || loading ? 0.6 : 1 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <GoogleIcon />
      )}
      <Text className="text-gray-700 font-semibold text-sm">{label}</Text>
    </TouchableOpacity>
  );
}