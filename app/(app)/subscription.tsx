import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  settingsService,
  type SubscriptionPlan,
} from "@/services/settings.service";

const FREE_PERKS = [
  { icon: "wallet-outline", label: "Unlimited wallets" },
  { icon: "pricetag-outline", label: "Transaction labels" },
  { icon: "trending-up-outline", label: "Financial goals" },
  { icon: "repeat-outline", label: "Automatic income" },
];

const PREMIUM_PERKS = [
  { icon: "folder-outline", label: "Project budget management" },
  { icon: "stats-chart-outline", label: "Advanced statistics & reports" },
  { icon: "notifications-outline", label: "Custom notification schedules" },
  { icon: "cloud-upload-outline", label: "Data export (CSV, PDF)" },
];

export default function SubscriptionScreen() {
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    settingsService.initialize().then(() => {
      setPlan(settingsService.getSettings().subscription);
      setIsInitialized(true);
    });
  }, []);

  const handleUpgrade = () => {
    Alert.alert(
      "Upgrade to Premium",
      "Are you sure you want to upgrade to the Premium plan?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upgrade",
          onPress: async () => {
            await settingsService.setSettings({ subscription: "premium" });
            setPlan("premium");
            Alert.alert(
              "Welcome to Premium!",
              "You now have access to all premium features.",
            );
          },
        },
      ],
    );
  };

  const handleDowngrade = () => {
    Alert.alert(
      "Downgrade to Free",
      "You will lose access to premium features. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Downgrade",
          style: "destructive",
          onPress: async () => {
            await settingsService.setSettings({ subscription: "free" });
            setPlan("free");
          },
        },
      ],
    );
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Current plan badge */}
      <View className="items-center pt-6 pb-2">
        <View
          className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full mb-2 ${plan === "premium" ? "bg-amber-100" : "bg-gray-100"}`}
        >
          <Ionicons
            name={plan === "premium" ? "star" : "person-outline"}
            size={18}
            color={plan === "premium" ? "#f59e0b" : "#6b7280"}
          />
          <Text
            className={`text-base font-bold ${plan === "premium" ? "text-amber-600" : "text-gray-500"}`}
          >
            {plan === "premium" ? "Premium" : "Free"}
          </Text>
        </View>
        <Text className="text-sm text-gray-400">Your current plan</Text>
      </View>

      {/* Free plan */}
      <View
        className={`bg-white rounded-2xl mx-4 mt-4 p-5 border-2 ${plan === "free" ? "border-blue-500" : "border-transparent"}`}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">Free</Text>
          <Text className="text-base font-semibold text-gray-500">
            €0 / month
          </Text>
        </View>
        <View className="gap-3">
          {FREE_PERKS.map((perk) => (
            <View key={perk.label} className="flex-row items-center gap-2.5">
              <Ionicons name={perk.icon as any} size={18} color="#10b981" />
              <Text className="text-sm text-gray-600">{perk.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Premium plan */}
      <View
        className={`bg-indigo-600 rounded-2xl mx-4 mt-4 p-5 border-2 ${plan === "premium" ? "border-blue-300" : "border-transparent"}`}
      >
        <View className="self-start bg-amber-200 px-2.5 py-1 rounded-xl mb-3">
          <Text className="text-xs font-bold text-amber-800 tracking-wide">
            RECOMMENDED
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-white">Premium</Text>
          <Text className="text-base font-semibold text-amber-200">
            €4.99 / month
          </Text>
        </View>
        <Text className="text-sm text-indigo-200 mb-3">
          Everything in Free, plus:
        </Text>
        <View className="gap-3">
          {PREMIUM_PERKS.map((perk) => (
            <View key={perk.label} className="flex-row items-center gap-2.5">
              <Ionicons name={perk.icon as any} size={18} color="#fde68a" />
              <Text className="text-sm text-white">{perk.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View className="px-4 pt-6 pb-10">
        {plan === "free" ? (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-indigo-600 rounded-2xl py-4"
            onPress={handleUpgrade}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={18} color="#fff" />
            <Text className="text-base font-bold text-white">
              Upgrade to Premium
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="items-center py-3"
            onPress={handleDowngrade}
            activeOpacity={0.7}
          >
            <Text className="text-sm text-gray-400">Downgrade to Free</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
