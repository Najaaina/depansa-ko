import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { settingsService, CURRENCIES, type Currency } from "@/services/settings.service";

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, showArrow = true, danger = false }: SettingItemProps) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100" onPress={onPress}>
      <View className={`w-10 h-10 rounded-lg justify-center items-center mr-3 ${danger ? "bg-red-100" : "bg-blue-50"}`}>
        <Ionicons name={icon as any} size={22} color={danger ? "#ef4444" : "#3b82f6"} />
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${danger ? "text-red-500" : "text-gray-800"}`}>{title}</Text>
        {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsTab() {
  const { user, logout, isLoading } = useAuth();
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      await settingsService.initialize();
      setCurrency(settingsService.getCurrency());
    } catch (error) {
      console.error("Error initializing settings:", error);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: () => logout()
        },
      ]
    );
  };

  if (!isInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100">
        <Text className="text-3xl font-bold text-gray-800">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4 pb-2">
          <Text className="text-gray-500 text-xs font-semibold uppercase mb-2 ml-1">General</Text>
          <View className="bg-white rounded-xl overflow-hidden">
            <SettingItem
              icon="cash-outline"
              title="Currency"
              subtitle={`${currency.symbol} ${currency.code}`}
              onPress={() => router.push("/currency-settings")}
            />
          </View>
        </View>

        <View className="p-4 pb-2">
          <Text className="text-gray-500 text-xs font-semibold uppercase mb-2 ml-1">Notifications</Text>
          <View className="bg-white rounded-xl overflow-hidden">
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Configure daily reminders"
              onPress={() => router.push("/notification-settings")}
            />
          </View>
        </View>

        <View className="p-4 pb-2">
          <Text className="text-gray-500 text-xs font-semibold uppercase mb-2 ml-1">Account</Text>
          <View className="bg-white rounded-xl overflow-hidden">
            <SettingItem
              icon="person-outline"
              title="Username"
              subtitle={user?.username || "Unknown"}
              showArrow={false}
              onPress={() => {}}
            />
          </View>
        </View>

        <View className="p-4">
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            loading={isLoading}
            className="mt-2"
          />
        </View>

        <View className="items-center pb-8">
          <Text className="text-gray-400 text-xs">Depansa++ v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
