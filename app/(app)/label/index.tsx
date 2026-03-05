import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { labelService } from "@/services/label.service";
import type { Label } from "@/types/lablel.types";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

const LABEL_TYPE_ICONS: Record<string, string> = {
  WORK: "briefcase",
  SCHOOL: "school",
  FOOD: "fast-food",
  TRANSPORT: "bus",
  SHOPPING:"cart",
  HEALTH:"medkit-sharp",
  ENTERTAINEMENT:"extension-puzzle",
  MISC: "star"
};

export default function LabelListScreen() {
  const { user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log("LabelListScreen - User:", user);
  
  const fetchLabels = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID found");
      return;
    }
    
    try {
      console.log("Fetching labels for user:", user.id);
      const response = await labelService.getAll(user.id);
      console.log("Labels response:", response);
      setLabels(response.values);
    } catch (error: any) {
      console.error("Error fetching labels:", error);
      Alert.alert("Error", error.message || "Failed to load labels");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching labels...");
      fetchLabels();
    }, [fetchLabels])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLabels();
  };

  const renderLabelCard = ({ item }: { item: Label }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: item.color || "#3b82f6" }]}
      onPress={() => router.push(`/label/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View
            style={[styles.iconContainer, { backgroundColor: item.color || "#3b82f6" }]}
          >
            <Ionicons
              name={(LABEL_TYPE_ICONS[item.iconRef] || "help") as any}
              size={20}
              color="#fff"
            />
          </View>
          <View>
            <Text style={styles.labelName}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#000000"
            />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Created Label</Text>
        <Text style={styles.labelCount}>
          {labels.length} label{labels.length > 1 ? "s" : ""}
        </Text>
      </View>

    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="pricetag" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Label Yet</Text>
      <Text style={styles.emptyText}>
        Create your first label to start tracking your transactions
      </Text>
    </View>
  );

  const renderFooter = ()=>(
      <View style={styles.actionButtons}>
        <Button
          title="Create Label"
          onPress={() => router.push("/label/create")}
          className="flex-1"
        />
      </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={labels}
        renderItem={renderLabelCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={renderFooter}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  totalCard: {
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f1f1f1",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  labelCount: {
    fontSize: 14,
    color: "#c7d2fe",
  },
  actionButtons: {
    marginTop: 15,
    flexDirection: "row",
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  labelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  labelType: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  labelAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  autoIncomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  autoIncomeText: {
    fontSize: 10,
    color: "#10b981",
    fontWeight: "600",
  },
  labelDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
});
