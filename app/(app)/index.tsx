import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 p-6 justify-center">
        <Text className="text-4xl font-bold text-gray-800 mb-2 text-center">
          Welcome to Depansa!
        </Text>
        <Text className="text-base text-gray-500 text-center mb-10">
          You're successfully logged in
        </Text>

        <View className="bg-gray-50 rounded-xl p-5 mb-8">
          <View className="flex-row justify-between py-3 border-b border-gray-200">
            <Text className="text-sm font-semibold text-gray-500">
              Username:
            </Text>
            <Text className="text-sm text-gray-800 font-medium">
              {user?.username}
            </Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-gray-200">
            <Text className="text-sm font-semibold text-gray-500">
              User ID:
            </Text>
            <Text className="text-sm text-gray-800 font-medium">
              {user?.id}
            </Text>
          </View>
        </View>

        <Button
          title="Create Wallet"
          onPress={() => router.push("/wallet/create")}
        />
        
        <Button
          title="Sign Out"
          onPress={logout}
          loading={isLoading}
          variant="outline"
        />
      </View>
    </View>
  );
}
