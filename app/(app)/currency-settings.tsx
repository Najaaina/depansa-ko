import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CURRENCIES, type Currency } from "@/services/settings.service";
import { useCurrency } from "@/context/CurrencyContext";

export default function CurrencySettingsScreen() {
  const { currency: selectedCurrency, setCurrency } = useCurrency();

  const formatAmountExample = (currency: Currency): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
    }).format(1234.56);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Currency</Text>
        <Text style={styles.sectionDescription}>
          This will be used to display amounts throughout the app
        </Text>
        
        <View style={styles.currencyList}>
          {CURRENCIES.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyItem,
                selectedCurrency.code === currency.code && styles.currencyItemSelected,
              ]}
              onPress={() => setCurrency(currency)}
            >
              <View style={styles.currencyLeft}>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
              </View>
              <View style={styles.currencyRight}>
                <Text style={styles.currencyExample}>{formatAmountExample(currency)}</Text>
                {selectedCurrency.code === currency.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          Currency changes will be applied to all new transactions and displays.
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  currencyList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  currencyItemSelected: {
    backgroundColor: "#eff6ff",
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    width: 40,
    textAlign: "center",
  },
  currencyInfo: {
    gap: 2,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  currencyName: {
    fontSize: 13,
    color: "#6b7280",
  },
  currencyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currencyExample: {
    fontSize: 13,
    color: "#9ca3af",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    margin: 16,
    marginTop: 0,
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