import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { authService } from "@/services/auth.service";
import { useFormValidation } from "@/hooks/useFormValidation";
import { resetPasswordSchema } from "@/schemas/auth.schemas";
import Svg, { Path, Circle } from "react-native-svg";
import ResetIcon from "@/components/icons/ResetIcon";
import PersonIcon from "@/components/icons/PersonIcon";
import LockIcon from "@/components/icons/LookIcon";
import EyeIcon from "@/components/icons/EyeIcon";
import { ShieldIcon } from "lucide-react-native";
import getPasswordStrength from "@/components/utils/PasswordStrength";

// ── Password strength ─────────────────────────────────────────────────────────



export default function ResetPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { fields, setFieldValue, setFieldTouched, validateForm, isFormValid, getValues } =
    useFormValidation({
      schema: resetPasswordSchema,
      initialValues: { username: "", oldPassword: "", newPassword: "", confirmPassword: "" },
    });

  const newPasswordValue = fields.newPassword?.value || "";
  const strength = getPasswordStrength(newPasswordValue);

  const strengthColors = ["#e5e7eb", "#ef4444", "#f59e0b", "#6d28d9", "#059669"];
  const activeColor = strengthColors[strength.level];

  const handleReset = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly");
      return;
    }
    setIsLoading(true);
    try {
      const values = getValues();
      await authService.resetPassword(
        values.username || "",
        values.oldPassword || "",
        values.newPassword || ""
      );
      Alert.alert("Success", "Password updated successfully!", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#f0eeff", "#f7f5ff", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <ResetIcon />
          </View>

          {/* Header */}
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your details below to secure your{"\n"}finance tracking account.
          </Text>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={[styles.inputRow, fields.username?.touched && fields.username?.error ? styles.inputError : null]}>
              <PersonIcon />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#d1d5db"
                autoCapitalize="none"
                value={fields.username?.value || ""}
                onChangeText={(v) => setFieldValue("username", v)}
                onBlur={() => setFieldTouched("username")}
              />
            </View>
            {fields.username?.touched && fields.username?.error ? (
              <Text style={styles.errorText}>{fields.username.error}</Text>
            ) : null}
          </View>

          {/* Current Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View style={[styles.inputRow, fields.oldPassword?.touched && fields.oldPassword?.error ? styles.inputError : null]}>
              <LockIcon />
              <TextInput
                style={styles.input}
                placeholder="Current password"
                placeholderTextColor="#d1d5db"
                secureTextEntry={!showOldPassword}
                value={fields.oldPassword?.value || ""}
                onChangeText={(v) => setFieldValue("oldPassword", v)}
                onBlur={() => setFieldTouched("oldPassword")}
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                <EyeIcon visible={showOldPassword} />
              </TouchableOpacity>
            </View>
            {fields.oldPassword?.touched && fields.oldPassword?.error ? (
              <Text style={styles.errorText}>{fields.oldPassword.error}</Text>
            ) : null}
          </View>

          {/* New Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={[styles.inputRow, fields.newPassword?.touched && fields.newPassword?.error ? styles.inputError : null]}>
              <ShieldIcon />
              <TextInput
                style={styles.input}
                placeholder="New strong password"
                placeholderTextColor="#d1d5db"
                secureTextEntry={!showNewPassword}
                value={newPasswordValue}
                onChangeText={(v) => setFieldValue("newPassword", v)}
                onBlur={() => setFieldTouched("newPassword")}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <EyeIcon visible={showNewPassword} />
              </TouchableOpacity>
            </View>

            {/* Password strength bar */}
            {newPasswordValue.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i <= strength.level ? activeColor : "#e5e7eb" },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: activeColor }]}>
                  Password strength: {strength.label}
                </Text>
              </View>
            )}

            {fields.newPassword?.touched && fields.newPassword?.error ? (
              <Text style={styles.errorText}>{fields.newPassword.error}</Text>
            ) : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <View style={[styles.inputRow, fields.confirmPassword?.touched && fields.confirmPassword?.error ? styles.inputError : null]}>
              <ShieldIcon />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#d1d5db"
                secureTextEntry
                value={fields.confirmPassword?.value || ""}
                onChangeText={(v) => setFieldValue("confirmPassword", v)}
                onBlur={() => setFieldTouched("confirmPassword")}
              />
            </View>
            {fields.confirmPassword?.touched && fields.confirmPassword?.error ? (
              <Text style={styles.errorText}>{fields.confirmPassword.error}</Text>
            ) : null}
          </View>

          <View style={styles.spacer} />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={isLoading || !isFormValid()}
            activeOpacity={0.85}
            style={[styles.btnWrapper, (!isFormValid() || isLoading) && styles.btnDisabled]}
          >
            <LinearGradient
              colors={["#7c3aed", "#6d28d9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>
                {isLoading ? "Updating..." : "Update Password  →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 40,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f9f8ff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "#ede9fe",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 5,
    marginLeft: 4,
  },
  strengthContainer: {
    marginTop: 10,
    gap: 6,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  spacer: { flex: 1, minHeight: 24 },
  btnWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.5 },
  btn: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  supportRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  supportText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  supportLink: {
    fontSize: 13,
    color: "#7c3aed",
    fontWeight: "600",
  },
});