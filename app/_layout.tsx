import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from "@expo-google-fonts/roboto";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";

  const [fontsLoaded] = useFonts({
    Roboto: Roboto_400Regular,
    RobotoMedium: Roboto_500Medium,
    RobotoBold: Roboto_700Bold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors[colorScheme].background).catch(
      () => { }
    );
  }, [colorScheme]);

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/Login/login" options={{ headerShown: false }} />
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
          options={{ headerShown: false }}
        />

        {/* Dashboard */}
        <Stack.Screen
          name="dashboard/home/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="dashboard/notification/index"
          options={{ headerShown: false, title: "Notifikasi" }}
        />
        <Stack.Screen
          name="dashboard/select-branch/index"
          options={{ headerShown: true, title: "Pilih Outlet" }}
        />
        <Stack.Screen
          name="dashboard/product/products"
          options={{ headerShown: true, title: "Produk" }}
        />
        <Stack.Screen
          name="dashboard/product/add-product"
          options={{ headerShown: true, title: "Tambah Produk" }}
        />
        <Stack.Screen
          name="dashboard/product/edit-product"
          options={{ headerShown: true, title: "Edit Produk" }}
        />
        <Stack.Screen
          name="dashboard/product/manage"
          options={{ headerShown: true, title: "Kelola Produk" }}
        />
        <Stack.Screen
          name="dashboard/product/stock"
          options={{ headerShown: false, title: "Kelola Stok" }}
        />
        <Stack.Screen
          name="dashboard/product/variant"
          options={{ headerShown: true, title: "Variasi Produk" }}
        />
        <Stack.Screen
          name="dashboard/product/variant-stock"
          options={{ headerShown: true, title: "Kelola Stok Varian" }}
        />
        <Stack.Screen
          name="dashboard/product/add-barcode"
          options={{ headerShown: true, title: "Tambah Barcode" }}
        />


        {/* stock management */}
        <Stack.Screen
          name="dashboard/stock/manage"
          options={{ headerShown: true, title: "Kelola Stok" }}
        />


        {/* recipe and materials */}


        <Stack.Screen
          name="dashboard/recipe-and-materials/index"
          options={{ headerShown: true, title: "Resep & Bahan" }}
        />
        <Stack.Screen
          name="dashboard/recipe-and-materials/add-recipe"
          options={{ headerShown: true, title: "Tambah Resep" }}
        />
        <Stack.Screen
          name="dashboard/recipe-and-materials/edit-recipe"
          options={{ headerShown: true, title: "Edit Resep" }}
        />
        <Stack.Screen
          name="dashboard/recipe-and-materials/ingredients"
          options={{ headerShown: true, title: "Tambah Bahan Resep" }}
        />
        <Stack.Screen
          name="dashboard/recipe-and-materials/add-material"
          options={{ headerShown: true, title: "Tambah Bahan" }}
        />
        <Stack.Screen
          name="dashboard/recipe-and-materials/edit-material"
          options={{ headerShown: true, title: "Edit Bahan" }}
        />

        <Stack.Screen
          name="dashboard/recipe-and-materials/stock"
          options={{ headerShown: true, title: "Kelola Stok Bahan" }}
        />

        <Stack.Screen
          name="dashboard/recipe-and-materials/variant"
          options={{ headerShown: true, title: "Variasi Bahan" }}
        />
        <Stack.Screen
          name="dashboard/recipe-and-materials/variant-stock"
          options={{ headerShown: true, title: "Kelola Stok Varian Bahan" }}
        />



        {/* setting */}


        <Stack.Screen
          name="dashboard/setting/index"
          options={{ headerShown: false, title: "Pengaturan" }}
        />
        <Stack.Screen
          name="dashboard/setting/profile"
          options={{ headerShown: true, title: "Profil" }}
        />
        <Stack.Screen
          name="dashboard/setting/store"
          options={{ headerShown: true, title: "Store" }}
        />
        <Stack.Screen
          name="dashboard/setting/receipt"
          options={{ headerShown: true, title: "Atur Struk" }}
        />
        <Stack.Screen
          name="dashboard/setting/order-receipt"
          options={{ headerShown: true, title: "Struk Order" }}
        />
        <Stack.Screen
          name="dashboard/setting/printer"
          options={{ headerShown: true, title: "Printer" }}
        />
        <Stack.Screen
          name="dashboard/setting/scanner"
          options={{ headerShown: true, title: "Scanner" }}
        />
        <Stack.Screen
          name="dashboard/setting/umum"
          options={{ headerShown: true, title: "Umum" }}
        />
        {/* <Stack.Screen
          name="dashboard/stock/manage"
          options={{ headerShown: true, title: "Atur Stok" }}
        /> */}

        {/* transaction routes */}
        <Stack.Screen
          name="dashboard/transaction/index"
          options={{ headerShown: false, title: "Transaksi" }}
        />
        <Stack.Screen
          name="dashboard/transaction/summary"
          options={{ headerShown: false, title: "Ringkasan Transaksi" }}
        />
        <Stack.Screen
          name="dashboard/transaction/payment"
          options={{ headerShown: false, title: "Ringkasan Transaksi" }}
        />
        <Stack.Screen
          name="dashboard/transaction/settlement"
          options={{ headerShown: false, title: "Transaksi Berhasil" }}
        />
        <Stack.Screen
          name="dashboard/transaction/history"
          options={{ headerShown: false, title: "Transaksi Berhasil" }}
        />
        <Stack.Screen
          name="dashboard/transaction/show"
          options={{ headerShown: false, title: "Detail Transaksi" }}
        />
        <Stack.Screen
          name="dashboard/transaction/share-struck"
          options={{ headerShown: false, title: "Pratinjau Struk" }}
        />

      </Stack>
    </GestureHandlerRootView>
  );
}
