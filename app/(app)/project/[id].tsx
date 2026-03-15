import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { projectService } from "@/services/project.service";
import type { Project, ProjectTransaction } from "@/types/project.types";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { convertAndFormat: formatAmount } = useCurrency();
  const [project, setProject] = useState<Project | null>(null);
  const [transactions, setTransactions] = useState<ProjectTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id || !id) return;
    try {
      const [projectData, txData] = await Promise.all([
        projectService.getOne(user.id, id),
        projectService.getAllTransactions(user.id, id),
      ]);
      setProject(projectData);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load project");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleArchive = () => {
    Alert.alert("Archive Project", "Are you sure you want to archive this project?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive", style: "destructive",
        onPress: async () => {
          if (!user?.id || !id) return;
          try {
            await projectService.archive(user.id, id);
            Alert.alert("Success", "Project archived", [{ text: "OK", onPress: () => router.back() }]);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to archive project");
          }
        },
      },
    ]);
  };

  if (isLoading || !project) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  const totalEstimated = transactions.reduce((sum, t) => sum + (t.estimatedCost || 0), 0);
  const totalReal = transactions.reduce((sum, t) => sum + (t.realCost || 0), 0);
  const remaining = project.initialBudget - totalReal;
  const budgetUsedPercent = Math.min((totalReal / project.initialBudget) * 100, 100);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="items-center p-6" style={{ backgroundColor: project.color || "#4f46e5" }}>
        <View className="w-16 h-16 rounded-2xl justify-center items-center mb-3" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <Ionicons name="folder-outline" size={32} color="#fff" />
        </View>
        <Text className="text-2xl font-bold text-white">{project.name}</Text>
        {project.description && <Text className="text-sm text-white/80 mt-1 text-center">{project.description}</Text>}
      </View>

      {/* Budget summary */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-5">
        <View className="flex-row">
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">Initial Budget</Text>
            <Text className="text-base font-bold text-gray-800">{formatAmount(project.initialBudget)}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">Estimated</Text>
            <Text className="text-base font-bold text-amber-500">{formatAmount(totalEstimated)}</Text>
          </View>
        </View>
        <View className="h-px bg-gray-100 my-4" />
        <View className="flex-row">
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">Real Cost</Text>
            <Text className="text-base font-bold text-red-500">{formatAmount(totalReal)}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-500 mb-1">Remaining</Text>
            <Text className={`text-base font-bold ${remaining >= 0 ? "text-emerald-500" : "text-red-500"}`}>{formatAmount(remaining)}</Text>
          </View>
        </View>
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
          <View
            className="h-full rounded-full"
            style={{ width: `${budgetUsedPercent}%`, backgroundColor: remaining >= 0 ? "#10b981" : "#ef4444" }}
          />
        </View>
        <Text className="text-xs text-gray-400 text-right mt-1">{budgetUsedPercent.toFixed(1)}% of budget used</Text>
      </View>

      {/* Actions */}
      <View className="flex-row px-4 gap-3 mt-3">
        <Button title="Add Transaction" onPress={() => router.push(`/project/${id}/add-transaction`)} className="flex-1" />
      </View>
      <View className="flex-row px-4 gap-3 mt-3">
        <Button title="Statistics" onPress={() => router.push(`/project/${id}/statistics`)} variant="outline" className="flex-1" />
        <Button title="PDF" onPress={() => router.push(`/project/${id}/pdf`)} variant="outline" className="flex-1" />
      </View>
      <View className="flex-row px-4 gap-3 mt-3">
        <Button title="Edit" onPress={() => router.push(`/project/${id}/edit`)} variant="outline" className="flex-1" />
        <Button title="Archive" onPress={handleArchive} variant="outline" className="flex-1" />
      </View>

      {/* Transactions */}
      <View className="bg-white mx-4 mt-4 mb-8 rounded-2xl p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Transactions</Text>
        {transactions.length === 0 ? (
          <View className="items-center py-6">
            <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
            <Text className="text-sm text-gray-400 mt-2">No transactions yet</Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <TouchableOpacity
              key={tx.id}
              className="flex-row justify-between items-center py-3 border-b border-gray-100"
              onPress={() => router.push(`/project/${id}/edit-transaction?transactionId=${tx.id}`)}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-xl bg-indigo-100 justify-center items-center">
                  <Ionicons name="receipt-outline" size={16} color="#4f46e5" />
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-800">{tx.name}</Text>
                  {tx.description && <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>{tx.description}</Text>}
                </View>
              </View>
              <View className="items-end">
                <Text className="text-sm font-medium text-amber-500">est. {formatAmount(tx.estimatedCost)}</Text>
                {tx.realCost
                  ? <Text className="text-xs text-red-400 mt-0.5">real {formatAmount(tx.realCost)}</Text>
                  : <Text className="text-xs text-gray-300 mt-0.5">no real cost</Text>
                }
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}