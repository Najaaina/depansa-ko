import "../global.css";
import { useEffect, useState } from "react";
import { Slot, router, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import SplashScreen from "./splash";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession()

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isLoading || showSplash) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, isLoading, segments, showSplash]);

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          if (!isLoading) {
            setShowSplash(false);
          } else {
            const check = setInterval(() => {
              setShowSplash(false);
              clearInterval(check);
            }, 200);
          }
        }}
      />
    );
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
      <RootLayoutNav />
    </AuthProvider>
  );
}