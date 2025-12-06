import CountryListItem from "@/components/country-list-item";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const countries = [
  { id: "1", name: "Indonesia" },
  { id: "2", name: "Brunei" },
  { id: "3", name: "Cambodia" },
  { id: "4", name: "Laos" },
  { id: "5", name: "Malaysia" },
  { id: "6", name: "Myanmar" },
  { id: "7", name: "Philippines" },
  { id: "8", name: "Singapore" },
  { id: "9", name: "Thailand" },
  { id: "10", name: "Timor Leste" },
];

const SelectCountryScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const navigation = useNavigation();

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: { id: string; name: string } }) => (
    <CountryListItem
      item={item}
      selected={selectedCountry === item.id}
      onPress={() => setSelectedCountry(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <Header title="Pilih Negara" />
      <View style={styles.headerContentWrapper}>
        <ThemedText style={styles.subtitle}>
          Kamu tidak bisa mengubah pilihan negaramu setelah proses verifikasi
          selesai.
        </ThemedText>
        <View>
          <ThemedInput
            label="Cari Negara"
            value={searchQuery}
            size="md"
            containerStyle={{ backgroundColor: Colors[colorScheme].border2 }}
            inputContainerStyle={{ paddingInlineStart: 40 }}
            showLabel={false}
            placeholder="Cari Negara"
            onChangeText={setSearchQuery}
          />
          <View
            style={{
              position: "absolute",
              left: 15,
              top: 0,
              bottom: 0,
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="search"
              size={25}
              color={Colors[colorScheme].shadow}
            />
          </View>
        </View>
      </View>
      <View style={styles.listWrapper}>
        <FlatList
          data={filteredCountries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: Colors[colorScheme].background, marginTop: 10 }}
          contentContainerStyle={{
            paddingHorizontal: isTablet ? 24 : 16,
            paddingBottom: insets.bottom + 80,
          }}
        ListEmptyComponent={
          searchQuery
            ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name="search"
                  size={40}
                  color={Colors[colorScheme].icon}
                  style={{ marginBottom: 8 }}
                />
                <ThemedText style={styles.emptyStateTitle}>
                  Negara tidak ditemukan
                </ThemedText>
                <ThemedText style={styles.emptyStateSubtitle}>
                  Coba periksa kembali kata kunci pencarianmu.
                </ThemedText>
              </View>
            )
            : null
        }
        />
      </View>
      <View style={styles.bottomBar}>
        <ThemedButton
          title="Lanjutkan"
          variant="primary"
          onPress={() => navigation.navigate("auth/Register/register" as never)}
        />
      </View>
    </View>
  );
};

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 0,
    },
    content: {
      flex: 1,
    },
    headerContentWrapper: {
      paddingHorizontal: isTablet ? 24 : 16,
      marginTop: isTablet ? 32 : 16,
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    subtitle: {
      marginBottom: 12,
      fontSize: isTablet ? 18 : 14,
      lineHeight: isTablet ? 24 : 20,
      color: Colors[colorScheme].icon,
    },
    listWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
      flex: 1,
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
    },
    emptyStateTitle: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: "600",
      marginBottom: 4,
      color: Colors[colorScheme].text,
    },
    emptyStateSubtitle: {
      fontSize: isTablet ? 18 : 16,
      lineHeight: isTablet ? 22 : 20,
      color: Colors[colorScheme].icon,
      textAlign: "center",
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });

export default SelectCountryScreen;
