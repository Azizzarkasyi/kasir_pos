import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors[colorScheme].background).catch(
      () => {}
    );
  }, [colorScheme]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}} />
      <Stack.Screen name="dashboard/_layout" options={{headerShown: false}} />
      <Stack.Screen name="auth/Login/login" options={{headerShown: false}} />
      <Stack.Screen
        name="auth/Register/select-country"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="auth/Register/register"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="auth/Register/verify-otp"
        options={{ headerShown: false }} />

      {/* Dashboard */}
      <Stack.Screen name="dashboard/home/index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard/notification/index" options={{ headerShown: false, title: "Notifikasi" }} />
      <Stack.Screen name="dashboard/select-branch/index" options={{ headerShown: true, title: "Pilih Outlet" }}
      />
    </Stack>
  );
}
