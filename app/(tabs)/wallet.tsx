import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/services/wallet.service";
import type { Wallet } from "@/types/wallet.types";
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

export default function WalletsTab() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallets = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await walletService.getAll(user.id);
      const walletList = Array.isArray(response) ? response : response.values || [];
      setWallets(walletList);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallets();
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateTotal = (): number => {
    return wallets.reduce((sum, wallet) => sum + wallet.amount, 0);
  };

  const renderWalletCard = ({ item }: { item: Wallet }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border-l-4"
      style={{ borderLeftColor: item.color || "#3b82f6" }}
      onPress={() => router.push(`/wallet/${item.id}`)}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-lg justify-center items-center"
            style={{ backgroundColor: item.color || "#3b82f6" }}
          >
            <Ionicons
              name={(WALLET_TYPE_ICONS[item.type] || "wallet-outline") as any}
              size={20}
              color="#fff"
            />
          </View>
          <View>
            <Text className="text-gray-800 font-semibold">{item.name}</Text>
            <Text className="text-gray-500 text-xs mt-0.5">
              {WALLET_TYPE_LABELS[item.type] || item.type}
            </Text>
          </View>
        </View>
        <Text className="text-gray-800 font-bold text-lg">{formatAmount(item.amount)}</Text>
      </View>
      {item.description && (
        <Text className="text-gray-500 text-sm mt-3" numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="mb-4">
      <View className="bg-indigo-600 rounded-2xl p-5">
        <Text className="text-indigo-200 text-sm">Total Balance</Text>
        <Text className="text-white text-3xl font-bold mt-1">{formatAmount(calculateTotal())}</Text>
        <Text className="text-indigo-200 text-sm mt-1">
          {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <Button
        title="Create Wallet"
        onPress={() => router.push("/wallet/create")}
        className="mt-4"
      />
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Ionicons name="wallet-outline" size={64} color="#d1d5db" />
      <Text className="text-gray-600 font-semibold mt-4">No Wallets Yet</Text>
      <Text className="text-gray-400 text-sm mt-2 text-center">
        Create your first wallet to start tracking your finances
      </Text>
      <Button
        title="Create Wallet"
        onPress={() => router.push("/wallet/create")}
        className="mt-4"
      />
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
        <Text className="text-3xl font-bold text-gray-800">My Wallets</Text>
      </View>

      <FlatList
        data={wallets}
        renderItem={renderWalletCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle="px-4 pb-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
