import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { walletService } from "@/services/wallet.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import type { WalletAutomaticIncome } from "@/types/wallet.types";

const INCOME_TYPES = [
  { value: "NOT_SPECIFIED", label: "None" },
  { value: "MENSUAL", label: "Monthly" },
] as const;

export default function AutomaticIncomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<"NOT_SPECIFIED" | "MENSUAL">("NOT_SPECIFIED");
  const [amount, setAmount] = useState("");
  const [paymentDay, setPaymentDay] = useState("1");

  useEffect(() => {
    // Could fetch current automatic income settings here if needed
  }, [id, user?.id]);

  const handleSave = async () => {
    if (!user?.id || !id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (selectedType !== "NOT_SPECIFIED" && !amount) {
      Alert.alert("Validation Error", "Please enter an amount");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (selectedType !== "NOT_SPECIFIED" && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      Alert.alert("Validation Error", "Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      
      const automaticIncome: WalletAutomaticIncome = {
        type: selectedType,
        amount: selectedType !== "NOT_SPECIFIED" ? parsedAmount : 0,
        paymentDay: selectedType !== "NOT_SPECIFIED" ? parseInt(paymentDay, 10) : undefined,
      };

      await walletService.updateAutomaticIncome(user.id, id, automaticIncome);
      
      Alert.alert("Success", "Automatic income settings saved!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save automatic income");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Automatic Income
          </Text>
          <Text className="text-base text-gray-500">
            Set up recurring income for this wallet (Premium)
          </Text>
        </View>

        <View className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <Text className="text-amber-800 font-medium">Premium Feature</Text>
          <Text className="text-amber-700 text-sm mt-1">
            Automatic income helps you track regular income like salary or rent.
          </Text>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-800 mb-3">
            Income Frequency
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {INCOME_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                className={`flex-1 min-w-[45%] p-4 rounded-xl border-2 ${
                  selectedType === type.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-gray-50"
                }`}
                onPress={() => setSelectedType(type.value)}
              >
                <Text
                  className={`text-center font-medium ${
                    selectedType === type.value
                      ? "text-indigo-600"
                      : "text-gray-600"
                  }`}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedType !== "NOT_SPECIFIED" && (
          <>
            <Input
              label="Amount"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              icon="cash-outline"
            />

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-800 mb-3">
                Payment Day of Month
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[1, 5, 10, 15, 20, 25].map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`w-12 h-12 rounded-xl border-2 justify-center items-center ${
                      paymentDay === day.toString()
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    onPress={() => setPaymentDay(day.toString())}
                  >
                    <Text
                      className={`font-medium ${
                        paymentDay === day.toString()
                          ? "text-indigo-600"
                          : "text-gray-600"
                      }`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-gray-600 text-sm">
                This wallet will automatically receive {amount ? `$${amount}` : "$0"} 
                {" "}every month on day {paymentDay}.
              </Text>
            </View>
          </>
        )}

        <View className="flex-row gap-3 mt-6">
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
            className="flex-1"
          />
          <Button
            title="Save"
            onPress={handleSave}
            loading={isLoading}
            className="flex-1"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
