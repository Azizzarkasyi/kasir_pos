import SettingListItem from "@/components/atoms/setting-list-item";
import Header from "@/components/header";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function SettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState("settings");

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <View style={styles.container}>
      <Header
        showBack={false}
        showHelp={false}
        title="Setting"
        left={
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.headerIconButton}
          >
            <Ionicons
              name="menu-outline"
              size={24}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        }
      />

      <View style={styles.infoCard}>
        <View style={styles.infoCardRow}>
          <View style={styles.iconSquare}>
            <Ionicons
              name="storefront-outline"
              size={24}
              color={Colors[colorScheme].primary}
            />
            <View style={styles.badgePro}>
              <ThemedText style={styles.badgeProText}>PRO</ThemedText>
            </View>
          </View>
          <View style={{flex: 1}}>
            <ThemedText style={styles.infoEmail}>
              basofi.cucokmeong12@gmail.com
            </ThemedText>
            <ThemedText style={styles.infoVersion}>
              Version 4.0.7(656) • db version 58
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <SettingListItem
            leftIconName="person-outline"
            title="Profile"
            onPress={() => router.push("/dashboard/setting/profile" as never)}
            showTopBorder={false}
            showBottomBorder={false}
          />
          <SettingListItem
            leftIconName="storefront-outline"
            title="Store"
            onPress={() => router.push("/dashboard/setting/store" as never)}
            showTopBorder={false}
            showBottomBorder={false}
          />
          <SettingListItem
            leftIconName="settings-outline"
            title="Umum"
            onPress={() => router.push("/dashboard/setting/umum" as never)}
            showTopBorder={false}
            showBottomBorder={false}
          />
        </View>
        <View style={{height: 80}} />
      </ScrollView>

      <Sidebar
        activeKey={activeMenu}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSelect={key => setActiveMenu(key)}
      />
      <View style={styles.bottomButtonWrapper}>
        <ThemedButton title="Keluar" variant="secondary" onPress={() => {}} />
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    sectionCard: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    infoCard: {
      marginTop: 12,
      marginHorizontal: 20,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    infoCardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconSquare: {
      width: 48,
      height: 48,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    badgePro: {
      position: "absolute",
      top: -8,
      alignSelf: "center",
      paddingHorizontal: 10,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: Colors[colorScheme].primary,
    },
    badgeProText: {
      fontSize: 10,
      color: Colors[colorScheme].secondary,
      fontWeight: "700",
    },
    infoEmail: {
      fontSize: 14,
      fontWeight: "600",
    },
    infoVersion: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
    bottomButtonWrapper: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },
    headerIconButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
  });
