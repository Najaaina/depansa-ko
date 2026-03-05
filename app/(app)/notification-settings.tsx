import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { notificationService, type NotificationSettings } from "@/services/notification.service";

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    dailyReminder: true,
    reminderTime: "20:00",
    dailyExpenseNotification: true,
    goalReminder: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
      const loadedSettings = await notificationService.loadSettings();
      setSettings(loadedSettings);
      setIsAvailable(notificationService.isNotificationsAvailable());
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing notifications:", error);
      setIsInitialized(true);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await notificationService.saveSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.scheduleTestNotification();
      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const reminderTimes = [
    { label: "8:00 AM", value: "08:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "8:00 PM", value: "20:00" },
    { label: "9:00 PM", value: "21:00" },
  ];

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAvailable) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.unavailableSection}>
          <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
          <Text style={styles.unavailableTitle}>Notifications Not Available</Text>
          <Text style={styles.unavailableText}>
            Push notifications require a physical device and the expo-notifications package to be installed and configured.
          </Text>
          <Text style={styles.unavailableHint}>
            To enable notifications, install the package and configure native credentials (APNs for iOS, FCM for Android).
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications for your finances
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => updateSetting("enabled", value)}
              trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
            />
          </View>
        </View>
      </View>

      {settings.enabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Summary</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Daily Expense Summary</Text>
                  <Text style={styles.settingDescription}>
                    Get a daily summary of your expenses
                  </Text>
                </View>
                <Switch
                  value={settings.dailyExpenseNotification}
                  onValueChange={(value) => updateSetting("dailyExpenseNotification", value)}
                  trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                />
              </View>

              {settings.dailyExpenseNotification && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>Reminder Time</Text>
                      <Text style={styles.settingDescription}>
                        When to receive the daily summary
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timeOptions}>
                    {reminderTimes.map((time) => (
                      <TouchableOpacity
                        key={time.value}
                        style={[
                          styles.timeOption,
                          settings.reminderTime === time.value && styles.timeOptionSelected,
                        ]}
                        onPress={() => updateSetting("reminderTime", time.value)}
                      >
                        <Text
                          style={[
                            styles.timeOptionText,
                            settings.reminderTime === time.value && styles.timeOptionTextSelected,
                          ]}
                        >
                          {time.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Goal Reminders</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when goals are reached
                  </Text>
                </View>
                <Switch
                  value={settings.goalReminder}
                  onValueChange={(value) => updateSetting("goalReminder", value)}
                  trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Button
              title="Send Test Notification"
              onPress={testNotification}
              variant="outline"
            />
          </View>
        </>
      )}

      <View style={styles.infoSection}>
        <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
        <Text style={styles.infoText}>
          Push notifications require a physical device. They won't work on emulators or simulators.
        </Text>
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
  unavailableSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  unavailableText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  unavailableHint: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  settingDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  timeOptionSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  timeOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  timeOptionTextSelected: {
    color: "#fff",
    fontWeight: "500",
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
});
