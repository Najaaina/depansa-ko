import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { projectService } from "@/services/project.service";
import type { ProjectStatistics } from "@/types/project.types";
import { Ionicons } from "@expo/vector-icons";

export default function ProjectStatisticsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { convertAndFormat: formatAmount } = useCurrency();
  const [stats, setStats] = useState<ProjectStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id || !projectId) return;
      try {
        const data = await projectService.getStatistics(user.id, projectId);
        setStats(data);
      } catch (error: any) {
        console.error("Error loading statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id, projectId]);

  if (isLoading || !stats) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  const { project, totalEstimatedCost, totalRealCost, remainingBudget } = stats;
  const budgetUsedPercent = Math.min((totalRealCost / project.initialBudget) * 100, 100);
  const estimatedPercent = Math.min((totalEstimatedCost / project.initialBudget) * 100, 100);
  const isOverBudget = remainingBudget < 0;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="items-center p-6" style={{ backgroundColor: project.color || "#4f46e5" }}>
        <Text className="text-xl font-bold text-white">{project.name}</Text>
        <Text className="text-sm text-white/80 mt-1">Budget Analysis</Text>
      </View>

      {/* Key figures */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
        <Text className="text-base font-semibold text-gray-800 mb-4">Budget Overview</Text>
        <View className="flex-row">
          <View className="flex-1 items-center gap-1">
            <Ionicons name="wallet-outline" size={20} color="#4f46e5" />
            <Text className="text-xs text-gray-500 text-center">Initial Budget</Text>
            <Text className="text-sm font-bold text-gray-800 text-center">{formatAmount(project.initialBudget)}</Text>
          </View>
          <View className="flex-1 items-center gap-1">
            <Ionicons name="calculator-outline" size={20} color="#f59e0b" />
            <Text className="text-xs text-gray-500 text-center">Estimated Total</Text>
            <Text className="text-sm font-bold text-amber-500 text-center">{formatAmount(totalEstimatedCost)}</Text>
          </View>
        </View>
        <View className="h-px bg-gray-100 my-4" />
        <View className="flex-row">
          <View className="flex-1 items-center gap-1">
            <Ionicons name="cash-outline" size={20} color="#ef4444" />
            <Text className="text-xs text-gray-500 text-center">Real Cost</Text>
            <Text className="text-sm font-bold text-red-500 text-center">{formatAmount(totalRealCost)}</Text>
          </View>
          <View className="flex-1 items-center gap-1">
            <Ionicons name={isOverBudget ? "warning-outline" : "checkmark-circle-outline"} size={20} color={isOverBudget ? "#ef4444" : "#10b981"} />
            <Text className="text-xs text-gray-500 text-center">Remaining</Text>
            <Text className={`text-sm font-bold text-center ${isOverBudget ? "text-red-500" : "text-emerald-500"}`}>{formatAmount(remainingBudget)}</Text>
          </View>
        </View>
      </View>

      {/* Budget usage */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
        <Text className="text-base font-semibold text-gray-800 mb-4">Budget Usage</Text>

        <Text className="text-sm font-medium text-gray-700 mb-2">Real Cost vs Budget</Text>
        <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <View className="h-full rounded-full" style={{ width: `${budgetUsedPercent}%`, backgroundColor: isOverBudget ? "#ef4444" : "#10b981" }} />
        </View>
        <Text className="text-xs text-gray-400 text-right mt-1">{budgetUsedPercent.toFixed(1)}% used</Text>

        <Text className="text-sm font-medium text-gray-700 mt-4 mb-2">Estimated Cost vs Budget</Text>
        <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <View className="h-full rounded-full bg-amber-400" style={{ width: `${estimatedPercent}%` }} />
        </View>
        <Text className="text-xs text-gray-400 text-right mt-1">{estimatedPercent.toFixed(1)}% estimated</Text>
      </View>

      {/* Variance */}
      <View className="bg-white mx-4 mt-4 mb-8 rounded-2xl p-4">
        <Text className="text-base font-semibold text-gray-800 mb-4">Variance</Text>
        <View className="flex-row justify-between items-center py-2.5 border-b border-gray-100">
          <Text className="text-sm text-gray-500">Estimated vs Real</Text>
          <Text className={`text-sm font-bold ${totalRealCost <= totalEstimatedCost ? "text-emerald-500" : "text-red-500"}`}>
            {totalRealCost <= totalEstimatedCost ? "-" : "+"}{formatAmount(Math.abs(totalRealCost - totalEstimatedCost))}
          </Text>
        </View>
        <View className="flex-row justify-between items-center py-2.5">
          <Text className="text-sm text-gray-500">Budget vs Real</Text>
          <Text className={`text-sm font-bold ${isOverBudget ? "text-red-500" : "text-emerald-500"}`}>
            {isOverBudget ? "+" : "-"}{formatAmount(Math.abs(remainingBudget))}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}