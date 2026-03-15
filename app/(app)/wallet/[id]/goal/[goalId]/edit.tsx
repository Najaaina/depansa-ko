import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { Goal, GoalIcon, UpdateGoal } from "@/types/goal.types";
import { cn } from "@/lib/utils";
import { goalFormSchema } from "@/schemas/goal.schemas";
import { goalService } from "@/services/goal.service";
import { Wallet } from "@/types/wallet.types";
import { walletService } from "@/services/wallet.service";

const GOAL_ICONS: { value: GoalIcon; icon: string }[] = [
  { value: "HEART", icon: "heart-outline" },
  { value: "CASH", icon: "cash-outline" },
  { value: "STAR", icon: "star" },
];

const COLORS = [
  "#00ff00",
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
];

export default function EditGoalScreen() {
  const { id, goalId } = useLocalSearchParams<{ id: string; goalId: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<GoalIcon>("CASH");
  const [selectedColor, setSelectedColor] = useState("#00ff00");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet>(wallets[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [amount, setAmount] = useState("");
  const defaultSartDate = new Date();
  const defaultEndDate = new Date(defaultSartDate.getDate() + 1);

  const {
    fields,
    setFieldValue,
    setFieldTouched,
    validateForm,
    isFormValid,
    getValues,
  } = useFormValidation({
    schema: goalFormSchema,
    initialValues: {
      name: "",
      amount: "",
      startingDate: "",
      endingDate: "",
    },
  });

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      console.log("No user ID found");
      return;
    }

    try {
      console.log(`Fetching wallets and goal ${goalId} for user: ${user.id}`);
      const goalData = await goalService.getOne(user.id, id, goalId);
      console.log("Goal response:", goalData);
      const walletData = await walletService.getAll(user.id);
      console.log("Wallets response:", walletData);
      setWallets(walletData.values);
      setGoal(goalData);
      setSelectedWallet(walletData.values[0]);
      if (walletData.values.length < 1) {
        Alert.alert("No Wallet", "Please create a new wallet first");
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching data...");
      fetchData();
    }, [fetchData]),
  );

  const handleUpdateGoal = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all fields correctly");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0");
      return;
    }
    try {
      setIsLoading(true);
      const values = getValues();

      const goalData: UpdateGoal = {
        id: goalId,
        accountId: user.id,
        walletId: selectedWallet.id,
        name: values.name || "",
        iconRef: selectedType,
        amount: parsedAmount,
        startingDate:
          new Date(values.startingDate as any).toISOString() ||
          defaultSartDate.toISOString(),
        endingDate:
          new Date(values.endingDate as any).toISOString() ||
          defaultEndDate.toISOString(),
        color: selectedColor,
      };

      await goalService.update(user.id, id, goalId, goalData);

      Alert.alert("Success", "Goal updated successfully!", [
        { text: "OK", onPress: () => router.replace(`/goal`) },
      ]);
    } catch (error: any) {
      console.error("Error updating goal:", error);
      if (error.status === 401 || error.status === 403) {
        Alert.alert("Error", "Session expired. Please login again.");
      } else {
        Alert.alert("Error", error || "Failed to update goal");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = (type: GoalIcon) => {
    setSelectedType(type);
    setFieldValue("iconRef", type);
  };

  const handleWalletSelect = (type: Wallet) => {
    setSelectedWallet(type);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setFieldValue("color", color);
  };

  return (
    <KeyboardAvoidingView
      className={cn("flex-1", "bg-white")}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow p-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text
            className={cn("text-3xl", "font-bold", "text-gray-800", "mb-2")}
          >
            Update Goal
          </Text>
          <Text className={cn("text-base", "text-gray-500")}>
            Update information about your Goal
          </Text>
        </View>

        <View className="w-full">
          <Input
            label="Goal Name"
            placeholder="e.g., Work, Food"
            value={fields.name?.value || ""}
            onChangeText={(value) => setFieldValue("name", value)}
            onBlur={() => setFieldTouched("name")}
            error={fields.name?.error}
            touched={fields.name?.touched}
          />

          <Input
            label="Goal To Reach"
            placeholder="20.00"
            value={amount}
            onChangeText={setAmount}
            onBlur={() => setFieldTouched("amount")}
            error={fields.amount?.error}
            touched={fields.amount?.touched}
            keyboardType="decimal-pad"
          />

          <Input
            label="Starting Date"
            placeholder="YYYY-MM-DD"
            value={fields.startingDate?.value || ""}
            onChangeText={(value) => setFieldValue("startingDate", value)}
            onBlur={() => setFieldTouched("startingDate")}
            error={fields.startingDate?.error}
            touched={fields.startingDate?.touched}
          />

          <Input
            label="Ending Date"
            placeholder="YYYY-MM-DD"
            value={fields.endingDate?.value || ""}
            onChangeText={(value) => setFieldValue("endingDate", value)}
            onBlur={() => setFieldTouched("endingDate")}
            error={fields.endingDate?.error}
            touched={fields.endingDate?.touched}
          />

          <View className="mb-5">
            <Text
              className={cn(
                "text-sm",
                "font-semibold",
                "text-gray-800",
                "mb-3",
              )}
            >
              Wallet To Track {wallets.length < 1 ? "(no wallets yet)" : ""}
            </Text>
            <View className={cn("flex-row", "flex-wrap", "gap-2")}>
              {wallets.map((type) => (
                <TouchableOpacity
                  key={type.name}
                  className={`flex-1 min-w-[20%] p-4 flex-row item-center justify-center rounded-xl border-2 ${
                    selectedWallet != undefined &&
                    selectedWallet.name === type.name
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onPress={() => handleWalletSelect(type)}
                >
                  <Ionicons
                    name={(type.iconRef as any) || "pricetag"}
                    size={16}
                    color="#666666"
                  />
                  <Text
                    className={cn(
                      "text-sm",
                      "font-semibold",
                      "text-gray-800",
                      "mb-3",
                    )}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text
              className={cn(
                "text-sm",
                "font-semibold",
                "text-gray-800",
                "mb-3",
              )}
            >
              Goal icon
            </Text>
            <View className={cn("flex-row", "flex-wrap", "gap-2")}>
              {GOAL_ICONS.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`flex-1 min-w-[20%] p-4 flex-row item-center justify-center rounded-xl border-2 ${
                    selectedType === type.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onPress={() => handleTypeSelect(type.value)}
                >
                  <Ionicons name={type.icon as any} size={16} color="#666666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text
              className={cn(
                "text-sm",
                "font-semibold",
                "text-gray-800",
                "mb-3",
              )}
            >
              Goal Color
            </Text>
            <View className={cn("flex-row", "flex-wrap", "gap-3")}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-12 h-12 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-gray-800 scale-110"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </View>
          </View>

          <View className={cn("flex-row", "gap-3", "mt-36")}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              className="flex-1"
            />
            <Button
              title="Update Goal"
              onPress={handleUpdateGoal}
              loading={isLoading}
              disabled={!isFormValid()}
              className="flex-1"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
