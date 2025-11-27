import SmallLogo from "@/components/atoms/logo-sm";
import SettingListItem from "@/components/atoms/setting-list-item";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function SettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const VERSION = "1.0.0";

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showHelp={false}
        title="Setting"
      />

      <View style={styles.infoCard}>
        <View style={styles.infoCardRow}>
          <View style={styles.iconSquare}>
            <SmallLogo />
            <View style={styles.badgePro}>
              <ThemedText style={styles.badgeProText}>PRO</ThemedText>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.infoEmail}>
              basofi.cucokmeong12@gmail.com asdfasdf
            </ThemedText>
            <ThemedText style={styles.infoVersion}>
              Version {VERSION}(656) • db version 58
            </ThemedText>
          </View>
        </View>
      </View>
      {/* <SectionDivider/>  */}



      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <SettingListItem
            leftIconName="settings-outline"
            title="Umum"
            onPress={() => router.push("/dashboard/setting/umum" as never)}
            showTopBorder={false}
            showBottomBorder={true}
          />
          <SettingListItem
            leftIconName="person-outline"
            title="Profile"
            onPress={() => router.push("/dashboard/setting/profile" as never)}
            showTopBorder={false}
            showBottomBorder={true}
          />
          <SettingListItem
            leftIconName="storefront-outline"
            title="Store"
            onPress={() => router.push("/dashboard/setting/store" as never)}
            showTopBorder={false}
            showBottomBorder={true}
          />

        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomButtonWrapper}>
        <ThemedButton title="Keluar" variant="secondary" onPress={() => { }} />
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
      paddingBottom: 20,
    },
    sectionCard: {
      borderColor: Colors[colorScheme].icon,
      backgroundColor: Colors[colorScheme].background,
      paddingVertical: 8,
    },
    infoCard: {
      marginTop: 12,
 
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    infoCardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconSquare: {
      padding: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },

    sectionCardHighlight: {
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: 12,
      paddingVertical: 24,
      gap: 6,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    badgePro: {
      position: "absolute",
      top: -8,
      right: -8,
      alignSelf: "center",
      paddingHorizontal: 6,
      paddingVertical: 0,
      borderRadius: 10,
      backgroundColor: Colors[colorScheme].primary,
    },
    badgeProText: {
      fontSize: 8,
      color: Colors[colorScheme].secondary,
      fontWeight: "700",
    },
    infoEmail: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "600",
    },
    infoVersion: {
      fontSize: 13,
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

    },
  });
