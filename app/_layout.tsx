import "../global.css";
import { useEffect, useState } from "react";
import { Slot, router, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { View, ActivityIndicator } from "react-native";
import SplashScreen from "./splash";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";

WebBrowser.maybeCompleteAuthSession();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const [splashDone, setSplashDone] = useState(false);

  // Redirect to goal when tapping a goal deadline notification
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === "goal_deadline" && data?.goalId) {
        router.push(`/goal`);
      }
    });
    return () => subscription.remove();
  }, []);

  // Navigation — se déclenche quand splash ET auth sont prêts
  useEffect(() => {
    if (!splashDone || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [splashDone, isAuthenticated, isLoading, segments]);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <RootLayoutNav />
      </CurrencyProvider>
    </AuthProvider>
  );
}