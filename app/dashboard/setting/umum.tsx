import ConfirmPopup from "@/components/atoms/confirm-popup";
import SectionDivider from "@/components/atoms/section-divider";
import SelectLanguageModal, {
  LanguageValue,
} from "@/components/drawers/select-language-modal";
import Header from "@/components/header";
import MenuRow from "@/components/menu-row";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePrinterStore } from "@/stores/printer-store";
import { useScannerStore } from "@/stores/scanner-store";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function GeneralSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();
  const { savedDevice: printerDevice, getDisplayName: getPrinterDisplayName } = usePrinterStore();
  const { savedDevice: scannerDevice, getDisplayName: getScannerDisplayName } = useScannerStore();
  const [language, setLanguage] = useState<LanguageValue>("id");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [lastSync, setLastSync] = useState<string>("Belum pernah");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadLastSync();
  }, []);

  const loadLastSync = async () => {
    try {
      // Coba load dari AsyncStorage dulu
      const AsyncStorage = await import(
        "@react-native-async-storage/async-storage"
      );
      const lastSyncStr = await AsyncStorage.default.getItem("last_sync_time");
      if (lastSyncStr) {
        const date = new Date(lastSyncStr);
        setLastSync(formatDate(date));
      }
    } catch (error) {
      console.error("❌ Failed to load last sync:", error);
    }
  };

  const formatDate = (date: Date): string => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Simulasi sync - bisa diganti dengan actual API call nanti
      // TODO: Implementasi sync sebenarnya ketika backend sudah siap

      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update last sync time
      const now = new Date();
      const AsyncStorage = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.default.setItem("last_sync_time", now.toISOString());

      setLastSync(formatDate(now));
      setShowSuccessPopup(true);
    } catch (error: any) {
      console.error("❌ Sync failed:", error);
      Alert.alert("Gagal", error.message || "Gagal melakukan sinkronisasi");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Umum" showHelp={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.sectionCardHighlight}>
            <ThemedText type="subtitle-2" style={styles.syncTitle}>
              Sinkronisasi Data{" "}
            </ThemedText>
            <ThemedText style={styles.syncSubtitle}>
              Lakukan sinkronisasi untuk perbarui data Qasir
            </ThemedText>
            <View style={styles.syncRow}>
              <View>
                <ThemedText style={styles.syncLastLabel}>
                  Terakhir Disinkronkan
                </ThemedText>
                <ThemedText style={styles.syncLastTime}>{lastSync}</ThemedText>
              </View>
              <ThemedButton
                title={isSyncing ? "Syncing..." : "Sinkronisasi"}
                size="sm"
                onPress={handleSync}
                disabled={isSyncing}
              />
            </View>
          </View>
        </View>
        <SectionDivider />

        <View style={styles.contentWrapper}>
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Umum
            </ThemedText>
            <MenuRow
              title="Bahasa"
              rightText={language === "en" ? "English" : "Indonesia"}
              variant="link"
              style={styles.menuRowTitle}
              showTopBorder={false}
              showBottomBorder={false}
              onPress={() => setShowLanguageModal(true)}
            />
          </View>
        </View>
        <SectionDivider />

        <View style={styles.contentWrapper}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="subtitle-2" style={styles.sectionTitle}>
                Perangkat Tambahan
              </ThemedText>
              <TouchableOpacity>
                <Text style={styles.buyNowText}>Beli Sekarang</Text>
              </TouchableOpacity>
            </View>
            <MenuRow
              title="Printer"
              rightText={getPrinterDisplayName()}
              variant="link"
              rowStyle={styles.printerRow}
              style={styles.menuRowTitle}
              showTopBorder={false}
              showBottomBorder={false}
              onPress={() => {
                if (printerDevice) {
                  router.push("/dashboard/setting/printer-test" as never);
                } else {
                  router.push("/dashboard/setting/printer" as never);
                }
              }}
            />
            <MenuRow
              title="Scanner"
              rightText={getScannerDisplayName()}
              variant="link"
              rowStyle={styles.scannerRow}
              style={styles.menuRowTitle}
              showTopBorder={false}
              showBottomBorder={false}
              onPress={() => {
                if (scannerDevice) {
                  router.push("/dashboard/setting/scanner-test" as never);
                } else {
                  router.push("/dashboard/setting/scanner" as never);
                }
              }}
            />
            <MenuRow
              title="Atur Struk"
              variant="link"
              rowStyle={styles.receiptRow}
              style={styles.menuRowTitle}
              showTopBorder={false}
              showBottomBorder={false}
              onPress={() => router.push("/dashboard/setting/receipt" as never)}
            />
          </View>
        </View>
      </ScrollView>

      <SelectLanguageModal
        visible={showLanguageModal}
        value={language}
        onChange={next => {
          setLanguage(next);
          setShowLanguageModal(false);
        }}
        onClose={() => setShowLanguageModal(false)}
      />

      <ConfirmPopup
        visible={showSuccessPopup}
        successOnly
        title="Berhasil"
        message="Data berhasil disinkronkan"
        onConfirm={() => setShowSuccessPopup(false)}
        onCancel={() => setShowSuccessPopup(false)}
      />
    </View>
  );
}

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingBottom: isTablet ? 32 : 20,
      paddingHorizontal: isTablet ? 40 : 0,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionCard: {
      marginTop: isTablet ? 20 : 12,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 32 : 24,
      paddingVertical: isTablet ? 12 : 8,
    },
    sectionCardHighlight: {
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: isTablet ? 32 : 24,
      paddingVertical: isTablet ? 32 : 24,
      gap: isTablet ? 8 : 4,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: isTablet ? 16 : 10,
    },
    syncTitle: {
      lineHeight: isTablet ? 28 : 20,
      fontSize: isTablet ? 20 : 16,
    },
    syncSubtitle: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
    },
    syncLastLabel: {
      color: Colors[colorScheme].text,
      fontSize: isTablet ? 20 : 16,
      fontWeight: "600",
    },
    syncLastTime: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].icon,
    },
    sectionTitle: {
      fontWeight: "600",
      fontSize: isTablet ? 20 : 16,
    },
    menuRowTitle: {
      fontWeight: "400",
      fontSize: isTablet ? 20 : 16,
    },
    buyNowText: {
      color: Colors[colorScheme].primary,
      fontSize: isTablet ? 18 : 14,
    },
    printerRow: {
      marginTop: isTablet ? 32 : 24,
      minHeight: 0,
      paddingVertical: isTablet ? 16 : 12,
    },
    scannerRow: {
      minHeight: 0,
      paddingVertical: isTablet ? 16 : 12,
    },
    receiptRow: {
      minHeight: 0,
      paddingVertical: isTablet ? 16 : 12,
    },
  });
