import {Stack} from "expo-router";
import React, {useEffect} from "react";
import * as SystemUI from "expo-system-ui";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Colors} from "@/constants/theme";

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
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="auth/Register/register"
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="auth/Register/verify-otp"
        options={{headerShown: false}}
      />
    </Stack>
  );
}
