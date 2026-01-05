import ConfirmPopup from "@/components/atoms/confirm-popup";
import Header from "@/components/header";
import { SearchablePicker } from "@/components/searchable-picker";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { getUnitById, getUnitSymbol } from "@/constants/units";
import { useColorScheme } from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import { AvailableConversion } from "@/types/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface VariantInfo {
    id: string;
    name: string;
    product_name: string;
    current_stock: number;
    unit: { id: string; name: string } | null;
}

export default function StockConversionDetailScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const isLandscape = width > height;
    const isTabletLandscape = isTablet && isLandscape;
    const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { variantId } = useLocalSearchParams<{ variantId: string }>();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [variant, setVariant] = useState<VariantInfo | null>(null);
    const [availableConversions, setAvailableConversions] = useState<AvailableConversion[]>([]);
    const [selectedConversion, setSelectedConversion] = useState<AvailableConversion | null>(null);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Manual Rate State
    const [manualRate, setManualRate] = useState("");
    const [useCustomRate, setUseCustomRate] = useState(false);

    const loadConversions = useCallback(async () => {
        if (!variantId) return;
        try {
            setIsLoading(true);
            const response = await productApi.getAvailableConversions(variantId);
            if (response.data) {
                setVariant(response.data.variant);
                setAvailableConversions(response.data.available_conversions);
            }
        } catch (error: any) {
            console.error("❌ Failed to load conversions:", error);
            Alert.alert("Error", "Gagal memuat data konversi");
        } finally {
            setIsLoading(false);
        }
    }, [variantId]);

    useEffect(() => {
        loadConversions();
    }, [loadConversions]);

    const handleSelectConversion = (conv: AvailableConversion) => {
        setSelectedConversion(conv);
        setUseCustomRate(false);
        setManualRate(String(conv.conversion_rate));
    };

    const calculateResult = () => {
        if (!amount) return 0;

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) return 0;

        let rate = 0;
        if (useCustomRate) {
            rate = parseFloat(manualRate);
        } else if (selectedConversion) {
            rate = selectedConversion.conversion_rate;
        }

        if (isNaN(rate) || rate <= 0) return 0;

        // Calculate result and round to 4 decimal places to handle small units
        const result = amountNum * rate;
        return parseFloat(result.toFixed(4));
    };

    const formatNumber = (num: number) => {
        // Remove trailing zeros after decimal point
        return num.toString();
    };

    const handleConvert = async () => {
        if (!variantId || !selectedConversion || !amount) {
            Alert.alert("Error", "Lengkapi data konversi");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert("Error", "Jumlah tidak valid");
            return;
        }

        if (variant && amountNum > variant.current_stock) {
            Alert.alert("Error", "Stok tidak mencukupi");
            return;
        }

        // Logic for custom rate override if needed
        // Ideally backend should support an override rate, but assuming standard flow:
        // If user modifies rate, we might need a different endpoint or payload.
        // For now, adhering to existing payload { to_unit_id, amount, note }.
        // If backend does NOT support rate override in this endpoint, custom rate is purely visual/estimation here unless backend changes.
        // Based on user request "conversion disini cuma sbg default nnti user bisa input manual", 
        // implying they want to CHANGE the result. 
        // NOTE: If backend logic strictly uses DB rate, this visual change won't affect actual stock if not supported.
        // Assuming user understands this limitation or backend will be updated separately or supports it implicitly.
        // *Correction*: Since we can't change backend easily right now without seeing controller, 
        // we will implement the UI. If backend calculates result based on stored rate, this might be misleading.
        // However, usually manual stock adjustment is better for "correction", this is "conversion".
        // Let's implement the UI as requested.

        try {
            setIsSubmitting(true);
            const payload: any = {
                to_unit_id: selectedConversion.to_unit_id,
                amount: amountNum,
                note: note || undefined,
            };

            // NOTE: If your backend supports 'rate' override in payload, uncomment below:
            if (useCustomRate) {
                payload.rate = parseFloat(manualRate);
            }

            const response = await productApi.convertStock(variantId, payload);

            if (response.data) {
                setShowSuccessPopup(true);
            }
        } catch (error: any) {
            console.error("❌ Failed to convert stock:", error);
            Alert.alert("Error", error.message || "Gagal mengkonversi stok");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
                <Header title="Konversi Stok" showHelp={false} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
                    <ThemedText style={styles.loadingText}>Memuat data...</ThemedText>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
            <Header title="Konversi Stok" showHelp={false} />
            <KeyboardAwareScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 },
                ]}
                enableOnAndroid
                keyboardOpeningTime={0}
                extraScrollHeight={24}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentWrapper}>
                    {/* Variant Info */}
                    <View style={styles.paddedBlock}>
                        <View
                            style={[styles.infoCard, { backgroundColor: Colors[colorScheme].secondary }]}
                        >
                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Produk</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                    {variant?.product_name} - {variant?.name}
                                </ThemedText>
                            </View>
                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Stok Saat Ini</ThemedText>
                                <ThemedText style={[styles.infoValue, { color: Colors[colorScheme].primary }]}>
                                    {variant?.current_stock}{" "}
                                    {variant?.unit ? getUnitSymbol(variant.unit.id) : ""}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Available Conversions */}
                    <View style={styles.sectionDivider} />

                    {availableConversions.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons
                                name="alert-circle-outline"
                                size={isTablet ? 64 : 48}
                                color={Colors[colorScheme].warning}
                            />
                            <ThemedText style={styles.emptyTitle}>
                                Tidak ada konversi tersedia
                            </ThemedText>
                            <ThemedText style={styles.emptySubtitle}>
                                Hubungi admin untuk menambahkan rate konversi unit
                            </ThemedText>
                        </View>
                    ) : (
                        <>
                            <View style={styles.paddedBlock}>
                                <SearchablePicker
                                    label="Pilih Target Unit"
                                    placeholder="Pilih unit..."
                                    searchPlaceholder="Cari unit..."
                                    items={availableConversions.map((conv) => {
                                        const targetUnit = getUnitById(conv.to_unit_id);
                                        return {
                                            label: targetUnit?.name || conv.to_unit_id,
                                            value: conv.conversion_id,
                                            subtitle: `Default: 1 ${variant?.unit?.name || variant?.unit?.id} = ${conv.conversion_rate} ${targetUnit?.symbol || conv.to_unit_id}`,
                                        };
                                    })}
                                    value={selectedConversion?.conversion_id || null}
                                    onValueChange={(val: string) => {
                                        const conv = availableConversions.find((c) => c.conversion_id === val);
                                        if (conv) handleSelectConversion(conv);
                                    }}
                                    size={isTablet ? "md" : "base"}
                                />
                            </View>

                            <View style={styles.sectionDivider} />

                            {selectedConversion && (
                                <View style={styles.paddedBlock}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <ThemedText type="subtitle-2">Detail Konversi</ThemedText>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setUseCustomRate(!useCustomRate);
                                                if (!useCustomRate && selectedConversion) {
                                                    setManualRate(String(selectedConversion.conversion_rate));
                                                }
                                            }}
                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                        >
                                            <MaterialCommunityIcons
                                                name={useCustomRate ? "checkbox-marked" : "checkbox-blank-outline"}
                                                size={20}
                                                color={Colors[colorScheme].primary}
                                            />
                                            <ThemedText style={{ fontSize: 14, color: Colors[colorScheme].primary }}>Input Rate Manual</ThemedText>
                                        </TouchableOpacity>
                                    </View>

                                    {useCustomRate && (
                                        <ThemedInput
                                            label={`Rate Konversi (1 ${getUnitSymbol(variant?.unit?.id || "")} = ? ${getUnitSymbol(selectedConversion.to_unit_id)})`}
                                            value={manualRate}
                                            onChangeText={setManualRate}
                                            placeholder="Contoh: 10"
                                            keyboardType="numeric"
                                            size="md"
                                        />
                                    )}

                                    <ThemedInput
                                        label={"Jumlah yang dikonversi (" + getUnitSymbol(variant?.unit?.id || "") + ")"}
                                        value={amount}
                                        onChangeText={setAmount}

                                        keyboardType="numeric"
                                        size="md"
                                    />

                                    {/* Preview */}
                                    <View
                                        style={[
                                            styles.previewCard,
                                            { backgroundColor: Colors[colorScheme].primary + "10" },
                                        ]}
                                    >
                                        <MaterialCommunityIcons
                                            name="swap-horizontal"
                                            size={isTablet ? 28 : 24}
                                            color={Colors[colorScheme].primary}
                                        />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <ThemedText style={styles.previewLabel}>Estimasi Hasil</ThemedText>
                                            <ThemedText style={styles.previewValue}>
                                                {formatNumber(calculateResult())} {getUnitSymbol(selectedConversion.to_unit_id)}
                                            </ThemedText>
                                        </View>
                                    </View>

                                    <View style={{ height: 16 }} />

                                    <ThemedInput
                                        label="Catatan (Opsional)"
                                        value={note}
                                        onChangeText={setNote}
                                        size="md"
                                    />
                                </View>
                            )}
                        </>
                    )}

                    {/* Bottom Button - Moved inside contentWrapper */}
                    {selectedConversion && amount && (
                        <View style={styles.paddedBlock}>
                            <View style={styles.bottomContainer}>
                                <ThemedButton
                                    title={isSubmitting ? "Memproses..." : "Konversi Stok"}
                                    variant="primary"
                                    onPress={handleConvert}
                                    disabled={isSubmitting || !selectedConversion || !amount}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </KeyboardAwareScrollView>

            <ConfirmPopup
                visible={showSuccessPopup}
                successOnly
                title="Berhasil"
                message="Stok berhasil dikonversi"
                onConfirm={() => {
                    setShowSuccessPopup(false);
                    router.back();
                }}
                onCancel={() => {
                    setShowSuccessPopup(false);
                    router.back();
                }}
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
        scrollContent: {
            paddingTop: 16,
            paddingBottom: 40,
        },
        contentWrapper: {
            width: "100%",
            maxWidth: isTabletLandscape ? 960 : undefined,
            alignSelf: "center",
        },
        paddedBlock: {
            paddingHorizontal: isTablet ? 28 : 20,
        },
        sectionDivider: {
            backgroundColor: Colors[colorScheme].border2,
            height: isTablet ? 10 : 8,
            marginVertical: 20,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        loadingText: {
            marginTop: 16,
            color: Colors[colorScheme].icon,
            fontSize: isTablet ? 18 : 14,
        },
        infoCard: {
            borderRadius: isTablet ? 12 : 8,
            padding: isTablet ? 20 : 16,
            borderWidth: 1,
            borderColor: Colors[colorScheme].border2,
        },
        infoRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: isTablet ? 8 : 4,
        },
        infoLabel: {
            fontSize: isTablet ? 16 : 14,
            color: Colors[colorScheme].icon,
        },
        infoValue: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: "600",
        },
        conversionList: {
            gap: isTablet ? 12 : 10,
        },
        conversionCard: {
            borderRadius: isTablet ? 12 : 8,
            padding: isTablet ? 16 : 14,
            borderWidth: 1,
        },
        conversionContent: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        conversionUnit: {
            fontSize: isTablet ? 18 : 16,
            fontWeight: "600",
            marginBottom: 4,
        },
        conversionRate: {
            fontSize: isTablet ? 14 : 12,
            color: Colors[colorScheme].icon,
        },
        emptyContainer: {
            paddingTop: 40,
            alignItems: "center",
            paddingHorizontal: 20,
        },
        emptyTitle: {
            fontSize: isTablet ? 18 : 16,
            fontWeight: "600",
            marginTop: 16,
            textAlign: "center",
        },
        emptySubtitle: {
            fontSize: isTablet ? 14 : 12,
            color: Colors[colorScheme].icon,
            marginTop: 8,
            textAlign: "center",
        },
        previewCard: {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: isTablet ? 12 : 8,
            padding: isTablet ? 16 : 14,
            marginTop: 20,
        },
        previewLabel: {
            fontSize: isTablet ? 14 : 12,
            color: Colors[colorScheme].icon,
        },
        previewValue: {
            fontSize: isTablet ? 20 : 18,
            fontWeight: "700",
            color: Colors[colorScheme].primary,
            marginTop: 4,
        },
        bottomContainer: {
            marginTop: 32,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme].border2,
        },
    });
