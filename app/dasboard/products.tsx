import Header from "@/components/header";
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

  const goAdd = () => router.push("/dasboard/add-product" as never);

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Produk" showHelp={false} />

      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("produk")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "produk"
                  ? {color: Colors[colorScheme].primary, fontWeight: "700"}
                  : {color: Colors[colorScheme].text, opacity: 0.5},
              ]}
            >
              Produk
            </ThemedText>
            {activeTab === "produk" ? (
              <View style={styles.tabUnderline} />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("kategori")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "kategori"
                  ? {color: Colors[colorScheme].primary, fontWeight: "700"}
                  : {color: Colors[colorScheme].text, opacity: 0.5},
              ]}
            >
              Kategori
            </ThemedText>
            {activeTab === "kategori" ? (
              <View style={styles.tabUnderline} />
            ) : null}
          </TouchableOpacity>
        </View>

        {activeTab === "produk" ? (
          <View>
            <View style={styles.searchRow}>
              <ThemedInput
                label="Cari Produk"
                value={search}
                onChangeText={setSearch}
                leftIconName="search"
                width="82%"
                showLabel={false}
                placeholder="Cari Produk"
              />
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
          <View>
            <ThemedText style={{color: Colors[colorScheme].icon}}>
              Belum ada kategori.
            </ThemedText>
          </View>
        )}
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
      gap: 24,
      marginTop: 20,
      marginVertical: "auto",
      alignItems: "center",
    },
    tabItem: {
      paddingBottom: 6,
      alignItems: "center",
    },
    tabUnderline: {
      height: 3,
      width: 64,
      borderRadius: 4,
      marginTop: 6,
      backgroundColor: Colors[colorScheme].primary,
      alignSelf: "center",
    },
    tabText: {
      fontWeight: "600",
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 20,
    },
    filterButton: {
      width: 56,
      height: 56,

      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
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
