import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";
import type { Transaction } from "@/types/transaction.types";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TransactionCalendarScreen() {
  const { id: walletId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id || !walletId) return;
    
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const response = await transactionService.getByWallet(
        user.id, 
        walletId, 
        {
          startDate: firstDay.toISOString().split("T")[0],
          endDate: lastDay.toISOString().split("T")[0],
        },
        1,
        100
      );
      
      const txns = Array.isArray(response) 
        ? response 
        : response?.values || [];
      setTransactions(txns);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, walletId, currentDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getTransactionsForDate = (day: number): Transaction[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return transactions.filter(t => t.date.startsWith(dateStr));
  };

  const getTotalForDate = (day: number): { income: number; expense: number } => {
    const txns = getTransactionsForDate(day);
    return {
      income: txns.filter(t => t.type === "IN").reduce((sum, t) => sum + t.amount, 0),
      expense: txns.filter(t => t.type === "OUT").reduce((sum, t) => sum + t.amount, 0),
    };
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const selectedDateTransactions = selectedDate 
    ? getTransactionsForDate(parseInt(selectedDate)) 
    : [];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const days = getDaysInMonth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
        
        {days.map((day, index) => {
          const isSelected = day && selectedDate === String(day);
          const dayTransactions = day ? getTransactionsForDate(day) : [];
          const hasTransactions = dayTransactions.length > 0;
          const totals = day ? getTotalForDate(day) : { income: 0, expense: 0 };
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                hasTransactions && styles.dayCellHasTransactions,
              ]}
              onPress={() => day && setSelectedDate(String(day))}
              disabled={!day}
            >
              {day && (
                <>
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                  ]}>
                    {day}
                  </Text>
                  {hasTransactions && (
                    <View style={styles.transactionIndicators}>
                      {totals.income > 0 && (
                        <View style={[styles.indicator, styles.incomeIndicator]} />
                      )}
                      {totals.expense > 0 && (
                        <View style={[styles.indicator, styles.expenseIndicator]} />
                      )}
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>

      {selectedDate && (
        <View style={styles.selectedDateSection}>
          <Text style={styles.selectedDateTitle}>
            Transactions for {MONTHS[currentDate.getMonth()]} {selectedDate}
          </Text>
          
          {selectedDateTransactions.length === 0 ? (
            <Text style={styles.noTransactions}>No transactions on this day</Text>
          ) : (
            selectedDateTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => router.push(`/wallet/${walletId}/edit-transaction?transactionId=${transaction.id}&walletId=${walletId}`)}
              >
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
                        transaction.type === "IN"
                          ? "arrow-down-outline"
                          : "arrow-up-outline"
                      }
                      size={14}
                      color={transaction.type === "IN" ? "#10b981" : "#ef4444"}
                    />
                  </View>
                  <View>
                    <Text style={styles.transactionDescription}>
                      {transaction.description || transaction.type}
                    </Text>
                    <Text style={styles.transactionLabels}>
                      {transaction.labels?.map(l => l.name).join(", ") || "No labels"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: transaction.type === "IN" ? "#10b981" : "#ef4444" },
                  ]}
                >
                  {transaction.type === "IN" ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
  },
  dayHeader: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  dayCellSelected: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  dayCellHasTransactions: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: "#1f2937",
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  transactionIndicators: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  incomeIndicator: {
    backgroundColor: "#10b981",
  },
  expenseIndicator: {
    backgroundColor: "#ef4444",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    padding: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#6b7280",
  },
  selectedDateSection: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  noTransactions: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 16,
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
    gap: 10,
    flex: 1,
  },
  transactionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  transactionLabels: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
});
