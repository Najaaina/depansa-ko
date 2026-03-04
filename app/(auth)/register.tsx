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
import { registerSchema } from "@/schemas/auth.schemas";

export default function RegisterScreen() {
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuth();

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

  const { request, promptAsync, isLoading: googleLoading } = useGoogleAuth(
    (user) => {
      loginWithGoogle(user);
    },
    (message) => Alert.alert("Google Error", message)
  );

  useEffect(() => {
    if (error) {
      Alert.alert("Registration Error", error);
      clearError();
    }
  }, [error]);

  const handleRegister = async () => {
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
      // Handled in AuthContext
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
          <Text className="text-5xl font-bold text-slate-700 mb-2">
            Create Account
          </Text>
          <Text className="text-base text-slate-500">
            Join Depansa to manage your budget and future project.
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

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <GoogleButton
            onPress={() => promptAsync()}
            disabled={!request}
            loading={googleLoading}
            label="Sign up with Google"
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