import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { walletService } from "@/services/wallet.service";
import { transactionService } from "@/services/transaction.service";
import type { Wallet } from "@/types/wallet.types";
import type { Transaction, TransactionFilters } from "@/types/transaction.types";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

const WALLET_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile Money",
  BANK: "Bank",
  DEBT: "Debt",
};

const WALLET_TYPE_ICONS: Record<string, string> = {
  CASH: "cash-outline",
  MOBILE_MONEY: "phone-portrait-outline",
  BANK: "card-outline",
  DEBT: "alert-circle-outline",
};

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { convertAndFormat } = useCurrency();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum: number = 1) => {
    if (!user?.id || !id) return;

    try {
      const walletData = await walletService.getOne(user.id, id);
      let transactionsData: Transaction[] = [];
      try {
        const filters: TransactionFilters = {};
        if (filterType !== "ALL") filters.type = filterType;
        const response = await transactionService.getByWallet(user.id, id, filters, pageNum, 20);
        if (Array.isArray(response)) {
          transactionsData = response;
        } else if (response && Array.isArray(response.values)) {
          transactionsData = response.values;
          setHasMore(transactionsData.length === 20);
        }
      } catch (txError) {
        console.error("Error fetching transactions:", txError);
      }
      if (pageNum === 1) {
        setTransactions(transactionsData);
      } else {
        setTransactions(prev => [...prev, ...transactionsData]);
      }
      setWallet(walletData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load wallet");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, id, filterType]);

  useFocusEffect(
    useCallback(() => { fetchData(1); }, [fetchData])
  );
  useEffect(() => { setPage(1); fetchData(1); }, [filterType]);

  const onRefresh = () => { setRefreshing(true); fetchData(1); };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  };

  const handleArchive = () => {
    Alert.alert(
      "Archive Wallet",
      "Are you sure you want to archive this wallet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            if (!user?.id || !id) return;
            try {
              await walletService.archive(user.id, id);
              Alert.alert("Success", "Wallet archived successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to archive wallet");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading || !wallet) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const totalIncome = transactions.filter(t => t.type === "IN").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: wallet.color || "#3b82f6" }]}>
          <Ionicons name={(WALLET_TYPE_ICONS[wallet.type] || "wallet-outline") as any} size={32} color="#fff" />
        </View>
        <Text style={styles.walletName}>{wallet.name}</Text>
        <Text style={styles.walletType}>{WALLET_TYPE_LABELS[wallet.type] || wallet.type}</Text>
        {wallet.description && <Text style={styles.walletDescription}>{wallet.description}</Text>}
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{convertAndFormat(wallet.amount)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: "#10b981" }]}>+{convertAndFormat(totalIncome)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>-{convertAndFormat(totalExpense)}</Text>
          </View>
        </View>
        {wallet.walletAutomaticIncome?.type !== "NOT_SPECIFIED" && (
          <View style={styles.autoIncomeCard}>
            <Ionicons name="repeat-outline" size={16} color="#10b981" />
            <View style={styles.autoIncomeContent}>
              <Text style={styles.autoIncomeLabel}>Automatic Income</Text>
              <Text style={styles.autoIncomeAmount}>{convertAndFormat(wallet.walletAutomaticIncome.amount)} / month</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button title="Add Transaction" onPress={() => router.push(`/wallet/${id}/add-transaction`)} className="flex-1" />
      </View>
      <View style={styles.actions}>
        <Button title="Calendar" onPress={() => router.push(`/wallet/${id}/calendar`)} variant="outline" className="flex-1" />
        <Button title="Statistics" onPress={() => router.push(`/wallet/${id}/statistics`)} variant="outline" className="flex-1" />
      </View>
      <View style={styles.actions}>
        <Button title="Edit Wallet" onPress={() => router.push(`/wallet/${id}/edit`)} className="flex-1" />
        <Button title="Archive" variant="outline" onPress={handleArchive} className="flex-1" />
      </View>
      <View style={styles.actions}>
        <Button title="Automatic Income" onPress={() => router.push(`/wallet/${id}/automatic-income`)} variant="outline" className="flex-1" />
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="filter-outline" size={18} color="#3b82f6" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Type:</Text>
            <View style={styles.filterOptions}>
              {(["ALL", "IN", "OUT"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterOption, filterType === t && styles.filterOptionActive]}
                  onPress={() => setFilterType(t)}
                >
                  <Text style={[styles.filterOptionText, filterType === t && styles.filterOptionTextActive]}>
                    {t === "ALL" ? "All" : t === "IN" ? "Income" : "Expense"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {transactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => router.push(`/wallet/${id}/edit-transaction?transactionId=${transaction.id}&walletId=${id}`)}
            >
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: transaction.type === "IN" ? "#d1fae5" : "#fee2e2" }]}>
                  <Ionicons
                    name={(transaction.type === "IN" ? "arrow-down-outline" : "arrow-up-outline") as any}
                    size={16}
                    color={transaction.type === "IN" ? "#10b981" : "#ef4444"}
                  />
                </View>
                <View>
                  <Text style={styles.transactionDescription}>{transaction.description || transaction.type}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, { color: transaction.type === "IN" ? "#10b981" : "#ef4444" }]}>
                {transaction.type === "IN" ? "+" : "-"}{convertAndFormat(transaction.amount)}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {hasMore && transactions.length > 0 && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
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
  walletName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  walletType: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  walletDescription: {
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
    fontSize: 36,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
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
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  filterContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  filterOptionActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  filterOptionTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  loadMoreButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
});