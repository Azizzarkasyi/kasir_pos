import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

      <Stack.Screen name="auth/Login/login" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth/Register/select-country"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="auth/Register/register" options={{ headerShown: false }} />
      <Stack.Screen name="auth/Register/verify-otp" options={{ headerShown: false }} />

      {/* Dashboard */}
      <Stack.Screen name="dashboard/home/index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard/notification/index" options={{ headerShown: false, title: "Notifikasi" }} />
      <Stack.Screen name="dashboard/select-branch/index" options={{ headerShown: true, title: "Pilih Outlet" }} />
    </Stack>
  );
}
