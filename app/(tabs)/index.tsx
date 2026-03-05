import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";

export default function HomeTab() {
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-indigo-600 pt-16 pb-8 px-5 items-center">
        <View className="w-16 h-16 rounded-full bg-white/20 justify-center items-center mb-3">
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <Text className="text-indigo-200 text-sm">Welcome back,</Text>
        <Text className="text-white text-2xl font-bold">{user?.username || "User"}</Text>
      </View>

      <View className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-gray-800 font-semibold mb-3">Quick Actions</Text>
          
          <Button
            title="View Wallets"
            onPress={() => router.push("/wallet")}
            className="mb-3"
          />
          
          <Button
            title="Add Transaction"
            onPress={() => router.push("/wallet")}
            variant="outline"
          />
        </View>

        <View className="bg-blue-50 flex-row items-start p-3 rounded-xl gap-2">
          <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
          <Text className="text-blue-600 text-sm flex-1">
            Tip: Tap on a wallet to add transactions and view details
          </Text>
        </View>
      </View>
    </View>
  );
}
