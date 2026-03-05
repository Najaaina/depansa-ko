import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";
import { walletService } from "@/services/wallet.service";
import type { Transaction } from "@/types/transaction.types";
import type { Wallet } from "@/types/wallet.types";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

export default function TransactionsTab() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const walletsData = await walletService.getAll(user.id, { isActive: true });
      const walletList = Array.isArray(walletsData) ? walletsData : walletsData.values || [];
      setWallets(walletList);

      const allTransactions: Transaction[] = [];
      for (const wallet of walletList) {
        try {
          const response = await transactionService.getByWallet(user.id, wallet.id, {}, 1, 50);
          const txns = Array.isArray(response) ? response : response.values || [];
          allTransactions.push(...txns.map(t => ({ ...t, walletName: wallet.name })));
        } catch (error) {
          console.error("Error fetching transactions for wallet:", wallet.id);
        }
      }

      const sorted = allTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTransactions(sorted);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredTransactions = filter === "ALL" 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  const totalIncome = filteredTransactions
    .filter(t => t.type === "IN")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === "OUT")
    .reduce((sum, t) => sum + t.amount, 0);

  const renderTransaction = ({ item }: { item: Transaction & { walletName?: string } }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => router.push(`/wallet/${item.walletId}/edit-transaction?transactionId=${item.id}&walletId=${item.walletId}`)}
    >
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: item.type === "IN" ? "#d1fae5" : "#fee2e2",
            },
          ]}
        >
          <Ionicons
            name={item.type === "IN" ? "arrow-down-outline" : "arrow-up-outline"}
            size={16}
            color={item.type === "IN" ? "#10b981" : "#ef4444"}
          />
        </View>
        <View>
          <Text style={styles.transactionDescription}>
            {item.description || (item.type === "IN" ? "Income" : "Expense")}
          </Text>
          <Text style={styles.transactionMeta}>
            {formatDate(item.date)} • {item.walletName}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.type === "IN" ? "#10b981" : "#ef4444" },
        ]}
      >
        {item.type === "IN" ? "+" : "-"}
        {formatAmount(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            +{formatAmount(totalIncome)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
            -{formatAmount(totalExpense)}
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {(["ALL", "IN", "OUT"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filter === type && styles.filterButtonActive]}
            onPress={() => setFilter(type)}
          >
            <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
              {type === "ALL" ? "All" : type === "IN" ? "Income" : "Expense"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptyText}>
        Add transactions from your wallet pages
      </Text>
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
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Transactions</Text>
      </View>
      
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  screenHeader: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    padding: 16,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#f3f4f6",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#fff",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
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
  },
  transactionMeta: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
  },
});
