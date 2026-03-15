import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";
import type { Transaction } from "@/types/transaction.types";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/types/lablel.types";
import { labelService } from "@/services/label.service";
import { useCurrency } from "@/context/CurrencyContext";

const LABEL_TYPE_ICONS: Record<string, string> = {
  WORK: "briefcase",
  SCHOOL: "school",
  FOOD: "fast-food",
  TRANSPORT: "bus",
  SHOPPING: "cart",
  HEALTH: "medkit-sharp",
  ENTERTAINEMENT: "extension-puzzle",
  MISC: "star",
};

export default function LablelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [label, setLabel] = useState<Label | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { convertAndFormat } = useCurrency();
  
  const fetchData = useCallback(async () => {
    if (!user?.id || !id) return;

    try {
      const labelData = await labelService.getOne(user.id, id);
      let transactionsData: Transaction[] = [];
      try {
        const response = await transactionService.getAll(user.id);
        console.log(
          `here is all the transaction : ${Object.entries(response)}`,
        );
        if (Array.isArray(response)) {
          transactionsData = response.filter((transaction: Transaction) => {
            if (transaction.labels != undefined) {
              for (const item of transaction.labels) {
                if (item.name == labelData.name) {
                  return true;
                }
              }
            }
            return false;
          });
        } else if (response && Array.isArray(response.values)) {
          transactionsData = response.values.filter(
            (transaction: Transaction) => {
              if (transaction.labels != undefined) {
                for (const item of transaction.labels) {
                  if (item.name == labelData.name) {
                    return true;
                  }
                }
              }
              return false;
            },
          );
        }
      } catch (txError) {
        console.error("Error fetching transactions:", txError);
      }
      setLabel(labelData);
      setTransactions(transactionsData);

      console.log(`here is all the transaction for ${labelData?.name}:`);
      console.log(transactionsData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load labels");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleArchive = () => {
    Alert.alert(
      "Archive Label",
      "Are you sure you want to archive this label? It will no longer appear in your active labels.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            if (!user?.id || !id) return;
            try {
              await labelService.archive(user.id, id);
              Alert.alert("Success", "Label archived successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to archive label");
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading || !label) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const totalIncome = transactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: label.color || "#3b82f6" },
          ]}
        >
          <Ionicons
            name={(LABEL_TYPE_ICONS[label.iconRef] || "pricetag") as any}
            size={32}
            color="#fff"
          />
        </View>
        <Text style={styles.labelName}>{label.name}</Text>
        {/* {label.description && (
          <Text style={styles.labelDescription}>{label.description}</Text>
        )} */}
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceAmount}>
          {transactions.length} Transaction{transactions.length > 1 ? "s" : ""}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: "#10b981" }]}>
              +{convertAndFormat(totalIncome)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>
              -{convertAndFormat(totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Edit Label"
          onPress={() => router.push(`/label/${id}/edit`)}
          className="flex-1"
        />
        <Button
          title="Archive"
          variant="outline"
          onPress={handleArchive}
          className="flex-1"
        />
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        transaction.type === "IN" ? "#d1fae5" : "#fee2e2",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      (transaction.type === "IN"
                        ? "arrow-down-outline"
                        : "arrow-up-outline") as any
                    }
                    size={16}
                    color={transaction.type === "IN" ? "#10b981" : "#ef4444"}
                  />
                </View>
                <View>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || transaction.type}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: transaction.type === "IN" ? "#10b981" : "#ef4444",
                  },
                ]}
              >
                {transaction.type === "IN" ? "+" : "-"}
                {convertAndFormat(transaction.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  labelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  labelType: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  labelDescription: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
  },
  balanceCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#f3f4f6",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  autoIncomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 10,
  },
  autoIncomeContent: {
    flex: 1,
  },
  autoIncomeLabel: {
    fontSize: 12,
    color: "#065f46",
    fontWeight: "600",
  },
  autoIncomeAmount: {
    fontSize: 14,
    color: "#047857",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  transactionsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    textTransform: "capitalize",
  },
  transactionDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
