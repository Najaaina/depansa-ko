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
        name="wallet/index"
        options={{
          headerShown: true,
          headerTitle: "My Wallets",
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
        name="wallet/[id]/edit"
        options={{
          headerShown: true,
          headerTitle: "Edit Wallet",
          headerBackTitle: "Back",
          presentation: "modal",
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
    </Stack>
  );
}
