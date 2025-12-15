import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePrinterDevice } from "@/hooks/use-printer-device";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function PrinterTestScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const isLandscape = width > height;
    const isTabletLandscape = isTablet && isLandscape;
    const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
    const router = useRouter();
    const { savedDevice, connectedDeviceInstance, isConnected, connectToDevice } = usePrinterDevice();
    const [isPrinting, setIsPrinting] = useState(false);

    const handleTestPrint = async () => {
        let deviceInstance = connectedDeviceInstance;

        // If no active connection but we have saved device, try to reconnect
        if (!deviceInstance && savedDevice) {
            setIsPrinting(true);
            try {
                console.log("[PrinterTestScreen] Reconnecting to saved device:", savedDevice.address);
                deviceInstance = await connectToDevice(savedDevice.address, savedDevice.name);
            } catch (e: any) {
                console.error("[PrinterTestScreen] Reconnect failed:", e);
                Alert.alert("Gagal", "Gagal menghubungkan ke printer. Silakan coba lagi.");
                setIsPrinting(false);
                return;
            }
        }

        if (!deviceInstance) {
            console.log("[PrinterTestScreen] No device instance available");
            Alert.alert("Error", "Printer tidak terhubung. Silakan hubungkan terlebih dahulu.");
            return;
        }

        setIsPrinting(true);
        try {
            // Send test print data to the connected printer
            const testMessage = "\n\n  =============================\n\n        PRINTER OK\n\n  =============================\n\n\n\n";
            await deviceInstance.write(testMessage);
            Alert.alert("Berhasil", "Test cetak berhasil dikirim ke printer.");
        } catch (e: any) {
            console.error("[PrinterTestScreen] Print error:", e);
            Alert.alert("Gagal", e?.message ?? "Gagal mencetak. Pastikan printer terhubung dengan benar.");
        } finally {
            setIsPrinting(false);
        }
    };

    const handleEditPrinter = () => {
        router.push("/dashboard/setting/printer" as never);
    };

    return (
        <>
            <Header title="Printer" showHelp={false} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentWrapper}>
                    <View style={styles.sectionCard}>
                        <ThemedText type="subtitle-2" style={styles.sectionTitle}>
                            Perangkat Terhubung
                        </ThemedText>

                        {savedDevice ? (
                            <View style={styles.deviceRow}>
                                <View style={styles.deviceInfo}>
                                    <Ionicons
                                        name="print-outline"
                                        size={isTablet ? 28 : 22}
                                        color={Colors[colorScheme].text}
                                    />
                                    <View style={styles.deviceTextContainer}>
                                        <ThemedText style={styles.deviceName}>
                                            {savedDevice.name}
                                        </ThemedText>
                                        <ThemedText style={styles.deviceMac}>
                                            {savedDevice.address}
                                        </ThemedText>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={handleEditPrinter} style={styles.editButton}>
                                    <Ionicons
                                        name="pencil-outline"
                                        size={isTablet ? 24 : 20}
                                        color={Colors[colorScheme].icon}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.noDeviceContainer}>
                                <ThemedText style={styles.noDeviceText}>
                                    Tidak ada printer terhubung
                                </ThemedText>
                                <ThemedButton
                                    title="Tambah Printer"
                                    size={isTablet ? "base" : "medium"}
                                    onPress={handleEditPrinter}
                                />
                            </View>
                        )}
                    </View>

                    {savedDevice && (
                        <View style={styles.testButtonContainer}>
                            <ThemedButton
                                title={isPrinting ? "Mencetak..." : "Test Cetak"}
                                variant="secondary"
                                size={isTablet ? "base" : "medium"}
                                onPress={handleTestPrint}
                                disabled={isPrinting}
                                style={styles.testButton}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
        </>
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
        scrollContent: {
            paddingHorizontal: isTablet ? 60 : 20,
            paddingBottom: isTablet ? 32 : 20,
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
            paddingVertical: isTablet ? 16 : 12,
        },
        sectionTitle: {
            fontWeight: "600",
            fontSize: isTablet ? 20 : 16,
            marginBottom: isTablet ? 16 : 12,
        },
        deviceRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: isTablet ? 12 : 8,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].border,
        },
        deviceInfo: {
            flexDirection: "row",
            alignItems: "center",
            gap: isTablet ? 16 : 12,
            flex: 1,
        },
        deviceTextContainer: {
            flex: 1,
        },
        deviceName: {
            fontWeight: "500",
            fontSize: isTablet ? 18 : 14,
        },
        deviceMac: {
            fontSize: isTablet ? 14 : 12,
            color: Colors[colorScheme].icon,
            marginTop: 2,
        },
        editButton: {
            padding: isTablet ? 12 : 8,
        },
        noDeviceContainer: {
            alignItems: "center",
            paddingVertical: isTablet ? 24 : 16,
            gap: isTablet ? 16 : 12,
        },
        noDeviceText: {
            fontSize: isTablet ? 18 : 14,
            color: Colors[colorScheme].icon,
        },
        testButtonContainer: {
            marginTop: isTablet ? 24 : 16,
        },
        testButton: {
            width: "100%",
        },
    });
