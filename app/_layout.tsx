import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Stack} from "expo-router";
import * as SystemUI from "expo-system-ui";
import React, {useEffect} from "react";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors[colorScheme].background).catch(
      () => {}
    );
  }, [colorScheme]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}} />
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

        {/* Dashboard */}
        <Stack.Screen
          name="dashboard/home/index"
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="dashboard/notification/index"
          options={{headerShown: false, title: "Notifikasi"}}
        />
        <Stack.Screen
          name="dashboard/select-branch/index"
          options={{headerShown: true, title: "Pilih Outlet"}}
        />
        <Stack.Screen
          name="dashboard/product/products"
          options={{headerShown: true, title: "Produk"}}
        />
        <Stack.Screen
          name="dashboard/product/add-product"
          options={{headerShown: true, title: "Tambah Produk"}}
        />
        <Stack.Screen
          name="dashboard/product/manage"
          options={{headerShown: true, title: "Kelola Produk"}}
        />
        <Stack.Screen
          name="dashboard/product/stock"
          options={{headerShown: false, title: "Kelola Stok"}}
        />
        <Stack.Screen
          name="dashboard/product/variant"
          options={{headerShown: true, title: "Variasi Produk"}}
        />
        <Stack.Screen
          name="dashboard/setting/index"
          options={{headerShown: false, title: "Pengaturan"}}
        />
        <Stack.Screen
          name="dashboard/setting/profile"
          options={{headerShown: true, title: "Profil"}}
        />
      <Stack.Screen
        name="dashboard/setting/store"
        options={{headerShown: true, title: "Store"}}
      />
      <Stack.Screen
        name="dashboard/setting/receipt"
        options={{headerShown: true, title: "Atur Struk"}}
      />
      <Stack.Screen
        name="dashboard/setting/order-receipt"
        options={{headerShown: true, title: "Struk Order"}}
      />
      <Stack.Screen
        name="dashboard/setting/printer"
        options={{headerShown: true, title: "Printer"}}
      />
      <Stack.Screen
        name="dashboard/setting/umum"
        options={{headerShown: true, title: "Umum"}}
      />
      </Stack>
    </GestureHandlerRootView>
  );
}
