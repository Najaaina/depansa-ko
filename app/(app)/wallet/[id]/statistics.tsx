import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";
import { walletService } from "@/services/wallet.service";
import type { Transaction } from "@/types/transaction.types";
import type { Wallet } from "@/types/wallet.types";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const { width } = Dimensions.get("window");

type PeriodFilter = "week" | "month" | "year";

interface LabelStats {
  labelId: string;
  labelName: string;
  labelColor: string;
  total: number;
  count: number;
  percentage: number;
}

export default function StatisticsScreen() {
  const { id: walletId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id || !walletId) return;
    
    setIsLoading(true);
    try {
      const walletData = await walletService.getOne(user.id, walletId);
      setWallet(walletData);

      const filters = getDateFilters(period);
      const response = await transactionService.getByWallet(
        user.id, 
        walletId, 
        filters,
        1,
        500
      );
      
      const txns = Array.isArray(response) 
        ? response 
        : response?.values || [];
      setTransactions(txns);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, walletId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getDateFilters = (p: PeriodFilter) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (p) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTotalIncome = (): number => {
    return transactions
      .filter(t => t.type === "IN")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpense = (): number => {
    return transactions
      .filter(t => t.type === "OUT")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getAverageDaily = (): { income: number; expense: number } => {
    const days = period === "week" ? 7 : period === "month" ? 30 : 365;
    return {
      income: getTotalIncome() / days,
      expense: getTotalExpense() / days,
    };
  };

  const getLabelStats = (): LabelStats[] => {
    const expenseTxns = transactions.filter(t => t.type === "OUT");
    const totalExpense = expenseTxns.reduce((sum, t) => sum + t.amount, 0);
    
    const labelMap = new Map<string, { name: string; color: string; total: number; count: number }>();
    
    expenseTxns.forEach(t => {
      t.labels?.forEach(label => {
        const existing = labelMap.get(label.id!) || { 
          name: label.name || "Unknown", 
          color: label.color || "#6b7280", 
          total: 0, 
          count: 0 
        };
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
        percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getDailyStats = () => {
    const dailyMap = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(t => {
      const date = t.date.split("T")[0];
      const existing = dailyMap.get(date) || { income: 0, expense: 0 };
      if (t.type === "IN") {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
      dailyMap.set(date, existing);
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
  };

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const netBalance = totalIncome - totalExpense;
  const avgDaily = getAverageDaily();
  const labelStats = getLabelStats();
  const dailyStats = getDailyStats();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.walletName}>{wallet?.name || "Wallet"}</Text>
        <Text style={styles.periodLabel}>Last {period}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: "#10b981" }]}>
              +{formatAmount(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              -{formatAmount(totalExpense)}
            </Text>
          </View>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text style={[
            styles.balanceValue,
            { color: netBalance >= 0 ? "#10b981" : "#ef4444" }
          ]}>
            {netBalance >= 0 ? "+" : ""}{formatAmount(netBalance)}
          </Text>
        </View>
      </View>

      <View style={styles.averageCard}>
        <Text style={styles.cardTitle}>Daily Average</Text>
        <View style={styles.averageRow}>
          <View style={styles.averageItem}>
            <Ionicons name="arrow-down" size={16} color="#10b981" />
            <Text style={styles.averageValue}>{formatAmount(avgDaily.income)}</Text>
            <Text style={styles.averageLabel}>income/day</Text>
          </View>
          <View style={styles.averageItem}>
            <Ionicons name="arrow-up" size={16} color="#ef4444" />
            <Text style={styles.averageValue}>{formatAmount(avgDaily.expense)}</Text>
            <Text style={styles.averageLabel}>expense/day</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Expense by Category</Text>
        </View>
        
        {labelStats.length === 0 ? (
          <Text style={styles.emptyText}>No expense data available</Text>
        ) : (
          labelStats.map((stat) => (
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
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${stat.percentage}%`, backgroundColor: stat.labelColor }
                  ]} 
                />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Recent Days</Text>
        {dailyStats.length === 0 ? (
          <Text style={styles.emptyText}>No recent transactions</Text>
        ) : (
          dailyStats.map((day) => (
            <View key={day.date} style={styles.dailyItem}>
              <Text style={styles.dailyDate}>
                {new Date(day.date).toLocaleDateString("en-US", { 
                  weekday: "short", 
                  month: "short", 
                  day: "numeric" 
                })}
              </Text>
              <View style={styles.dailyValues}>
                {day.income > 0 && (
                  <Text style={[styles.dailyAmount, { color: "#10b981" }]}>
                    +{formatAmount(day.income)}
                  </Text>
                )}
                {day.expense > 0 && (
                  <Text style={[styles.dailyAmount, { color: "#ef4444" }]}>
                    -{formatAmount(day.expense)}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Summary</Text>
        <View style={styles.summaryList}>
          <View style={styles.summaryListItem}>
            <Text style={styles.summaryListLabel}>Total Transactions</Text>
            <Text style={styles.summaryListValue}>{transactions.length}</Text>
          </View>
          <View style={styles.summaryListItem}>
            <Text style={styles.summaryListLabel}>Income Transactions</Text>
            <Text style={[styles.summaryListValue, { color: "#10b981" }]}>
              {transactions.filter(t => t.type === "IN").length}
            </Text>
          </View>
          <View style={styles.summaryListItem}>
            <Text style={styles.summaryListLabel}>Expense Transactions</Text>
            <Text style={[styles.summaryListValue, { color: "#ef4444" }]}>
              {transactions.filter(t => t.type === "OUT").length}
            </Text>
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
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  walletName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  periodLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
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
  balanceDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  averageCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  averageRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  averageItem: {
    flex: 1,
    alignItems: "center",
  },
  averageValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 4,
  },
  averageLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  statsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
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
  dailyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dailyDate: {
    fontSize: 14,
    color: "#374151",
  },
  dailyValues: {
    flexDirection: "row",
    gap: 12,
  },
  dailyAmount: {
    fontSize: 14,
    fontWeight: "500",
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
