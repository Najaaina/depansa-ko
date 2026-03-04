import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";
import { labelService } from "@/services/label.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import type { Label } from "@/types/label.types";
import type { TransactionType } from "@/types/transaction.types";

const TRANSACTION_TYPES: { value: TransactionType; label: string; color: string; icon: string }[] = [
  { value: "OUT", label: "Expense", color: "#ef4444", icon: "arrow-up-outline" },
  { value: "IN", label: "Income", color: "#10b981", icon: "arrow-down-outline" },
];

export default function AddTransactionScreen() {
  const { walletId } = useLocalSearchParams<{ walletId: string }>();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TransactionType>("OUT");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(true);

  useEffect(() => {
    loadLabels();
  }, [user?.id]);

  const loadLabels = async () => {
    if (!user?.id) return;
    try {
      const response = await labelService.getAll(user.id);
      if (Array.isArray(response)) {
        setLabels(response);
      } else if (response?.values) {
        setLabels(response.values);
      }
    } catch (error) {
      console.error("Error loading labels:", error);
    } finally {
      setIsLoadingLabels(false);
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id || !walletId) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (selectedLabels.length === 0) {
      Alert.alert("Error", "Please select at least one label");
      return;
    }

    setIsLoading(true);
    try {
      await transactionService.create(user.id, walletId, {
        walletId,
        amount: parsedAmount,
        type,
        description: description || undefined,
        date,
        labels: selectedLabels.map(id => ({ id })),
      });
      
      Alert.alert("Success", "Transaction created successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Transaction Type</Text>
        <View style={styles.typeContainer}>
          {TRANSACTION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeButton,
                type === t.value && { backgroundColor: t.color },
              ]}
              onPress={() => setType(t.value)}
            >
              <Text style={[
                styles.typeLabel,
                type === t.value && { color: "#fff" },
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
        />

        <Input
          label="Date"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Labels (select at least one)</Text>
        {isLoadingLabels ? (
          <Text>Loading labels...</Text>
        ) : labels.length === 0 ? (
          <View style={styles.noLabels}>
            <Text style={styles.noLabelsText}>No labels available</Text>
            <Text style={styles.noLabelsHint}>Create labels first in the app</Text>
          </View>
        ) : (
          <View style={styles.labelsContainer}>
            {labels.map((label) => (
              <TouchableOpacity
                key={label.id}
                style={[
                  styles.labelChip,
                  selectedLabels.includes(label.id!) && styles.labelChipSelected,
                  { borderColor: label.color || "#3b82f6" },
                ]}
                onPress={() => toggleLabel(label.id!)}
              >
                <View style={[styles.labelDot, { backgroundColor: label.color || "#3b82f6" }]} />
                <Text style={[
                  styles.labelText,
                  selectedLabels.includes(label.id!) && styles.labelTextSelected,
                ]}>
                  {label.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          title={isLoading ? "Creating..." : "Add Transaction"}
          onPress={handleSubmit}
          disabled={isLoading}
          className="mt-6"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  labelChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  labelChipSelected: {
    backgroundColor: "#f3f4f6",
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  labelText: {
    fontSize: 14,
    color: "#374151",
  },
  labelTextSelected: {
    fontWeight: "600",
  },
  noLabels: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  noLabelsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  noLabelsHint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
});
