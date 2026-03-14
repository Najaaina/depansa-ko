import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import {
  notificationService,
  type NotificationSettings,
  type NotificationRecurrence,
} from "@/services/notification.service";

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    dailyReminder: true,
    reminderTime: "20:00",
    dailyExpenseNotification: true,
    goalReminder: true,
    recurrence: "daily",
    expenseDays: 7,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await notificationService.initialize();
        const loaded = await notificationService.loadSettings();
        setSettings(loaded);
        setIsAvailable(notificationService.isNotificationsAvailable());
      } catch (error) {
        console.error("Error initializing notifications:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  const updateSetting = async (
    key: keyof NotificationSettings,
    value: boolean | string | number,
  ) => {
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
    } catch {
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

  const recurrenceOptions: { label: string; value: NotificationRecurrence }[] =
    [
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
    ];

  const expenseDaysOptions = [3, 7, 14, 30];

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  if (!isAvailable) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-8 mt-16">
          <Ionicons
            name="notifications-off-outline"
            size={64}
            color="#d1d5db"
          />
          <Text className="text-xl font-semibold text-gray-700 mt-4">
            Notifications Not Available
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2 leading-5">
            Push notifications require a physical device with expo-notifications
            configured.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Enable */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Push Notifications
        </Text>
        <View className="bg-white rounded-xl px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-base font-medium text-gray-800">
                Enable Notifications
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Receive push notifications for your finances
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(v) => updateSetting("enabled", v)}
              trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
            />
          </View>
        </View>
      </View>

      {settings.enabled && (
        <>
          {/* Recurrence */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Recurrence
            </Text>
            <View className="bg-white rounded-xl px-4 py-4">
              <View className="flex-row flex-wrap gap-2">
                {recurrenceOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    className={`px-4 py-2 rounded-full border ${settings.recurrence === opt.value ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"}`}
                    onPress={() => updateSetting("recurrence", opt.value)}
                  >
                    <Text
                      className={`text-sm font-medium ${settings.recurrence === opt.value ? "text-white" : "text-gray-600"}`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Expense tracking window */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
              Expense Tracking Window
            </Text>
            <Text className="text-sm text-gray-400 mb-2">
              Number of days to count expenses over
            </Text>
            <View className="bg-white rounded-xl px-4 py-4">
              <View className="flex-row flex-wrap gap-2">
                {expenseDaysOptions.map((days) => (
                  <TouchableOpacity
                    key={days}
                    className={`px-4 py-2 rounded-full border ${settings.expenseDays === days ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"}`}
                    onPress={() => updateSetting("expenseDays", days)}
                  >
                    <Text
                      className={`text-sm font-medium ${settings.expenseDays === days ? "text-white" : "text-gray-600"}`}
                    >
                      {days}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Daily summary */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Daily Summary
            </Text>
            <View className="bg-white rounded-xl px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-medium text-gray-800">
                    Expense Summary
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    Get a summary of your expenses
                  </Text>
                </View>
                <Switch
                  value={settings.dailyExpenseNotification}
                  onValueChange={(v) =>
                    updateSetting("dailyExpenseNotification", v)
                  }
                  trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                />
              </View>
              {settings.dailyExpenseNotification && (
                <>
                  <View className="h-px bg-gray-100 my-4" />
                  <Text className="text-sm font-medium text-gray-800 mb-3">
                    Reminder Time
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {reminderTimes.map((time) => (
                      <TouchableOpacity
                        key={time.value}
                        className={`px-4 py-2 rounded-full border ${settings.reminderTime === time.value ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"}`}
                        onPress={() =>
                          updateSetting("reminderTime", time.value)
                        }
                      >
                        <Text
                          className={`text-sm font-medium ${settings.reminderTime === time.value ? "text-white" : "text-gray-600"}`}
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

          {/* Goals */}
          <View className="px-4 pt-4 pb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Goals
            </Text>
            <View className="bg-white rounded-xl px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-medium text-gray-800">
                    Goal Reminders
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    Get notified when goals are reached
                  </Text>
                </View>
                <Switch
                  value={settings.goalReminder}
                  onValueChange={(v) => updateSetting("goalReminder", v)}
                  trackColor={{ false: "#e5e7eb", true: "#3b82f6" }}
                />
              </View>
            </View>
          </View>

          <View className="px-4 pt-4 pb-2">
            <Button
              title="Send Test Notification"
              onPress={testNotification}
              variant="outline"
            />
          </View>
        </>
      )}

      <View className="flex-row items-start px-4 py-4 mt-2 mb-6 gap-2">
        <Ionicons name="information-circle-outline" size={20} color="#9ca3af" />
        <Text className="flex-1 text-sm text-gray-400 leading-5">
          Push notifications require a physical device. They won't work on
          emulators.
        </Text>
      </View>
    </ScrollView>
  );
}
