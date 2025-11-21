import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const colorScheme = useColorScheme() ?? "light";
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: Colors[colorScheme].background},
      ]}
    >
      <View style={styles.imageContainer}>
        <Ionicons
          name="person-circle-outline"
          size={120}
          color={Colors[colorScheme].primary}
        />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="title" style={styles.title}>
          Cukup 2 menit untuk registrasi
        </ThemedText>
        <ThemedText
          style={[styles.subtitle, {color: Colors[colorScheme].icon}]}
        >
          Daftarin usahamu untuk catat transaksi dan pantau laporan penjualan.
        </ThemedText>
      </View>
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Daftar Sekarang"
          variant="primary"
          onPress={() =>
            navigation.navigate("auth/Register/select-country" as never)
          }
        />
        <ThemedButton
          title="Masuk"
          variant="secondary"
          style={{marginTop: 16}}
          onPress={() => navigation.navigate("auth/Login/login" as never)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    padding: 20,
  },
  imageContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
  },
  buttonContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
});
