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
        name="wallet/create"
        options={{
          headerShown: true,
          headerTitle: "Create Wallet",
          headerBackTitle: "Back",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
