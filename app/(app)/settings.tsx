import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { notificationService } from "@/services/notification.service";
import { settingsService, type SubscriptionPlan } from "@/services/settings.service";
import { useCurrency } from "@/context/CurrencyContext";

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, showArrow = true }: SettingItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 border-b border-gray-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
        <Ionicons name={icon as any} size={22} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-800">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { currency } = useCurrency();
  const [subscription, setSubscription] = useState<SubscriptionPlan>("free");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await settingsService.initialize();
        setSubscription(settingsService.getSettings().subscription);
        await notificationService.initialize();
        const notifSettings = await notificationService.loadSettings();
        setNotificationsEnabled(notifSettings.enabled);
        setIsInitialized(true);
      };
      init();
    }, [])
  );

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">General</Text>
        <View className="bg-white rounded-xl overflow-hidden">
          <SettingItem
            icon="cash-outline"
            title="Currency"
            subtitle={`${currency.symbol} ${currency.code}`}
            onPress={() => router.push("/currency-settings")}
          />
          <SettingItem
            icon="star-outline"
            title="Subscription"
            subtitle={subscription === "premium" ? "Premium ✨" : "Free plan"}
            onPress={() => router.push("/subscription")}
          />
        </View>
      </View>

      <View className="px-4 pt-4 pb-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Notifications</Text>
        <View className="bg-white rounded-xl overflow-hidden">
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
            onPress={() => router.push("/notification-settings")}
          />
        </View>
      </View>

      <View className="px-4 pt-4 pb-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Account</Text>
        <View className="bg-white rounded-xl overflow-hidden">
          <SettingItem
            icon="wallet-outline"
            title="My Wallets"
            subtitle="Manage your wallets"
            onPress={() => router.push("/wallet")}
          />
        </View>
      </View>

      <View className="px-4 pt-4 pb-8">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">About</Text>
        <View className="bg-white rounded-xl overflow-hidden">
          <SettingItem
            icon="information-circle-outline"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
            onPress={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  );
}