import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

const NotificationScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header title="Notifikasi" showHelp={false} />

      <View style={styles.tabRow}>
        <View style={[styles.tabButton, styles.tabButtonActive]}>
          <ThemedText style={styles.tabTextActive}>Informasi</ThemedText>
        </View>
        <View style={styles.tabButton}>
          <ThemedText style={styles.tabText}>Promo</ThemedText>
        </View>
      </View>

      <View style={styles.emptyStateWrapper}>
        <Image
          source={require("@/assets/ilustrations/empty-notif.png")}
          style={styles.emptyImage}
          resizeMode="cover"
        />
        <ThemedText style={styles.emptyText}>Belum Ada Notifikasi</ThemedText>
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors[colorScheme].border,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
    },
    headerSpacer: {
      width: 32,
      height: 32,
    },
    tabRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 8,
    },
    tabButton: {
      flex: 0,
      minWidth: 110,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].secondary,
    },
    tabButtonActive: {
      borderColor: Colors[colorScheme].primary,
      backgroundColor: Colors[colorScheme].background,
    },
    tabText: {
      fontSize: 13,
      color: Colors[colorScheme].text,
    },
    tabTextActive: {
      fontSize: 13,
      color: Colors[colorScheme].primary,
      fontWeight: "600",
    },
    emptyStateWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      marginTop: -40,
    },
    emptyImage: {
      width: "90%",
      height: 220,
      borderRadius: 16,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: Colors[colorScheme].icon,
    },
  });

export default NotificationScreen;
