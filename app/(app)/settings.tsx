import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { notificationService, type NotificationSettings } from "@/services/notification.service";
import { settingsService, CURRENCIES, type Currency, type AppSettings } from "@/services/settings.service";

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, showArrow = true }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={22} color="#3b82f6" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    dailyReminder: true,
    reminderTime: "20:00",
    dailyExpenseNotification: true,
    goalReminder: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      await settingsService.initialize();
      setCurrency(settingsService.getCurrency());
      
      await notificationService.initialize();
      const notifSettings = await notificationService.loadSettings();
      setNotificationSettings(notifSettings);
    } catch (error) {
      console.error("Error initializing settings:", error);
    } finally {
      setIsInitialized(true);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.card}>
          <SettingItem
            icon="cash-outline"
            title="Currency"
            subtitle={currency ? `${currency.symbol} ${currency.code}` : "USD"}
            onPress={() => router.push("/currency-settings")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Configure daily reminders"
            onPress={() => router.push("/notification-settings")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <SettingItem
            icon="wallet-outline"
            title="My Wallets"
            subtitle="Manage your wallets"
            onPress={() => router.push("/wallet")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    color: "#6b7280",
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
});
