import {Stack} from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}} />
      <Stack.Screen name="auth/Login/login" options={{headerShown: false}} />
      <Stack.Screen
        name="auth/Register/select-country"
        options={{headerShown: false}}
      />
      <Stack.Screen name="auth/Register/register" options={{headerShown: false}} />
      <Stack.Screen name="auth/Register/verify-otp" options={{headerShown: false}} />
    </Stack>
  );
}
