import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";
import { labelService } from "@/services/label.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Label } from "@/types/label.types";
import type { TransactionType } from "@/types/transaction.types";
import { AlertCircle, CheckCircle2 } from "lucide-react-native";

export default function AddTransactionScreen() {
  const { id: walletId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TransactionType>("OUT");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage("Failed to load labels");
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

  const handleDateChange = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate.toISOString().split("T")[0]);
    setShowDatePicker(false);
  };

  const formatDisplayDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user?.id || !walletId) {
      setErrorMessage("Missing required information. Please try logging in again.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0");
      return;
    }

    const transactionLabels = selectedLabels.map(id => ({ id }));

    setIsLoading(true);
    try {
      await transactionService.create(user.id, walletId, {
        walletId,
        amount: parsedAmount,
        type,
        description: description || undefined,
        date,
        labels: transactionLabels,
      });
      
      setSuccessMessage(
        type === "IN" 
          ? `Income of $${parsedAmount.toFixed(2)} has been added to your wallet.`
          : `Expense of $${parsedAmount.toFixed(2)} has been recorded.`
      );
      
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("Transaction error:", error);
      const errorMsg = error.message || "Failed to create transaction";
      
      if (errorMsg.includes("label")) {
        setErrorMessage("One or more labels are invalid. Please refresh and try again.");
      } else if (error.status === 401) {
        setErrorMessage("Please log in again.");
      } else if (error.status === 404) {
        setErrorMessage("Wallet not found. Please refresh and try again.");
      } else if (error.status === 500) {
        setErrorMessage("Something went wrong on the server. Please try again later.");
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {successMessage && (
          <Alert icon={CheckCircle2} variant="default" className="mb-4 bg-green-50 border-green-200">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert icon={AlertCircle} variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Text style={styles.label}>Transaction Type</Text>
        <Tabs value={type} onValueChange={(val) => setType(val as TransactionType)} className="w-full mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="OUT" className="flex-1">
              <Text className={type === "OUT" ? "text-white" : "text-red-500"}>Expense</Text>
            </TabsTrigger>
            <TabsTrigger value="IN" className="flex-1">
              <Text className={type === "IN" ? "text-white" : "text-green-500"}>Income</Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>

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

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            <TouchableOpacity style={styles.dateOption} onPress={() => handleDateChange(0)}>
              <Text style={styles.dateOptionText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateOption} onPress={() => handleDateChange(-1)}>
              <Text style={styles.dateOptionText}>Yesterday</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateOption} onPress={() => handleDateChange(-7)}>
              <Text style={styles.dateOptionText}>Last Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateOption} onPress={() => handleDateChange(-30)}>
              <Text style={styles.dateOptionText}>Last Month</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Labels (optional)</Text>
        {isLoadingLabels ? (
          <Text>Loading labels...</Text>
        ) : labels.length === 0 ? (
          <View style={styles.noLabels}>
            <Text style={styles.noLabelsText}>No labels available</Text>
            <Text style={styles.noLabelsHint}>You can add a transaction without labels</Text>
          </View>
        ) : (
          <View style={styles.labelsContainer}>
            {labels.map((label) => (
              <Toggle
                key={label.id}
                pressed={selectedLabels.includes(label.id!)}
                onPressedChange={() => toggleLabel(label.id!)}
                variant="outline"
                className="flex-row items-center gap-2"
              >
                <View style={[styles.labelDot, { backgroundColor: label.color || "#3b82f6" }]} />
                <Text>{label.name}</Text>
              </Toggle>
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
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  dateButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#374151",
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  dateOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dateOptionText: {
    fontSize: 14,
    color: "#374151",
  },
});