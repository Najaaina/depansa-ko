import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { projectService } from "@/services/project.service";
import { walletService } from "@/services/wallet.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import type { Wallet } from "@/types/wallet.types";

export default function EditProjectTransactionScreen() {
  const { id: projectId, transactionId } = useLocalSearchParams<{ id: string; transactionId: string }>();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [realCost, setRealCost] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !projectId || !transactionId) return;
      try {
        const [tx, walletsResponse] = await Promise.all([
          projectService.getOneTransaction(user.id, projectId, transactionId),
          walletService.getAll(user.id),
        ]);
        setName(tx.name);
        setDescription(tx.description || "");
        setEstimatedCost(String(tx.estimatedCost));
        setRealCost(tx.realCost ? String(tx.realCost) : "");
        setSelectedWalletId(tx.walletId);
        setWallets(walletsResponse.values || []);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load transaction");
      } finally {
        setIsInitialized(true);
      }
    };
    loadData();
  }, [user?.id, projectId, transactionId]);

  const handleUpdate = async () => {
    if (!user?.id || !projectId || !transactionId) return;
    if (!name.trim()) { Alert.alert("Error", "Transaction name is required"); return; }
    const estimated = parseFloat(estimatedCost);
    if (isNaN(estimated) || estimated <= 0) { Alert.alert("Error", "Please enter a valid estimated cost"); return; }
    const real = realCost ? parseFloat(realCost) : undefined;
    if (realCost && (isNaN(real!) || real! <= 0)) { Alert.alert("Error", "Please enter a valid real cost"); return; }

    setIsLoading(true);
    try {
      await projectService.updateTransaction(user.id, projectId, transactionId, {
        name: name.trim(),
        description: description.trim() || undefined,
        estimatedCost: estimated,
        realCost: real,
        walletId: real ? selectedWalletId : undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          if (!user?.id || !projectId || !transactionId) return;
          setIsDeleting(true);
          try {
            await projectService.deleteTransaction(user.id, projectId, transactionId);
            Alert.alert("Deleted", "Transaction deleted", [{ text: "OK", onPress: () => router.back() }]);
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete transaction");
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Building Materials" />
        <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Details about this cost" />
        <Input label="Estimated Cost" value={estimatedCost} onChangeText={setEstimatedCost} placeholder="0" keyboardType="decimal-pad" />
        <Input label="Real Cost (optional)" value={realCost} onChangeText={setRealCost} placeholder="Leave blank if not yet spent" keyboardType="decimal-pad" />

        {realCost !== "" && wallets.length > 0 && (
          <>
            <Text className="text-sm font-semibold text-gray-700 mt-4 mb-2">Deduct from Wallet (optional)</Text>
            <View className="gap-2">
              <TouchableOpacity
                className={`rounded-xl p-3.5 border ${!selectedWalletId ? "bg-indigo-50 border-indigo-500" : "bg-white border-gray-200"}`}
                onPress={() => setSelectedWalletId(undefined)}
              >
                <Text className={`text-sm font-medium ${!selectedWalletId ? "text-indigo-600" : "text-gray-700"}`}>None</Text>
              </TouchableOpacity>
              {wallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  className={`rounded-xl p-3.5 border-l-4 border border-gray-200 ${selectedWalletId === wallet.id ? "bg-indigo-50" : "bg-white"}`}
                  style={{ borderLeftColor: wallet.color || "#4f46e5" }}
                  onPress={() => setSelectedWalletId(wallet.id)}
                >
                  <Text className={`text-sm font-medium ${selectedWalletId === wallet.id ? "text-indigo-600" : "text-gray-700"}`}>
                    {wallet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Button title={isLoading ? "Saving..." : "Save Changes"} onPress={handleUpdate} disabled={isLoading || isDeleting} className="mt-6" />
        <Button title={isDeleting ? "Deleting..." : "Delete Transaction"} onPress={handleDelete} disabled={isLoading || isDeleting} variant="outline" className="mt-3" />
      </View>
    </ScrollView>
  );
}