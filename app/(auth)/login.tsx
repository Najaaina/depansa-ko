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
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { loginSchema } from "@/schemas/auth.schemas";

export default function LoginScreen() {
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuth();

  const handlePress = async () => {
  console.log("Launching Google auth...");
  const result = await promptAsync();
  console.log("promptAsync result:", JSON.stringify(result));
};

  const {
    fields,
    setFieldValue,
    setFieldTouched,
    validateForm,
    isFormValid,
    getValues,
  } = useFormValidation({
    schema: loginSchema,
    initialValues: { username: "", password: "" },
  });

  const { request, promptAsync, isLoading: googleLoading } = useGoogleAuth(
    (user) => loginWithGoogle(user),
    (message) => Alert.alert("Google Error", message)
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
      clearError();
    }
  }, [error]);

  const handleLogin = async () => {
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
      // Handled in AuthContext
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-start p-6 mt-16"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex items-start mb-10 text-left h-[12vh] gap-2">
          <Text className="w-full text-5xl font-bold text-gray-800">
            Hellooo :>
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

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <GoogleButton
            onPress={() => promptAsync()}
            disabled={!request}
            loading={googleLoading}
            label="Continue with Google"
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