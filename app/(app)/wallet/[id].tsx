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
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/services/wallet.service";
import { transactionService } from "@/services/transaction.service";
import type { Wallet } from "@/types/wallet.types";
import type { Transaction } from "@/types/transaction.types";
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
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id || !id) return;
    
    try {
      const [walletData, transactionsData] = await Promise.all([
        walletService.getOne(user.id, id),
        transactionService.getByWallet(user.id, id),
      ]);
      setWallet(walletData);
      setTransactions(transactionsData.values);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load wallet");
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
      "Archive Wallet",
      "Are you sure you want to archive this wallet? It will no longer appear in your active wallets.",
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

  if (isLoading || !wallet) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const totalIncome = transactions
    .filter(t => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: wallet.color || "#3b82f6" }]}>
          <Ionicons
            name={(WALLET_TYPE_ICONS[wallet.type] || "wallet-outline") as any}
            size={32}
            color="#fff"
          />
        </View>
        <Text style={styles.walletName}>{wallet.name}</Text>
        <Text style={styles.walletType}>
          {WALLET_TYPE_LABELS[wallet.type] || wallet.type}
        </Text>
        {wallet.description && (
          <Text style={styles.walletDescription}>{wallet.description}</Text>
        )}
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatAmount(wallet.amount)}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: "#10b981" }]}>
              +{formatAmount(totalIncome)}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>
              -{formatAmount(totalExpense)}
            </Text>
          </View>
        </View>

        {wallet.walletAutomaticIncome?.type !== "NOT_SPECIFIED" && (
          <View style={styles.autoIncomeCard}>
            <Ionicons name="repeat-outline" size={16} color="#10b981" />
            <View style={styles.autoIncomeContent}>
              <Text style={styles.autoIncomeLabel}>Automatic Income</Text>
              <Text style={styles.autoIncomeAmount}>
                {formatAmount(wallet.walletAutomaticIncome.amount)} / month
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Edit Wallet"
          onPress={() => router.push(`/wallet/${id}/edit`)}
          className="flex-1"
        />
        <Button
          title="Archive"
          variant="outline"
          onPress={handleArchive}
          className="flex-1"
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Automatic Income"
          onPress={() => router.push(`/wallet/${id}/automatic-income`)}
          variant="outline"
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
                        transaction.type === "INCOME"
                          ? "#d1fae5"
                          : "#fee2e2",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      (transaction.type === "INCOME"
                        ? "arrow-down-outline"
                        : "arrow-up-outline") as any
                    }
                    size={16}
                    color={transaction.type === "INCOME" ? "#10b981" : "#ef4444"}
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
                    color:
                      transaction.type === "INCOME" ? "#10b981" : "#ef4444",
                  },
                ]}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {formatAmount(transaction.amount)}
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
