import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { projectService } from "@/services/project.service";
import { walletService } from "@/services/wallet.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import type { Wallet } from "@/types/wallet.types";

export default function AddProjectTransactionScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [realCost, setRealCost] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadWallets = async () => {
      if (!user?.id) return;
      try {
        const response = await walletService.getAll(user.id);
        setWallets(response.values || []);
      } catch (error) {
        console.error("Error loading wallets:", error);
      }
    };
    loadWallets();
  }, [user?.id]);

  const handleCreate = async () => {
    if (!user?.id || !projectId) return;
    if (!name.trim()) { Alert.alert("Error", "Transaction name is required"); return; }
    const estimated = parseFloat(estimatedCost);
    if (isNaN(estimated) || estimated <= 0) { Alert.alert("Error", "Please enter a valid estimated cost"); return; }
    const real = realCost ? parseFloat(realCost) : undefined;
    if (realCost && (isNaN(real!) || real! <= 0)) { Alert.alert("Error", "Please enter a valid real cost"); return; }

    setIsLoading(true);
    try {
      await projectService.createTransaction(user.id, projectId, {
        name: name.trim(),
        description: description.trim() || undefined,
        estimatedCost: estimated,
        realCost: real,
        walletId: real ? selectedWalletId : undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create transaction");
    } finally {
      setIsLoading(false);
    }
  };

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

        <Button title={isLoading ? "Adding..." : "Add Transaction"} onPress={handleCreate} disabled={isLoading} className="mt-6" />
      </View>
    </ScrollView>
  );
}