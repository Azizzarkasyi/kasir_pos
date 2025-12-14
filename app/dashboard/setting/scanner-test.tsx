import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useScannerDevice } from "@/hooks/use-scanner-device";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function ScannerTestScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const isLandscape = width > height;
    const isTabletLandscape = isTablet && isLandscape;
    const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
    const router = useRouter();
    const {
        savedDevice,
        connectedDeviceInstance,
        isConnected,
        connectToDevice,
        lastScannedBarcode,
        clearLastBarcode,
        forgetDevice,
    } = useScannerDevice();
    const [isConnecting, setIsConnecting] = useState(false);
    const [barcodeHistory, setBarcodeHistory] = useState<string[]>([]);
    const [usbInputBuffer, setUsbInputBuffer] = useState("");
    const textInputRef = useRef<TextInput>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-connect when entering page (Bluetooth only)
    useEffect(() => {
        if (savedDevice && !connectedDeviceInstance && savedDevice.connectionType === "bluetooth") {
            handleReconnect();
        }
    }, [savedDevice]);

    // Auto-focus TextInput for USB scanner input
    useEffect(() => {
        if (savedDevice?.connectionType === "usb") {
            console.log("[ScannerTest] USB scanner detected, focusing TextInput...");
            // Focus immediately and again after delay to ensure it works
            textInputRef.current?.focus();
            const timer = setTimeout(() => {
                textInputRef.current?.focus();
                console.log("[ScannerTest] TextInput focused for USB input");
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [savedDevice]);

    // Handle barcode from Bluetooth scanner
    useEffect(() => {
        if (lastScannedBarcode) {
            console.log("[ScannerTest] Bluetooth barcode received:", lastScannedBarcode);
            addBarcodeToHistory(lastScannedBarcode);
            clearLastBarcode();
        }
    }, [lastScannedBarcode]);

    const addBarcodeToHistory = (barcode: string) => {
        console.log("[ScannerTest] Adding barcode to history:", barcode);
        setBarcodeHistory((prev) => [barcode, ...prev]);
    };

    // Handle USB scanner input with debounce
    // USB scanners send characters rapidly without newline
    // After 150ms of no new input, we consider the barcode complete
    const handleUsbTextChange = (text: string) => {
        // Clear previous debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Check for newline (some scanners send it)
        if (text.includes("\n")) {
            // Clear debounce timer to prevent double submission
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }

            const barcode = text.replace(/\n/g, "").trim();
            console.log("[ScannerTest] Barcode detected (with newline):", barcode);

            if (barcode) {
                addBarcodeToHistory(barcode);
            }
            setUsbInputBuffer(""); // Reset buffer

            // Re-focus to continue capturing
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 50);
            return;
        }

        // Update buffer with current text
        setUsbInputBuffer(text);

        // Set debounce timer - if no new input for 150ms, submit barcode
        debounceTimerRef.current = setTimeout(() => {
            const barcode = text.trim();
            if (barcode && barcode.length >= 3) { // Minimum barcode length
                console.log("[ScannerTest] Barcode detected (debounced):", barcode);
                addBarcodeToHistory(barcode);
                setUsbInputBuffer(""); // Reset buffer

                // Re-focus to continue capturing
                setTimeout(() => {
                    textInputRef.current?.focus();
                }, 50);
            }
        }, 150); // 150ms debounce - adjust if needed
    };

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleReconnect = async () => {
        if (!savedDevice) return;

        setIsConnecting(true);
        try {
            console.log("[ScannerTestScreen] Reconnecting to saved device:", savedDevice.address);
            await connectToDevice(savedDevice.address, savedDevice.name, savedDevice.connectionType);
        } catch (e: any) {
            console.error("[ScannerTestScreen] Reconnect failed:", e);
            Alert.alert("Gagal", "Gagal menghubungkan ke scanner. Silakan coba lagi.");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleClearHistory = () => {
        Alert.alert(
            "Hapus History",
            "Apakah Anda yakin ingin menghapus semua history barcode?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: () => setBarcodeHistory([]),
                },
            ]
        );
    };

    const handleForgetDevice = () => {
        Alert.alert(
            "Lupakan Scanner",
            "Apakah Anda yakin ingin memutuskan dan melupakan scanner ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Lupakan",
                    style: "destructive",
                    onPress: async () => {
                        await forgetDevice();
                        router.replace("/dashboard/setting/scanner" as never);
                    },
                },
            ]
        );
    };

    const handleEditScanner = () => {
        router.push("/dashboard/setting/scanner" as never);
    };

    const getConnectionIcon = () => {
        if (!savedDevice) return "scan-outline";
        return savedDevice.connectionType === "usb" ? "hardware-chip-outline" : "bluetooth";
    };

    const renderBarcodeItem = ({ item, index }: { item: string; index: number }) => (
        <View style={styles.historyItem}>
            <View style={styles.historyNumberBadge}>
                <ThemedText style={styles.historyIndex}>{index + 1}</ThemedText>
            </View>
            <ThemedText style={styles.historyText} numberOfLines={1}>{item}</ThemedText>
            <Ionicons
                name="copy-outline"
                size={isTablet ? 20 : 16}
                color={Colors[colorScheme].icon}
            />
        </View>
    );

    return (
        <>
            <Header title="Scanner Test" showHelp={false} />

            {/* Hidden TextInput for USB scanner input */}
            {savedDevice?.connectionType === "usb" && (
                <TextInput
                    ref={textInputRef}
                    value={usbInputBuffer}
                    onChangeText={handleUsbTextChange}
                    onFocus={() => console.log("[ScannerTest] TextInput focused")}
                    onBlur={() => {
                        console.log("[ScannerTest] TextInput lost focus, re-focusing...");
                        setTimeout(() => textInputRef.current?.focus(), 50);
                    }}
                    autoFocus
                    style={styles.hiddenInput}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline={false}
                    blurOnSubmit={false}
                />
            )}

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentWrapper}>
                    {/* Device Status Card */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <View style={styles.statusIconContainer}>
                                <Ionicons
                                    name={getConnectionIcon()}
                                    size={isTablet ? 28 : 24}
                                    color={Colors[colorScheme].primary}
                                />
                            </View>
                            <View style={styles.statusInfo}>
                                <ThemedText style={styles.statusDeviceName}>
                                    {savedDevice?.name || "Scanner"}
                                </ThemedText>
                                <View style={styles.statusBadge}>
                                    <View style={[
                                        styles.statusDot,
                                        { backgroundColor: savedDevice ? "#22c55e" : Colors[colorScheme].danger }
                                    ]} />
                                    <ThemedText style={styles.statusText}>
                                        {savedDevice ? (savedDevice.connectionType === "usb" ? "USB Terhubung" : "Bluetooth Terhubung") : "Tidak Terhubung"}
                                    </ThemedText>
                                </View>
                            </View>
                            {savedDevice && (
                                <TouchableOpacity onPress={handleEditScanner} style={styles.settingsButton}>
                                    <Ionicons
                                        name="settings-outline"
                                        size={isTablet ? 24 : 20}
                                        color={Colors[colorScheme].icon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        {!savedDevice && (
                            <View style={styles.addScannerContainer}>
                                <ThemedButton
                                    title="Tambah Scanner"
                                    size={isTablet ? "base" : "medium"}
                                    onPress={handleEditScanner}
                                />
                            </View>
                        )}

                        {/* USB Info Banner */}
                        {savedDevice?.connectionType === "usb" && (
                            <View style={styles.infoBox}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={isTablet ? 20 : 16}
                                    color={Colors[colorScheme].primary}
                                />
                                <ThemedText style={styles.infoText}>
                                    Arahkan scanner ke barcode. Input akan tertangkap otomatis.
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    {savedDevice && (
                        <>
                            {/* Last Scanned Barcode */}
                            <View style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <ThemedText style={styles.resultLabel}>
                                        Hasil Scan Terakhir
                                    </ThemedText>
                                    {barcodeHistory.length > 0 && (
                                        <ThemedText style={styles.resultTimestamp}>
                                            Baru saja
                                        </ThemedText>
                                    )}
                                </View>
                                <View style={styles.lastBarcodeContainer}>
                                    {barcodeHistory.length > 0 ? (
                                        <>
                                            <View style={styles.barcodeIconContainer}>
                                                <Ionicons
                                                    name="barcode-outline"
                                                    size={isTablet ? 32 : 24}
                                                    color="#fff"
                                                />
                                            </View>
                                            <ThemedText style={styles.barcodeText} numberOfLines={1}>
                                                {barcodeHistory[0]}
                                            </ThemedText>
                                        </>
                                    ) : (
                                        <View style={styles.waitingScanContainer}>
                                            <Ionicons
                                                name="scan-outline"
                                                size={isTablet ? 40 : 32}
                                                color={Colors[colorScheme].icon}
                                            />
                                            <ThemedText style={styles.waitingText}>
                                                Menunggu scan barcode...
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* History */}
                            <View style={styles.historyCard}>
                                <View style={styles.historyHeader}>
                                    <ThemedText type="subtitle-2">
                                        History ({barcodeHistory.length})
                                    </ThemedText>
                                    {barcodeHistory.length > 0 && (
                                        <ThemedButton
                                            title="Hapus"
                                            size="sm"
                                            variant="secondary"
                                            onPress={handleClearHistory}
                                        />
                                    )}
                                </View>

                                {barcodeHistory.length > 0 ? (
                                    <FlatList
                                        data={barcodeHistory}
                                        renderItem={renderBarcodeItem}
                                        keyExtractor={(item, index) => `${item}-${index}`}
                                        style={styles.historyList}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <View style={styles.emptyHistoryContainer}>
                                        <Ionicons
                                            name="barcode-outline"
                                            size={isTablet ? 64 : 48}
                                            color={Colors[colorScheme].icon}
                                        />
                                        <ThemedText style={styles.emptyText}>
                                            History kosong
                                        </ThemedText>
                                    </View>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <ThemedButton
                                    title="Lupakan Scanner"
                                    variant="danger"
                                    size={isTablet ? "base" : "medium"}
                                    onPress={handleForgetDevice}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </>
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
        hiddenInput: {
            position: "absolute",
            opacity: 0,
            height: 0,
            width: 0,
        },
        // Status Card Styles
        statusCard: {
            marginTop: isTablet ? 20 : 12,
            borderRadius: isTablet ? 16 : 12,
            backgroundColor: Colors[colorScheme].secondary,
            padding: isTablet ? 20 : 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        statusHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: isTablet ? 16 : 12,
        },
        statusIconContainer: {
            width: isTablet ? 56 : 48,
            height: isTablet ? 56 : 48,
            borderRadius: isTablet ? 16 : 12,
            backgroundColor: Colors[colorScheme].primary + "15",
            alignItems: "center",
            justifyContent: "center",
        },
        statusInfo: {
            flex: 1,
            gap: isTablet ? 4 : 2,
        },
        statusDeviceName: {
            fontSize: isTablet ? 20 : 16,
            fontWeight: "700",
        },
        statusBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: isTablet ? 8 : 6,
        },
        statusDot: {
            width: isTablet ? 10 : 8,
            height: isTablet ? 10 : 8,
            borderRadius: isTablet ? 5 : 4,
        },
        statusText: {
            fontSize: isTablet ? 14 : 12,
            color: Colors[colorScheme].icon,
        },
        settingsButton: {
            width: isTablet ? 44 : 36,
            height: isTablet ? 44 : 36,
            borderRadius: isTablet ? 12 : 8,
            backgroundColor: Colors[colorScheme].background,
            alignItems: "center",
            justifyContent: "center",
        },
        addScannerContainer: {
            marginTop: isTablet ? 16 : 12,
            paddingTop: isTablet ? 16 : 12,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme].border,
            alignItems: "center",
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
        infoBox: {
            flexDirection: "row",
            gap: isTablet ? 10 : 8,
            padding: isTablet ? 14 : 10,
            marginTop: isTablet ? 16 : 12,
            borderRadius: isTablet ? 10 : 8,
            backgroundColor: Colors[colorScheme].primary + "12",
            borderWidth: 1,
            borderColor: Colors[colorScheme].primary + "25",
            alignItems: "center",
        },
        infoText: {
            flex: 1,
            fontSize: isTablet ? 15 : 13,
            color: Colors[colorScheme].primary,
            lineHeight: isTablet ? 22 : 18,
        },
        // Result Card Styles
        resultCard: {
            marginTop: isTablet ? 20 : 16,
            borderRadius: isTablet ? 16 : 12,
            backgroundColor: Colors[colorScheme].secondary,
            padding: isTablet ? 20 : 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        resultHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isTablet ? 12 : 8,
        },
        resultLabel: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: "600",
            color: Colors[colorScheme].text,
        },
        resultTimestamp: {
            fontSize: isTablet ? 13 : 11,
            color: Colors[colorScheme].primary,
            fontWeight: "500",
        },
        lastBarcodeContainer: {
            padding: isTablet ? 20 : 16,
            borderRadius: isTablet ? 12 : 8,
            backgroundColor: Colors[colorScheme].primary + "10",
            borderWidth: 2,
            borderColor: Colors[colorScheme].primary,
            alignItems: "center",
            justifyContent: "center",
            minHeight: isTablet ? 80 : 64,
            flexDirection: "row",
            gap: isTablet ? 12 : 10,
        },
        barcodeIconContainer: {
            width: isTablet ? 48 : 40,
            height: isTablet ? 48 : 40,
            borderRadius: isTablet ? 12 : 8,
            backgroundColor: Colors[colorScheme].primary,
            alignItems: "center",
            justifyContent: "center",
        },
        barcodeText: {
            flex: 1,
            fontSize: isTablet ? 22 : 18,
            fontWeight: "700",
            fontFamily: "monospace",
            color: Colors[colorScheme].text,
        },
        waitingScanContainer: {
            alignItems: "center",
            justifyContent: "center",
            gap: isTablet ? 12 : 8,
            paddingVertical: isTablet ? 12 : 8,
        },
        waitingText: {
            fontSize: isTablet ? 15 : 13,
            color: Colors[colorScheme].icon,
        },
        emptyText: {
            fontSize: isTablet ? 16 : 14,
            color: Colors[colorScheme].icon,
            textAlign: "center",
        },
        // History Card Styles
        historyCard: {
            marginTop: isTablet ? 16 : 12,
            borderRadius: isTablet ? 16 : 12,
            backgroundColor: Colors[colorScheme].secondary,
            padding: isTablet ? 20 : 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        historyHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isTablet ? 16 : 12,
        },
        historyList: {
            maxHeight: isTablet ? 400 : 300,
        },
        historyItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: isTablet ? 14 : 10,
            paddingHorizontal: isTablet ? 14 : 10,
            borderRadius: isTablet ? 10 : 8,
            backgroundColor: Colors[colorScheme].background,
            marginBottom: isTablet ? 8 : 6,
            gap: isTablet ? 12 : 10,
        },
        historyNumberBadge: {
            width: isTablet ? 32 : 26,
            height: isTablet ? 32 : 26,
            borderRadius: isTablet ? 8 : 6,
            backgroundColor: Colors[colorScheme].primary + "15",
            alignItems: "center",
            justifyContent: "center",
        },
        historyIndex: {
            fontSize: isTablet ? 14 : 12,
            fontWeight: "600",
            color: Colors[colorScheme].primary,
        },
        historyText: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: "600",
            fontFamily: "monospace",
            flex: 1,
            color: Colors[colorScheme].text,
        },
        emptyHistoryContainer: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: isTablet ? 48 : 32,
            gap: isTablet ? 16 : 12,
        },
        actionButtons: {
            flexDirection: "row",
            gap: isTablet ? 12 : 8,
            marginTop: isTablet ? 20 : 16,
            marginBottom: isTablet ? 20 : 16,
        },
    });

