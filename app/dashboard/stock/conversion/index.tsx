import Header from "@/components/header";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { getUnitSymbol } from "@/constants/units";
import { useColorScheme } from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import { Product } from "@/types/api";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StockItem = {
    id: string;
    variantId: string;
    productName: string;
    variantName?: string;
    quantity: number;
    unitId?: string;
    isDisabled?: boolean;
};

export default function StockConversionListScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const isLandscape = width > height;
    const isTabletLandscape = isTablet && isLandscape;
    const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const response = await productApi.getProductStock({ search });

            if (response.data) {
                const items: StockItem[] = [];
                response.data.forEach((variant: any) => {
                    // Only show items that have a unit assigned
                    if (variant.unit_id) {
                        items.push({
                            id: `${variant.product_id}-${variant.id}`,
                            variantId: variant.id,
                            productName: variant.product?.name || "Unknown Product",
                            variantName: variant.name,
                            quantity: variant.stock || 0,
                            unitId: variant.unit_id,
                            isDisabled: variant.product?.is_disabled || variant.is_disabled || false,
                        });
                    }
                });
                setStockItems(items);
            }
        } catch (error: any) {
            console.error("❌ Failed to load products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    const filteredItems = stockItems.filter(
        (item) =>
            item.productName.toLowerCase().includes(search.toLowerCase()) ||
            (item.variantName &&
                item.variantName.toLowerCase().includes(search.toLowerCase()))
    );

    const handleItemPress = (item: StockItem) => {
        router.push({
            pathname: "/dashboard/stock/conversion/[variantId]",
            params: { variantId: item.variantId },
        } as never);
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
            <Header title="Konversi Stok" showHelp={false} />
            <KeyboardAwareScrollView
                contentContainerStyle={{
                    paddingTop: isTablet ? 16 : 8,
                    paddingBottom: insets.bottom + (isTablet ? 60 : 40),
                }}
                enableOnAndroid
                keyboardOpeningTime={0}
                extraScrollHeight={24}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentWrapper}>
                    <View style={styles.searchRow}>
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                            <ThemedInput
                                label="Cari Produk"
                                value={search}
                                onChangeText={setSearch}
                                leftIconName="search"
                                showLabel={false}
                                size="md"
                                placeholder="Cari produk dengan unit"
                                width="100%"
                            />
                        </View>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
                        <ThemedText style={styles.loadingText}>Memuat data...</ThemedText>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {filteredItems.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons
                                    name="swap-horizontal"
                                    size={isTablet ? 64 : 48}
                                    color={Colors[colorScheme].icon}
                                />
                                <ThemedText style={styles.emptyTitle}>
                                    {search ? "Produk tidak ditemukan" : "Tidak ada produk dengan unit"}
                                </ThemedText>
                                <ThemedText style={styles.emptySubtitle}>
                                    Pastikan produk memiliki unit yang ditetapkan untuk konversi
                                </ThemedText>
                            </View>
                        ) : (
                            filteredItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.itemCard,
                                        item.isDisabled && styles.disabledCard,
                                    ]}
                                    activeOpacity={item.isDisabled ? 1 : 0.8}
                                    onPress={() => handleItemPress(item)}
                                    disabled={item.isDisabled}
                                >
                                    <View style={styles.avatar}>
                                        <ThemedText style={styles.avatarText}>
                                            {(item.productName || "PR")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </ThemedText>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText style={styles.productName} numberOfLines={1}>
                                            {item.productName}
                                        </ThemedText>
                                        {item.variantName && (
                                            <ThemedText style={styles.variantName} numberOfLines={1}>
                                                {item.variantName}
                                            </ThemedText>
                                        )}
                                    </View>
                                    <View style={styles.rightColumn}>
                                        {item.isDisabled ? (
                                            <View style={styles.disabledBadge}>
                                                <ThemedText style={styles.disabledBadgeText}>Nonaktif</ThemedText>
                                            </View>
                                        ) : (
                                            <>
                                                <ThemedText style={styles.stockLabel}>Stok</ThemedText>
                                                <ThemedText style={styles.stockCount}>
                                                    {item.quantity} {item.unitId ? getUnitSymbol(item.unitId) : ""}
                                                </ThemedText>
                                            </>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </KeyboardAwareScrollView>
        </View>
    );
}

const createStyles = (
    colorScheme: "light" | "dark",
    isTablet: boolean,
    isTabletLandscape: boolean
) =>
    StyleSheet.create({
        contentWrapper: {
            width: "100%",
            maxWidth: isTabletLandscape ? 960 : undefined,
            alignSelf: "center",
        },
        searchRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: isTablet ? 60 : 20,
            marginTop: isTablet ? 16 : 8,
            gap: isTablet ? 16 : 12,
        },
        listContainer: {
            marginTop: 12,
            paddingHorizontal: isTablet ? 60 : 20,
            gap: isTablet ? 12 : 8,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 60,
        },
        loadingText: {
            marginTop: 16,
            color: Colors[colorScheme].icon,
            fontSize: isTablet ? 18 : 14,
        },
        emptyContainer: {
            paddingTop: 60,
            paddingHorizontal: 40,
            alignItems: "center",
        },
        emptyTitle: {
            color: Colors[colorScheme].text,
            textAlign: "center",
            fontSize: isTablet ? 20 : 16,
            fontWeight: "600",
            marginTop: 16,
        },
        emptySubtitle: {
            color: Colors[colorScheme].icon,
            textAlign: "center",
            fontSize: isTablet ? 16 : 14,
            marginTop: 8,
        },
        itemCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: isTablet ? 16 : 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].border,
            paddingVertical: isTablet ? 16 : 12,
            backgroundColor: Colors[colorScheme].background,
        },
        disabledCard: {
            opacity: 0.5,
        },
        avatar: {
            width: isTablet ? 60 : 40,
            height: isTablet ? 60 : 40,
            borderRadius: isTablet ? 10 : 8,
            backgroundColor: Colors[colorScheme].border,
            alignItems: "center",
            justifyContent: "center",
        },
        avatarText: {
            color: Colors[colorScheme].background,
            fontWeight: "700",
            fontSize: isTablet ? 20 : 14,
        },
        productName: {
            color: Colors[colorScheme].text,
            fontSize: isTablet ? 20 : 14,
            lineHeight: isTablet ? 26 : 20,
            fontWeight: "700",
        },
        variantName: {
            color: Colors[colorScheme].icon,
            fontSize: isTablet ? 18 : 12,
            marginTop: isTablet ? 4 : 0,
        },
        rightColumn: {
            alignItems: "flex-end",
        },
        stockLabel: {
            color: Colors[colorScheme].icon,
            fontSize: isTablet ? 18 : 12,
            fontWeight: "700",
        },
        stockCount: {
            color: Colors[colorScheme].icon,
            fontSize: isTablet ? 18 : 12,
        },
        disabledBadge: {
            backgroundColor: Colors[colorScheme].border,
            paddingHorizontal: isTablet ? 12 : 8,
            paddingVertical: isTablet ? 6 : 4,
            borderRadius: isTablet ? 6 : 4,
        },
        disabledBadgeText: {
            color: Colors[colorScheme].icon,
            fontSize: isTablet ? 14 : 10,
            fontWeight: "600",
        },
    });
