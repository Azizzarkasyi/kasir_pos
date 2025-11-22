import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRouter} from "expo-router";
import React from "react";
import {ScrollView, View} from "react-native";
import MenuRow from "@/components/menu-row";

export default function ManageProductsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <ScrollView
        contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 24}}
        showsVerticalScrollIndicator={false}
      >
        <View style={{height: 12}} />

        <MenuRow
          title="Produk"
          subtitle="Kelola semua produk untuk katalog toko kamu di sini."
          variant="link"
          onPress={() => router.push("/dashboard/product/products" as never)}
        />

        <MenuRow
          title="Atur Stok"
          subtitle="Ubah, tambah, atau kurangi stok produk dengan cepat."
          variant="link"
          onPress={() => {}}
        />

        <MenuRow
          title="Bahan Baku & Resep"
          subtitle="Buat resep produk dari bahan baku."
          variant="link"
          onPress={() => {}}
        />
      </ScrollView>
    </View>
  );
}

export {};
