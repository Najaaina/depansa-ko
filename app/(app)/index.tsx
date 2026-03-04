import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import WalletIcon from "@/components/icons/WalletIcon";
import ChevronRight from "@/components/icons/ChevronRight";
import CreateWalletIcon from "@/components/icons/CreateWalletIcon";
import SignOutIcon from "@/components/icons/SignOutIcon";


export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();

  const shortId = user?.id
    ? String(user.id).slice(0, 10) + "..."
    : "—";

  return (
    <LinearGradient
      colors={["#eeeef8", "#f5f4fc", "#f0f4ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Welcome to{" "}
            <Text style={styles.headerBold}>Depansa</Text>
          </Text>
          <Text style={styles.headerSub}>You're successfully logged in</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.userRow}>
            <Text style={styles.userLabel}>USERNAME</Text>
            <Text style={styles.userValue}>{user?.username ?? "—"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.userRow}>
            <Text style={styles.userLabel}>USER ID</Text>
            <Text style={styles.userValue}>{shortId}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* My Wallets */}
          <TouchableOpacity
            onPress={() => router.push("/wallet")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#eae8f8", "#e4e2f5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCard}
            >
              <View style={styles.actionIcon}>
                <WalletIcon color="#6c5ce7" />
              </View>
              <Text style={[styles.actionLabel, { color: "#5b4fcf" }]}>
                My Wallets
              </Text>
              <ChevronRight color="#6c5ce7" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Create Wallet */}
          <TouchableOpacity
            onPress={() => router.push("/wallet/create")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#ddeeff", "#d6eaff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCard}
            >
              <View style={styles.actionIcon}>
                <CreateWalletIcon color="#3b82f6" />
              </View>
              <Text style={[styles.actionLabel, { color: "#2563eb" }]}>
                Create Wallet
              </Text>
              <ChevronRight color="#3b82f6" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
        <Button
          title="My Labels"
          onPress={() => router.push("/label")}
        />

        <Button
          title="My Wallets"
          onPress={() => router.push("/wallet")}
        />
        
        <Button
          title="Create Wallet"
          onPress={() => router.push("/wallet/create")}
        />
        
        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={logout}
          disabled={isLoading}
          style={styles.signOut}
          activeOpacity={0.6}
        >
          <SignOutIcon />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "400",
    color: "#1a1a2e",
    lineHeight: 40,
  },
  headerBold: {
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 15,
    color: "#9892b8",
    marginTop: 6,
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 36,
    shadowColor: "#c4bef0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0eef8",
  },
  userLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#a09bc0",
    letterSpacing: 1.2,
  },
  userValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  actions: {
    gap: 14,
    marginBottom: 48,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 15,
    color: "#9ca3af",
    fontWeight: "500",
  },
});
