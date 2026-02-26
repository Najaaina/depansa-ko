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
import { registerSchema } from "@/schemas/auth.schemas";

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();

  const {
    fields,
    setFieldValue,
    setFieldTouched,
    validateForm,
    isFormValid,
    getValues,
  } = useFormValidation({
    schema: registerSchema,
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Registration Error", error);
      clearError();
    }
  }, [error]);

  const handleRegister = async () => {
    // Validate all fields and show errors
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly");
      return;
    }

    try {
      const values = getValues();
      await register({
        username: values.username || "",
        password: values.password || "",
      });
      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please log in.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
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
        <View className="mb-10">
          <Text className="text-4xl font-bold text-gray-800 mb-2">
            Create Account
          </Text>
          <Text className="text-base text-gray-500">
            Sign up to get started with Depansa
          </Text>
        </View>

        <View className="w-full">
          <Input
            label="Username"
            placeholder="Choose a username"
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
            label="Email"
            placeholder="Enter your email"
            value={fields.email?.value || ""}
            onChangeText={(value) => setFieldValue("email", value)}
            onBlur={() => setFieldTouched("email")}
            error={fields.email?.error}
            touched={fields.email?.touched}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={fields.password?.value || ""}
            onChangeText={(value) => setFieldValue("password", value)}
            onBlur={() => setFieldTouched("password")}
            error={fields.password?.error}
            touched={fields.password?.touched}
            icon="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={fields.confirmPassword?.value || ""}
            onChangeText={(value) => setFieldValue("confirmPassword", value)}
            onBlur={() => setFieldTouched("confirmPassword")}
            error={fields.confirmPassword?.error}
            touched={fields.confirmPassword?.touched}
            icon="lock-closed-outline"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={!isFormValid()}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-sm text-gray-500">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-sm text-indigo-500 font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
