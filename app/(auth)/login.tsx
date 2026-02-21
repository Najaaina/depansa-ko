import React, { useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/schemas/auth.schemas";

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();

  const {
    fields,
    setFieldValue,
    setFieldTouched,
    validateForm,
    isFormValid,
    getValues,
  } = useFormValidation({
    schema: loginSchema,
    initialValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
    // Validate all fields and show errors
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly");
      return;
    }

    try {
      const values = getValues();
      await login({
        username: values.username || "",
        password: values.password || "",
      });
    } catch (err) {
      // Error is handled in the AuthContext and displayed via Alert
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-gray-800 mb-2">
            Welcome Back
          </Text>
          <Text className="text-base text-gray-500">
            Sign in to continue to track your Depansa
          </Text>
        </View>

        <View className="w-full">
          <Input
            label="Username"
            placeholder="Enter your username"
            value={fields.username?.value || ""}
            onChangeText={(value) => setFieldValue("username", value)}
            onBlur={() => setFieldTouched("username")}
            error={fields.username?.error}
            touched={fields.username?.touched}
            icon="person-outline"
            autoCapitalize="none"
            autoComplete="username"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={fields.password?.value || ""}
            onChangeText={(value) => setFieldValue("password", value)}
            onBlur={() => setFieldTouched("password")}
            error={fields.password?.error}
            touched={fields.password?.touched}
            icon="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            disabled={!isFormValid()}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-gray-500">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="text-sm text-indigo-500 font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
