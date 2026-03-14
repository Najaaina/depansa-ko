import { storageService } from "./storage.service";

export type NotificationRecurrence = "daily" | "weekly";

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  dailyExpenseNotification: boolean;
  goalReminder: boolean;
  recurrence: NotificationRecurrence;
  expenseDays: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyReminder: true,
  reminderTime: "20:00",
  dailyExpenseNotification: true,
  goalReminder: true,
  recurrence: "daily",
  expenseDays: 7,
};

const SETTINGS_KEY = "notification_settings";

let Notifications: any = null;
let Device: any = null;

const loadModules = async () => {
  if (Notifications) return true;
  try {
    const notifModule = await import("expo-notifications");
    Notifications = notifModule;
    const deviceModule = await import("expo-device");
    Device = deviceModule;
    return true;
  } catch (error) {
    console.log("Notifications module not available:", error);
    return false;
  }
};

class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private isAvailable: boolean = false;

  async initialize(): Promise<void> {
    try {
      this.isAvailable = await loadModules();
      
      if (!this.isAvailable) {
        console.log("Notifications not available on this platform");
        return;
      }

      if (!Device.isDevice) {
        console.log("Notifications require a physical device");
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("daily-expenses", {
          name: "Daily Expenses",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3b82f6",
        });
      }

      await this.loadSettings();
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  }

  async loadSettings(): Promise<NotificationSettings> {
    try {
      const stored = await storageService.get(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
    return this.settings;
  }

  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      this.settings = settings;
      await storageService.set(SETTINGS_KEY, JSON.stringify(settings));

      if (this.isAvailable && settings.enabled) {
        await this.scheduleDailyExpenseNotification(settings);
      } else if (this.isAvailable) {
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  }

  getSettings(): NotificationSettings {
    return this.settings;
  }

  isNotificationsAvailable(): boolean {
    return this.isAvailable;
  }

  async scheduleTestNotification(): Promise<void> {
    if (!this.isAvailable) {
      console.log("Notifications not available");
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "Notifications are working!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.IMMEDIATE,
        },
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }

  async scheduleDailyExpenseNotification(settings: NotificationSettings): Promise<void> {
    if (!this.isAvailable || !settings.enabled || !settings.dailyExpenseNotification) {
      return;
    }

    try {
      await this.cancelAllNotifications();

      const [hours, minutes] = settings.reminderTime.split(":").map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Expense Summary",
          body: "Check your expenses for today!",
          data: { type: "daily_expense" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling notifications:", error);
    }
  }
}

import { Platform } from "react-native";
export const notificationService = new NotificationService();