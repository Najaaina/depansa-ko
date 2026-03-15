import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { transactionService } from "@/services/transaction.service";
import { walletService } from "@/services/wallet.service";
import type { Transaction } from "@/types/transaction.types";
import type { Wallet } from "@/types/wallet.types";
import { Ionicons } from "@expo/vector-icons";

type PeriodFilter = "week" | "month" | "year";

interface LabelStats {
  labelId: string;
  labelName: string;
  labelColor: string;
  total: number;
  count: number;
  percentage: number;
}

export default function GlobalStatisticsScreen() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [isLoading, setIsLoading] = useState(true);

  const getDateFilters = (p: PeriodFilter) => {
    const now = new Date();
    const startDate = new Date();
    switch (p) {
      case "week": startDate.setDate(now.getDate() - 7); break;
      case "month": startDate.setMonth(now.getMonth() - 1); break;
      case "year": startDate.setFullYear(now.getFullYear() - 1); break;
    }
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  };

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const walletsResponse = await walletService.getAll(user.id);
      const allWallets = walletsResponse.values || [];
      setWallets(allWallets);

      const filters = getDateFilters(period);
      const response = await transactionService.getAll(user.id, filters, 1);
      const txns = Array.isArray(response) ? response : response?.values || [];
      setTransactions(txns);
    } catch (error) {
      console.error("Error fetching global statistics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, period]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const totalIncome = transactions.filter(t => t.type === "IN").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.amount, 0);
  const days = period === "week" ? 7 : period === "month" ? 30 : 365;

  const getLabelStats = (): LabelStats[] => {
    const expenseTxns = transactions.filter(t => t.type === "OUT");
    const totalExp = expenseTxns.reduce((sum, t) => sum + t.amount, 0);
    const labelMap = new Map<string, { name: string; color: string; total: number; count: number }>();

    expenseTxns.forEach(t => {
      t.labels?.forEach((label: any) => {
        const existing = labelMap.get(label.id!) || { name: label.name || "Unknown", color: label.color || "#6b7280", total: 0, count: 0 };
        existing.total += t.amount;
        existing.count += 1;
        labelMap.set(label.id!, existing);
      });
    });

    return Array.from(labelMap.entries())
      .map(([id, data]) => ({
        labelId: id,
        labelName: data.name,
        labelColor: data.color,
        total: data.total,
        count: data.count,
        percentage: totalExp > 0 ? (data.total / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getWalletStats = () => {
    return wallets.map(wallet => {
      const walletTxns = transactions.filter(t => t.walletId === wallet.id);
      return {
        wallet,
        income: walletTxns.filter(t => t.type === "IN").reduce((sum, t) => sum + t.amount, 0),
        expense: walletTxns.filter(t => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0),
        count: walletTxns.length,
      };
    }).filter(w => w.count > 0);
  };

  const labelStats = getLabelStats();
  const walletStats = getWalletStats();
  const periodOptions: { label: string; value: PeriodFilter }[] = [
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Period selector */}
      <View style={styles.periodSelector}>
        {periodOptions.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.periodOption, period === opt.value && styles.periodOptionActive]}
            onPress={() => setPeriod(opt.value)}
          >
            <Text style={[styles.periodOptionText, period === opt.value && styles.periodOptionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Total wallet balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance Across All Wallets</Text>
        <Text style={[styles.balanceAmount, { color: totalWalletBalance >= 0 ? "#1f2937" : "#ef4444" }]}>
          {formatAmount(totalWalletBalance)}
        </Text>
        <Text style={styles.walletCount}>{wallets.length} wallet{wallets.length !== 1 ? "s" : ""}</Text>
      </View>

      {/* Income / Expense summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: "#10b981" }]}>+{formatAmount(totalIncome)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>-{formatAmount(totalExpense)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Net for period</Text>
          <Text style={[styles.netValue, { color: netBalance >= 0 ? "#10b981" : "#ef4444" }]}>
            {netBalance >= 0 ? "+" : ""}{formatAmount(netBalance)}
          </Text>
        </View>
      </View>

      {/* Daily average */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Average</Text>
        <View style={styles.averageRow}>
          <View style={styles.averageItem}>
            <Ionicons name="arrow-down" size={16} color="#10b981" />
            <Text style={styles.averageValue}>{formatAmount(totalIncome / days)}</Text>
            <Text style={styles.averageLabel}>income/day</Text>
          </View>
          <View style={styles.averageItem}>
            <Ionicons name="arrow-up" size={16} color="#ef4444" />
            <Text style={styles.averageValue}>{formatAmount(totalExpense / days)}</Text>
            <Text style={styles.averageLabel}>expense/day</Text>
          </View>
        </View>
      </View>

      {/* Per-wallet breakdown */}
      {walletStats.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Wallet</Text>
          {walletStats.map(({ wallet, income, expense, count }) => (
            <View key={wallet.id} style={styles.walletItem}>
              <View style={[styles.walletDot, { backgroundColor: wallet.color || "#3b82f6" }]} />
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{wallet.name}</Text>
                <Text style={styles.walletTransactionCount}>{count} transaction{count !== 1 ? "s" : ""}</Text>
              </View>
              <View style={styles.walletAmounts}>
                {income > 0 && <Text style={styles.incomeText}>+{formatAmount(income)}</Text>}
                {expense > 0 && <Text style={styles.expenseText}>-{formatAmount(expense)}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* By category */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Expenses by Category</Text>
        {labelStats.length === 0 ? (
          <Text style={styles.emptyText}>No expense data for this period</Text>
        ) : (
          labelStats.map(stat => (
            <View key={stat.labelId} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: stat.labelColor }]} />
                <Text style={styles.categoryName}>{stat.labelName}</Text>
                <Text style={styles.categoryCount}>({stat.count})</Text>
              </View>
              <View style={styles.categoryValues}>
                <Text style={styles.categoryAmount}>{formatAmount(stat.total)}</Text>
                <Text style={styles.categoryPercentage}>{stat.percentage.toFixed(1)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stat.percentage}%`, backgroundColor: stat.labelColor }]} />
              </View>
            </View>
          ))
        )}
      </View>

      {/* Summary counts */}
      <View style={[styles.card, { marginBottom: 32 }]}>
        <Text style={styles.cardTitle}>Summary</Text>
        <View style={styles.summaryList}>
          <View style={styles.summaryListItem}>
            <Text style={styles.summaryListLabel}>Total Transactions</Text>
            <Text style={styles.summaryListValue}>{transactions.length}</Text>
          </View>
          <View style={styles.summaryListItem}>
            <Text style={styles.summaryListLabel}>Income Transactions</Text>
            <Text style={[styles.summaryListValue, { color: "#10b981" }]}>{transactions.filter(t => t.type === "IN").length}</Text>
          </View>
          <View style={styles.summaryListItem}>
            <Text style={styles.summaryListLabel}>Expense Transactions</Text>
            <Text style={[styles.summaryListValue, { color: "#ef4444" }]}>{transactions.filter(t => t.type === "OUT").length}</Text>
          </View>
        </View>
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
  loadingText: {
    color: "#6b7280",
  },
  periodSelector: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  periodOptionActive: {
    backgroundColor: "#4f46e5",
  },
  periodOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  periodOptionTextActive: {
    color: "#fff",
  },
  balanceCard: {
    backgroundColor: "#4f46e5",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 13,
    color: "#c7d2fe",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  walletCount: {
    fontSize: 13,
    color: "#c7d2fe",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
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
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  netValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  averageRow: {
    flexDirection: "row",
  },
  averageItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  averageValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  averageLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  walletItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: 10,
  },
  walletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  walletTransactionCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  walletAmounts: {
    alignItems: "flex-end",
    gap: 2,
  },
  incomeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#10b981",
  },
  expenseText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ef4444",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 16,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  categoryCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  categoryValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  categoryPercentage: {
    fontSize: 12,
    color: "#6b7280",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  summaryList: {
    gap: 12,
  },
  summaryListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryListLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryListValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
});