import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";

export default function HomeTab() {
  const { user, logout, isLoading } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.username}>{user?.username || "User"}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
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

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Tip: Tap on a wallet to add transactions and view details
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#4f46e5",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#c7d2fe",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  quickActions: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3b82f6",
    lineHeight: 18,
  },
});
