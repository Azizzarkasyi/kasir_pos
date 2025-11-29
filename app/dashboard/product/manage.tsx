import Header from "@/components/header";
import MenuRow from "@/components/menu-row";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ManageProductsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const navigation = useNavigation();



  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Header title="Kelola Produk" showHelp={false}/>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacer} />

        <View style={[styles.menuWrapper, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors[colorScheme].border }]}>
          <MenuRow
            title="Produk"
            subtitle="Kelola semua produk untuk katalog toko kamu di sini."
            variant="link"
            showBottomBorder={false}
            onPress={() => router.push("/dashboard/product/products" as never)}
          />
        </View>

        <View style={[styles.menuWrapper, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors[colorScheme].border }]}>
          <MenuRow
            title="Atur Stok"
            subtitle="Ubah, tambah, atau kurangi stok produk dengan cepat."
            variant="link"
            showBottomBorder={false}
            onPress={() => router.push("/dashboard/stock/manage" as never)}
          />
        </View>

        <View style={[styles.menuWrapper, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors[colorScheme].border }]}>
          <MenuRow
            title="Bahan Baku & Resep"
            subtitle="Buat resep produk dari bahan baku."
            variant="link"
            showBottomBorder={false}
            onPress={() =>
              router.push("/dashboard/recipe-and-materials" as never)
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  spacer: {
    height: 12,
  },
  menuWrapper: {
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
});

export { };
