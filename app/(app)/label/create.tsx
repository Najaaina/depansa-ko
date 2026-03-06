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
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { CreationLabel, LabelType } from "@/types/lablel.types";
import { Ionicons } from "@expo/vector-icons";
import { labelService } from "@/services/label.service";
import { creationLabelSchema } from "@/schemas/label.schemas";

const LABEL_ICONS: { value: LabelType;icon: string }[] = [
   {value:"WORK",icon: "briefcase"},
   {value:"SCHOOL",icon: "school"},
   {value:"FOOD",icon: "fast-food"},
   {value:"TRANSPORT",icon: "bus"},
   {value:"SHOPPING",icon:"cart"},
   {value:"HEALTH",icon:"medkit-sharp"},
   {value:"ENTERTAINEMENT",icon:"extension-puzzle"},
   {value:"MISC",icon: "star"}
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

export default function CreateLabelScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
      iconRef:"MISC",
      color: "#00ff00",
    },
  });

  const handleCreateLabel = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      return;
    }

    try {
      setIsLoading(true);
      const values = getValues();
      
      const labelData: CreationLabel = {
        name: values.name || "",
        iconRef: selectedType,
        color: selectedColor,
      };

      await labelService.create(user.id, labelData);
      
      Alert.alert("Success", "Lable created successfully!", [
        { text: "OK", onPress: () => router.replace("/label") },
      ]);
    } catch (error: any) {
      console.error("Create lable error:", error);
      if (error.status === 401 || error.status === 403) {
        Alert.alert("Error", "Session expired. Please login again.");
      } else {
        Alert.alert("Error", error.message || "Failed to create label");
      }
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
            Create Label
          </Text>
          <Text className="text-base text-gray-500">
            Add a new label to track your transactions
          </Text>
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
                    <Ionicons name={(type.icon) as any} size={16} color="#666666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-800 mb-3">
              Label Color
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

          <View className="flex-row gap-3 mt-36">
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              className="flex-1"
            />
            <Button
              title="Create Label"
              onPress={handleCreateLabel}
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
