import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DashboardHeaderProps = {
  onPressMenu?: () => void;
};

const DashboardHeader = ({ onPressMenu }: DashboardHeaderProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme, insets.top);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onPressMenu}>
        <AntDesign
          name="menu"
          size={20}
          style={{
            color: Colors[colorScheme].icon,
          }}
        />
      </TouchableOpacity>
      <ThemedText type="title" style={styles.title}>
        Beranda
      </ThemedText>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push("/dashboard/notification" as never)}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          style={{
            color: Colors[colorScheme].icon,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", topInset: number) =>
  StyleSheet.create({
    container: {
      paddingTop: topInset + 10,
      paddingHorizontal: 8,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      gap: 16,
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 6,
      zIndex: 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "rgba(0,0,0,0.06)",
      justifyContent: "space-between",
      backgroundColor: Colors[colorScheme].background,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
      textAlign: "center",
    },
  });

export default DashboardHeader;
