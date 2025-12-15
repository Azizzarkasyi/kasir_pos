import DeviceList from "@/components/atoms/device-list";
import SelectScannerTypeModal, { type ScannerTypeValue } from "@/components/drawers/select-scanner-type-modal";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useScannerDevice } from "@/hooks/use-scanner-device";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";

export default function ScannerScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const navigation = useNavigation();
  const router = useRouter();
  const {
    devices,
    startScan,
    stopScan,
    isScanning,
    error,
    connectToDevice,
    savedDevice,
  } = useScannerDevice();

  const [showScan, setShowScan] = React.useState(false);
  const [showTypeModal, setShowTypeModal] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<ScannerTypeValue | null>(null);

  const refresh = React.useCallback(() => {
    startScan();
  }, [startScan]);

  const handleAddScanner = () => {
    setShowTypeModal(true);
  };

  const handleTypeSelect = (type: ScannerTypeValue) => {
    setShowTypeModal(false);
    setSelectedType(type);

    if (type === "bluetooth") {
      setShowScan(true);
      startScan();
    } else {
      // USB - just save as connected (USB scanners work as keyboard)
      handleUsbConnect();
    }
  };

  const handleUsbConnect = async () => {
    try {
      await connectToDevice("usb", "USB Scanner", "usb");
      router.replace("/dashboard/setting/scanner-test" as never);
    } catch (e: any) {
      Alert.alert("Error", "Gagal menyimpan scanner USB.");
    }
  };

  const connect = async (d: { name: string; mac: string }) => {
    try {
      await connectToDevice(d.mac, d.name, "bluetooth");
      setShowScan(false);
      stopScan();
      router.replace("/dashboard/setting/scanner-test" as never);
    } catch {
      // error sudah ditangani di hook
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        showScan ? (
          <TouchableOpacity onPress={refresh} style={{ paddingHorizontal: 8 }}>
            <Ionicons
              name="refresh"
              size={22}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, showScan, colorScheme, refresh]);

  return (
    <>
      <Header title="Scanner" showHelp={false} />
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {!savedDevice && !showScan ? (
            <View style={styles.emptyStateWrapper}>
              <View style={{ flexDirection: "column", alignItems: "center" }}>
                <Image
                  source={require("@/assets/ilustrations/empty.jpg")}
                  style={styles.emptyImage}
                />
                <ThemedText style={styles.emptyTitle}>
                  Tidak Ada Scanner Terhubung
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                  Pilih Tambah Scanner untuk menghubungkan Scanner.
                </ThemedText>
                <View style={{ marginTop: isTablet ? 24 : 16 }}>
                  <ThemedButton
                    title="Tambah Scanner"
                    size={isTablet ? "base" : "medium"}
                    onPress={handleAddScanner}
                  />
                </View>
              </View>
            </View>
          ) : null}

          {showScan ? (
            <View style={styles.sectionCard}>
              <ThemedText type="subtitle-2">Perangkat Tersedia</ThemedText>

              {!isScanning && devices.length === 0 ? (
                <View style={{ paddingVertical: isTablet ? 24 : 16 }}>
                  <ThemedText style={{ color: Colors[colorScheme].icon, fontSize: isTablet ? 18 : 14 }}>
                    Tidak ada perangkat ditemukan.
                  </ThemedText>
                  {error ? (
                    <ThemedText style={{ color: Colors[colorScheme].danger, fontSize: isTablet ? 18 : 14 }}>
                      {error}
                    </ThemedText>
                  ) : null}
                </View>
              ) : null}

              {devices.length > 0 ? (
                <DeviceList devices={devices} onConnect={connect} />
              ) : null}

              {isScanning ? (
                <View style={{ paddingVertical: isTablet ? 24 : 16, alignItems: "center" }}>
                  <ActivityIndicator color={Colors[colorScheme].primary} size={isTablet ? "large" : "small"} />
                  <ThemedText style={{ marginTop: isTablet ? 16 : 8, fontSize: isTablet ? 18 : 14 }}>
                    Memindai perangkat Bluetooth...
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ) : null}

          {savedDevice && !showScan ? (
            <View style={styles.sectionCard}>
              <ThemedText type="subtitle-2">Scanner Terhubung</ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: isTablet ? 16 : 8 }}>
                <Ionicons
                  name={savedDevice.connectionType === "usb" ? "hardware-chip-outline" : "bluetooth"}
                  size={isTablet ? 28 : 18}
                  color={Colors[colorScheme].primary}
                />
                <ThemedText style={{ fontWeight: "600", fontSize: isTablet ? 20 : 16 }}>
                  {savedDevice.name}
                </ThemedText>
              </View>
              <ThemedText style={{ color: Colors[colorScheme].icon, fontSize: isTablet ? 18 : 14 }}>
                {savedDevice.connectionType === "usb" ? "USB" : savedDevice.address}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      <SelectScannerTypeModal
        visible={showTypeModal}
        onSelect={handleTypeSelect}
        onClose={() => setShowTypeModal(false)}
      />
    </>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: isTablet ? 60 : 20,
      backgroundColor: Colors[colorScheme].background,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
      flex: 1,
    },
    sectionCard: {
      marginTop: isTablet ? 20 : 12,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 16 : 8,
      paddingVertical: isTablet ? 16 : 8,
    },
    emptyStateWrapper: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: isTablet ? -60 : -40,
      flexDirection: "row",
      height: "100%",
    },
    emptyImage: {
      width: isTablet ? 360 : 240,
      height: isTablet ? 210 : 140,
      borderRadius: isTablet ? 16 : 10,
    },
    emptyTitle: {
      marginTop: isTablet ? 20 : 12,
      fontWeight: "700",
      fontSize: isTablet ? 22 : 16,
    },
    emptySubtitle: {
      marginTop: isTablet ? 8 : 4,
      fontSize: isTablet ? 18 : 15,
      textAlign: "center",
      color: Colors[colorScheme].icon,
    },
  });
