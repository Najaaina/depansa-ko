import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";
import { walletService } from "@/services/wallet.service";
import type { Transaction } from "@/types/transaction.types";
import type { Wallet } from "@/types/wallet.types";
import { Ionicons } from "@expo/vector-icons";

export default function TransactionsTab() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<(Transaction & { walletName?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const walletsData = await walletService.getAll(user.id, { isActive: true });
      const walletList = Array.isArray(walletsData) ? walletsData : walletsData.values || [];

      const allTransactions: (Transaction & { walletName?: string })[] = [];
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
      className="flex-row justify-between items-center bg-white mx-4 mb-2 p-3 rounded-xl"
      onPress={() => router.push(`/wallet/${item.walletId}/edit-transaction?transactionId=${item.id}&walletId=${item.walletId}`)}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className={`w-9 h-9 rounded-lg justify-center items-center ${
            item.type === "IN" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Ionicons
            name={item.type === "IN" ? "arrow-down-outline" : "arrow-up-outline"}
            size={16}
            color={item.type === "IN" ? "#10b981" : "#ef4444"}
          />
        </View>
        <View>
          <Text className="text-gray-800 font-medium text-sm">
            {item.description || (item.type === "IN" ? "Income" : "Expense")}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            {formatDate(item.date)} • {item.walletName}
          </Text>
        </View>
      </View>
      <Text
        className={`font-semibold ${
          item.type === "IN" ? "text-green-500" : "text-red-500"
        }`}
      >
        {item.type === "IN" ? "+" : "-"}
        {formatAmount(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="p-4">
      <View className="bg-white rounded-2xl p-4 mb-4 flex-row">
        <View className="flex-1 items-center">
          <Text className="text-gray-500 text-xs">Income</Text>
          <Text className="text-green-500 font-semibold text-lg">
            +{formatAmount(totalIncome)}
          </Text>
        </View>
        <View className="w-px bg-gray-100" />
        <View className="flex-1 items-center">
          <Text className="text-gray-500 text-xs">Expense</Text>
          <Text className="text-red-500 font-semibold text-lg">
            -{formatAmount(totalExpense)}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {(["ALL", "IN", "OUT"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            className={`flex-1 py-2.5 px-4 rounded-full items-center ${
              filter === type ? "bg-blue-600" : "bg-white"
            }`}
            onPress={() => setFilter(type)}
          >
            <Text className={`text-sm font-medium ${
              filter === type ? "text-white" : "text-gray-500"
            }`}>
              {type === "ALL" ? "All" : type === "IN" ? "Income" : "Expense"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
      <Text className="text-gray-600 font-semibold mt-4">No Transactions</Text>
      <Text className="text-gray-400 text-sm mt-2 text-center">
        Add transactions from your wallet pages
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <Text className="text-3xl font-bold text-gray-800">Transactions</Text>
      </View>
      
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle="pb-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
