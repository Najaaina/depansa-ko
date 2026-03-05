import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { notificationService, type NotificationSettings } from "@/services/notification.service";
import { settingsService, CURRENCIES, type Currency, type AppSettings } from "@/services/settings.service";

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
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons name={icon as any} size={22} color={danger ? "#ef4444" : "#3b82f6"} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
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
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.card}>
            <SettingItem
              icon="cash-outline"
              title="Currency"
              subtitle={`${currency.symbol} ${currency.code}`}
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
              icon="person-outline"
              title="Username"
              subtitle={user?.username || "Unknown"}
              showArrow={false}
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            loading={isLoading}
            className="mt-4"
          />
        </View>

        <View style={styles.version}>
          <Text style={styles.versionText}>Depansa++ v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  screenHeader: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  scrollContent: {
    flex: 1,
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
  settingIconDanger: {
    backgroundColor: "#fee2e2",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  settingTitleDanger: {
    color: "#ef4444",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  version: {
    alignItems: "center",
    padding: 24,
  },
  versionText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
