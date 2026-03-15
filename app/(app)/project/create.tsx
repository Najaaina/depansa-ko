import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { projectService } from "@/services/project.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";

const COLORS = [
  "#4f46e5", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

export default function CreateProjectScreen() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [initialBudget, setInitialBudget] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!user?.id) return;
    if (!name.trim()) { Alert.alert("Error", "Project name is required"); return; }
    const budget = parseFloat(initialBudget);
    if (isNaN(budget) || budget <= 0) { Alert.alert("Error", "Please enter a valid initial budget"); return; }

    setIsLoading(true);
    try {
      await projectService.create(user.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        initialBudget: budget,
        color,
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Input label="Project Name" value={name} onChangeText={setName} placeholder="e.g. House Renovation" />
        <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Brief description of the project" />
        <Input label="Initial Budget" value={initialBudget} onChangeText={setInitialBudget} placeholder="0" keyboardType="decimal-pad" />

        <Text className="text-sm font-semibold text-gray-700 mt-4 mb-2">Colour</Text>
        <View className="flex-row flex-wrap gap-3">
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              className="w-11 h-11 rounded-full justify-center items-center"
              style={{ backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: "#fff", elevation: color === c ? 4 : 0 }}
              onPress={() => setColor(c)}
            >
              {color === c && <Ionicons name="checkmark" size={18} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>

        <Button title={isLoading ? "Creating..." : "Create Project"} onPress={handleCreate} disabled={isLoading} className="mt-6" />
      </View>
    </ScrollView>
  );
}