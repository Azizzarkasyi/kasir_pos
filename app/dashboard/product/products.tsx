import ProductCard from "@/components/product-card";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function ProductsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"produk" | "kategori">("produk");
  const [search, setSearch] = useState("");

  const goAdd = () => router.push("/dashboard/product/add-product" as never);

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          // PENTING: Jangan ada paddingHorizontal di sini agar Tab bisa full width
          paddingTop: 0,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- 1. TAB SECTION (Full Width) --- */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("produk")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "produk"
                  ? {color: Colors[colorScheme].primary}
                  : {color: Colors[colorScheme].icon},
              ]}
            >
              Produk
            </ThemedText>
            {activeTab === "produk" && <View style={styles.activeTabLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("kategori")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "kategori"
                  ? {color: Colors[colorScheme].primary}
                  : {color: Colors[colorScheme].icon},
              ]}
            >
              Kategori
            </ThemedText>
            {activeTab === "kategori" && <View style={styles.activeTabLine} />}
          </TouchableOpacity>
        </View>

        {/* --- 2. CONTENT SECTION (Dengan Padding) --- */}
        <View style={styles.contentContainer}>
          {activeTab === "produk" ? (
            <View>
              <View style={styles.searchRow}>
                {/* PENTING: Gunakan View Wrapper dengan flex: 1 untuk Input 
                   Ini akan memaksa input mengisi sisa ruang kosong secara otomatis
                */}
                <View style={{flex: 1}}>
                  <ThemedInput
                    label="Cari Produk"
                    value={search}
                    onChangeText={setSearch}
                    leftIconName="search"
                    width="100%" // Input mengisi wrapper flex:1 tadi
                    showLabel={false}
                    placeholder="Cari Produk"
                  />
                </View>

                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={Colors[colorScheme].text}
                  />
                </TouchableOpacity>
              </View>

              <ProductCard
                initials="AG"
                name="Aqua gelas"
                subtitle="2 Harga"
                rightText="Stok 20"
              />
            </View>
          ) : (
            <View style={{marginTop: 20}}>
              <ThemedText style={{color: Colors[colorScheme].icon}}>
                Belum ada kategori.
              </ThemedText>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + 24}]}
        onPress={goAdd}
      >
        <Ionicons name="add" size={28} color={Colors[colorScheme].background} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    tabsRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E0E0E0",
      backgroundColor: Colors[colorScheme].background,
      marginTop: 10,
    },
    tabItem: {
      flex: 1, // Membagi lebar 50:50
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    activeTabLine: {
      position: "absolute",
      bottom: -1, // Supaya menutupi garis border abu-abu
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: Colors[colorScheme].primary,
    },
    tabText: {
      fontSize: 15,
      fontWeight: "600",
    },

    // Container baru untuk isi halaman agar punya jarak kiri-kanan
    contentContainer: {
      paddingHorizontal: 20,
    },

    searchRow: {
      flexDirection: "row",
      alignItems: "center", // Memastikan Input dan Tombol sejajar vertikal
      gap: 12,
      marginTop: 16,
    },
    filterButton: {
      width: 50, // Sesuaikan lebar tombol
      height: 50, // Sesuaikan tinggi agar sama dengan Input Anda (biasanya input sekitar 48-50)
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      // Pastikan marginTop input tidak mengganggu alignment,
      // jika input punya margin internal, sesuaikan disini.
    },

    fab: {
      position: "absolute",
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].primary,
      elevation: 6,
    },
  });
