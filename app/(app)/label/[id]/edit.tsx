import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Input } from "@/components/ui/Input";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { Label, LabelType, UpdateLabel } from "@/types/lablel.types";
import { creationLabelSchema } from "@/schemas/label.schemas";
import { labelService } from "@/services/label.service";

const LABEL_ICONS: { value: LabelType; icon: string }[] = [
  { value: "WORK", icon: "briefcase" },
  { value: "SCHOOL", icon: "school" },
  { value: "FOOD", icon: "fast-food" },
  { value: "TRANSPORT", icon: "bus" },
  { value: "SHOPPING", icon: "cart" },
  { value: "HEALTH", icon: "medkit-sharp" },
  { value: "ENTERTAINEMENT", icon: "extension-puzzle" },
  { value: "MISC", icon: "star" },
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

export default function EditLabelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [label, setLabel] = useState<Label | null>(null);
  const [selectedType, setSelectedType] = useState<LabelType>("MISC");
  const [selectedColor, setSelectedColor] = useState("#00ff00");

  const {
    fields,
    setFieldValue,
    setFieldTouched,
    validateForm,
    isFormValid,
    getValues,
  } = useFormValidation({
    schema: creationLabelSchema,
    initialValues: {
      name: "",
      iconRef: "MISC",
      color: "#00ff00",
    },
  });

  useEffect(() => {
    fetchLabel();
  }, [id, user?.id]);

  const fetchLabel = async () => {
    if (!user?.id || !id) return;

    try {
      const data = await labelService.getOne(user.id, id);
      setLabel(data);
      setSelectedType(data.iconRef as any);
      setSelectedColor(data.color || "#00ff00");
      setFieldValue("name", data.name);
      setFieldValue("iconRef", data.iconRef);
      setFieldValue("color", data.color || "#00ff00");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load label");
      router.back();
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateWallet = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly");
      return;
    }

    if (!user?.id || !id || !label) {
      Alert.alert("Error", "User not authenticated or wallet not loaded");
      return;
    }

    try {
      setIsLoading(true);
      const values = getValues();

      const labelData: UpdateLabel = {
        id: id,
        accountId: user.id,
        name: values.name || "",
        color: selectedColor,
        iconRef: values.iconRef || "MISC",
      };

      await labelService.update(user.id, labelData);

      Alert.alert("Success", "Label updated successfully!", [
        { text: "OK", onPress: () => router.push("/label") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update label");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = (type: LabelType) => {
    setSelectedType(type);
    setFieldValue("iconRef", type);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setFieldValue("color", color);
  };

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

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
            Edit Wallet
          </Text>
          <Text className="text-base text-gray-500">Update label details</Text>
        </View>

        <View className="w-full">
          <Input
            label="Label Name"
            placeholder="e.g., Work, Food"
            value={fields.name?.value || ""}
            onChangeText={(value) => setFieldValue("name", value)}
            onBlur={() => setFieldTouched("name")}
            error={fields.name?.error}
            touched={fields.name?.touched}
            icon="pricetag"
          />

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-3">
              Label icon
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {LABEL_ICONS.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`flex-1 min-w-[20%] p-4 flex-row item-center justify-center rounded-xl border-2 ${
                    selectedType === type.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onPress={() => handleTypeSelect(type.value)}
                >
                  <Ionicons name={type.icon as any} size={16} color="#666666" />
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
              title="Save Changes"
              onPress={handleUpdateWallet}
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
