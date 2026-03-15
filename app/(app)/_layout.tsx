import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFF" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          headerTitle: "Settings",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="notification-settings"
        options={{
          headerShown: true,
          headerTitle: "Notification Settings",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="currency-settings"
        options={{
          headerShown: true,
          headerTitle: "Currency",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          headerShown: true,
          headerTitle: "Subscription",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="label/index"
        options={{
          headerShown: true,
          headerTitle: "My Labels",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="wallet/index"
        options={{
          headerShown: true,
          headerTitle: "My Wallets",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="label/create"
        options={{
          headerShown: true,
          headerTitle: "Create Label",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="wallet/create"
        options={{
          headerShown: true,
          headerTitle: "Create Wallet",
          headerBackTitle: "Back",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="wallet/[id]"
        options={{
          headerShown: true,
          headerTitle: "Wallet Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="label/[id]"
        options={{
          headerShown: true,
          headerTitle: "Label Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="wallet/[id]/edit"
        options={{
          headerShown: true,
          headerTitle: "Edit Wallet",
          headerBackTitle: "Back",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="label/[id]/edit"
        options={{
          headerShown: true,
          headerTitle: "Edit label",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="wallet/[id]/automatic-income"
        options={{
          headerShown: true,
          headerTitle: "Automatic Income",
          headerBackTitle: "Back",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="wallet/[id]/add-transaction"
        options={{
          headerShown: true,
          headerTitle: "Add Transaction",
          headerBackTitle: "Back",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="wallet/[id]/edit-transaction"
        options={{
          headerShown: true,
          headerTitle: "Edit Transaction",
          headerBackTitle: "Back",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="wallet/[id]/calendar"
        options={{
          headerShown: true,
          headerTitle: "Calendar",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="wallet/[id]/statistics"
        options={{
          headerShown: true,
          headerTitle: "Statistics",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}