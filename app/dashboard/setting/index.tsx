import SmallLogo from "@/components/atoms/logo-sm";
import SettingListItem from "@/components/atoms/setting-list-item";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {StyleSheet, View, Alert, ActivityIndicator} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {settingsApi, authApi, UserProfile} from "@/services";

export default function SettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const VERSION = "1.0.0";
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await settingsApi.getProfile();
      if (response.data) {
        setProfile(response.data);
      }
    } catch (error: any) {
      console.error("❌ Failed to load profile:", error);
      // Jika error 401, token expired, redirect ke login
      if (error.code === 401) {
        Alert.alert("Session Expired", "Please login again", [
          {text: "OK", onPress: () => router.replace("/auth/Login/login")},
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Keluar", "Apakah Anda yakin ingin keluar?", [
      {text: "Batal", style: "cancel"},
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            console.log("🚪 Logging out...");
            await authApi.logout();
            console.log("✅ Logout successful");
            router.replace("/");
          } catch (error) {
            console.error("❌ Logout error:", error);
            // Tetap logout dan redirect meskipun API gagal
            router.replace("/");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header showBack={true} showHelp={false} title="Setting" />

      <View style={styles.infoCard}>
        <View style={styles.infoCardRow}>
          <View style={styles.iconSquare}>
            <SmallLogo />
            <View style={styles.badgePro}>
              <ThemedText style={styles.badgeProText}>PRO</ThemedText>
            </View>
          </View>
          <View style={{flex: 1}}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={Colors[colorScheme].primary}
              />
            ) : (
              <>
                <ThemedText style={styles.infoEmail} numberOfLines={1}>
                  {profile?.email || profile?.phone || "User"}
                </ThemedText>
                <ThemedText style={styles.infoVersion}>
                  Version {VERSION} • {profile?.role || "User"}
                </ThemedText>
              </>
            )}
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
        <View style={{height: 80}} />
      </ScrollView>

      <View style={styles.bottomButtonWrapper}>
        <ThemedButton
          title={isLoggingOut ? "Keluar..." : "Keluar"}
          variant="secondary"
          onPress={handleLogout}
          disabled={isLoggingOut}
        />
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
    headerIconButton: {},
  });
