import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { walletService } from "@/services/wallet.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { creationWalletSchema, walletTypeSchema } from "@/schemas/wallet.schemas";
import type { WalletType, CreationWallet } from "@/types/wallet.types";

const WALLET_TYPES: { value: WalletType; label: string; icon: string }[] = [
  { value: "CASH", label: "Cash", icon: "cash-outline" },
  { value: "MOBILE_MONEY", label: "Mobile Money", icon: "phone-portrait-outline" },
  { value: "BANK", label: "Bank", icon: "card-outline" },
  { value: "DEBT", label: "Debt", icon: "alert-circle-outline" },
];

const COLORS = [
  "#00ff00",
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
];

export default function CreateWalletScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<WalletType>("CASH");
  const [selectedColor, setSelectedColor] = useState("#00ff00");

  const {
    fields,
    setFieldValue,
    setFieldTouched,
    validateForm,
    isFormValid,
    getValues,
  } = useFormValidation({
    schema: creationWalletSchema,
    initialValues: {
      name: "",
      description: "",
      type: "CASH",
      color: "#00ff00",
    },
  });

  const handleCreateWallet = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      const values = getValues();
      
      const walletData: CreationWallet = {
        name: values.name || "",
        description: values.description || undefined,
        type: selectedType,
        color: selectedColor,
      };

      await walletService.create(user.id, walletData);
      
      Alert.alert("Success", "Wallet created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = (type: WalletType) => {
    setSelectedType(type);
    setFieldValue("type", type);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setFieldValue("color", color);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Create Wallet
          </Text>
          <Text className="text-base text-gray-500">
            Add a new wallet to track your finances
          </Text>
        </View>

        <View className="w-full">
          <Input
            label="Wallet Name"
            placeholder="e.g., Personal, Business"
            value={fields.name?.value || ""}
            onChangeText={(value) => setFieldValue("name", value)}
            onBlur={() => setFieldTouched("name")}
            error={fields.name?.error}
            touched={fields.name?.touched}
            icon="wallet-outline"
          />

          <Input
            label="Description (optional)"
            placeholder="Add a description"
            value={fields.description?.value || ""}
            onChangeText={(value) => setFieldValue("description", value)}
            onBlur={() => setFieldTouched("description")}
            error={fields.description?.error}
            touched={fields.description?.touched}
            icon="document-text-outline"
            multiline
          />

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-3">
              Wallet Type
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {WALLET_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`flex-1 min-w-[45%] p-4 rounded-xl border-2 ${
                    selectedType === type.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onPress={() => handleTypeSelect(type.value)}
                >
                  <Text
                    className={`text-center font-medium ${
                      selectedType === type.value
                        ? "text-indigo-600"
                        : "text-gray-600"
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-3">
              Wallet Color
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-12 h-12 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-gray-800 scale-110"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </View>
          </View>

          <View className="flex-row gap-3 mt-6">
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              className="flex-1"
            />
            <Button
              title="Create Wallet"
              onPress={handleCreateWallet}
              loading={isLoading}
              disabled={!isFormValid()}
              className="flex-1"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
