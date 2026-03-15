import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { projectService } from "@/services/project.service";
import { settingsService } from "@/services/settings.service";
import type { Project } from "@/types/project.types";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

export default function ProjectListScreen() {
  const { user } = useAuth();
  const { convertAndFormat: formatAmount } = useCurrency();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      await settingsService.initialize();
      const plan = settingsService.getSettings().subscription;
      setIsPremium(plan === "premium");

      if (plan === "premium") {
        const data = await projectService.getAll(user.id);
        setProjects(Array.isArray(data) ? data.filter(p => !p.isArchived) : []);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { fetchProjects(); }, [fetchProjects]));

  const onRefresh = () => { setRefreshing(true); fetchProjects(); };

  if (!isPremium) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-8">
        <Ionicons name="star-outline" size={64} color="#d1d5db" />
        <Text className="text-xl font-bold text-gray-800 mt-4">Premium Feature</Text>
        <Text className="text-sm text-gray-500 text-center mt-2 leading-5">
          Project budget management is only available to Premium subscribers.
        </Text>
        <Button title="Upgrade to Premium" onPress={() => router.push("/subscription")} className="mt-6" />
      </View>
    );
  }

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border-l-4"
      style={{ borderLeftColor: item.color || "#4f46e5" }}
      onPress={() => router.push(`/project/${item.id}`)}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-xl justify-center items-center mr-3"
          style={{ backgroundColor: item.color || "#4f46e5" }}
        >
          <Ionicons name="folder-outline" size={20} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
          {item.description && (
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>{item.description}</Text>
          )}
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-400">Budget</Text>
          <Text className="text-sm font-bold text-indigo-600">{formatAmount(item.initialBudget)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="mb-4">
      <Button title="New Project" onPress={() => router.push("/project/create")} />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
      <Text className="text-xl font-semibold text-gray-700 mt-4">No Projects Yet</Text>
      <Text className="text-sm text-gray-500 text-center mt-2">Create your first project to start tracking its budget.</Text>
      <Button title="New Project" onPress={() => router.push("/project/create")} className="mt-4" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}