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

export default function WalletListScreen() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log("WalletListScreen - User:", user);

  const fetchWallets = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID found");
      return;
    }
    
    try {
      console.log("Fetching wallets for user:", user.id);
      const response = await walletService.getAll(user.id);
      console.log("Wallets response:", response);
      setWallets(response.values);
    } catch (error: any) {
      console.error("Error fetching wallets:", error);
      Alert.alert("Error", error.message || "Failed to load wallets");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching wallets...");
      fetchWallets();
    }, [fetchWallets])
  );

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
      style={[styles.card, { borderLeftColor: item.color || "#3b82f6" }]}
      onPress={() => router.push(`/wallet/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View
            style={[styles.iconContainer, { backgroundColor: item.color || "#3b82f6" }]}
          >
            <Ionicons
              name={(WALLET_TYPE_ICONS[item.type] || "wallet-outline") as any}
              size={20}
              color="#fff"
            />
          </View>
          <View>
            <Text style={styles.walletName}>{item.name}</Text>
            <Text style={styles.walletType}>
              {WALLET_TYPE_LABELS[item.type] || item.type}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.walletAmount}>{formatAmount(item.amount)}</Text>
          {item.walletAutomaticIncome?.type !== "NOT_SPECIFIED" && (
            <View style={styles.autoIncomeBadge}>
              <Ionicons name="repeat-outline" size={12} color="#10b981" />
              <Text style={styles.autoIncomeText}>Auto</Text>
            </View>
          )}
        </View>
      </View>
      {item.description && (
        <Text style={styles.walletDescription} numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={styles.totalAmount}>{formatAmount(calculateTotal())}</Text>
        <Text style={styles.walletCount}>
          {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <Button
          title="Create Wallet"
          onPress={() => router.push("/wallet/create")}
          className="flex-1"
        />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Wallets Yet</Text>
      <Text style={styles.emptyText}>
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
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
        data={wallets}
        renderItem={renderWalletCard}
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
    fontSize: 14,
    color: "#c7d2fe",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  walletCount: {
    fontSize: 14,
    color: "#c7d2fe",
  },
  actionButtons: {
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
  walletName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  walletType: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  walletAmount: {
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
  walletDescription: {
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
