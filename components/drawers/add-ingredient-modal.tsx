"use client";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { productApi } from "@/services/endpoints/products";
import { Product, ProductVariant } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

type AddIngredientModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (payload: {
        variantId: string;
        variantName: string;
        productName: string;
        quantity: number;
        unitPrice: number;
    }) => void;
};

type Step = "search" | "variant" | "quantity";

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
    visible,
    onClose,
    onConfirm,
}) => {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const styles = createStyles(colorScheme, isTablet);

    const [step, setStep] = useState<Step>("search");
    const [searchQuery, setSearchQuery] = useState("");
    const [ingredients, setIngredients] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setStep("search");
            setSearchQuery("");
            setIngredients([]);
            setSelectedProduct(null);
            setSelectedVariant(null);
            setQuantity(1);
        }
    }, [visible]);

    // Fetch ingredients with debounce
    const fetchIngredients = useCallback(async (query: string) => {
        try {
            setIsLoading(true);
            const response = await productApi.getIngredients({
                search: query || undefined,
            });
            if (response.data) {
                setIngredients(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch ingredients:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible && step === "search") {
            const timer = setTimeout(() => {
                fetchIngredients(searchQuery);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, visible, step, fetchIngredients]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);

        // Check variants count
        if (product.variants && product.variants.length > 1) {
            // Multiple variants - show variant selection
            setStep("variant");
        } else if (product.variants && product.variants.length === 1) {
            // Single variant - use it directly
            setSelectedVariant(product.variants[0]);
            setStep("quantity");
        } else {
            // No variants - use product itself as variant
            setSelectedVariant({
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
            });
            setStep("quantity");
        }
    };

    const handleSelectVariant = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setStep("quantity");
    };

    const handleIncrease = () => setQuantity((prev) => prev + 1);
    const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleConfirm = () => {
        if (!selectedProduct || !selectedVariant) return;
        onConfirm({
            variantId: selectedVariant.id,
            variantName: selectedVariant.name,
            productName: selectedProduct.name,
            quantity,
            unitPrice: selectedVariant.price,
        });
        onClose();
    };

    const handleBack = () => {
        if (step === "quantity") {
            if (selectedProduct?.variants && selectedProduct.variants.length > 1) {
                setStep("variant");
            } else {
                setStep("search");
            }
        } else if (step === "variant") {
            setStep("search");
            setSelectedProduct(null);
        }
    };

    const renderSearchStep = () => (
        <View style={styles.cardContent}>
            <Text style={styles.title}>TAMBAH BAHAN</Text>

            <View style={styles.searchWrapper}>
                <Ionicons
                    name="search-outline"
                    size={isTablet ? 20 : 16}
                    color={Colors[colorScheme].icon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari bahan..."
                    placeholderTextColor={Colors[colorScheme].icon}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                />
            </View>

            {isLoading ? (
                <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color={Colors[colorScheme].primary} />
                </View>
            ) : (
                <FlatList
                    data={ingredients}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.ingredientRow}
                            onPress={() => handleSelectProduct(item)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.ingredientName}>{item.name}</Text>
                                <Text style={styles.ingredientInfo}>
                                    {item.variants && item.variants.length > 1
                                        ? `${item.variants.length} varian`
                                        : `Rp ${(item.variants?.[0]?.price || item.price || 0).toLocaleString("id-ID")}`}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={isTablet ? 20 : 16}
                                color={Colors[colorScheme].icon}
                            />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {searchQuery ? "Tidak ditemukan" : "Ketik untuk mencari bahan"}
                        </Text>
                    }
                />
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>BATAL</Text>
            </TouchableOpacity>
        </View>
    );

    const renderVariantStep = () => (
        <View style={styles.cardContent}>
            <View style={styles.stepHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons
                        name="arrow-back"
                        size={isTablet ? 24 : 20}
                        color={Colors[colorScheme].text}
                    />
                </TouchableOpacity>
                <Text style={styles.title}>PILIH VARIAN</Text>
                <View style={styles.backButton} />
            </View>

            <Text style={styles.productName}>{selectedProduct?.name}</Text>

            {selectedProduct?.variants?.map((variant) => (
                <TouchableOpacity
                    key={variant.id}
                    style={styles.variantRow}
                    onPress={() => handleSelectVariant(variant)}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.variantName}>{variant.name}</Text>
                        <View style={styles.variantSubtitlePill}>
                            <Text style={styles.variantSubtitleText}>
                                {`Stok ${variant.stock ?? "-"} - Rp ${variant.price.toLocaleString("id-ID")}`}
                            </Text>
                        </View>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={isTablet ? 20 : 16}
                        color={Colors[colorScheme].icon}
                    />
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>BATAL</Text>
            </TouchableOpacity>
        </View>
    );

    const renderQuantityStep = () => (
        <View style={styles.cardContent}>
            <View style={styles.stepHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons
                        name="arrow-back"
                        size={isTablet ? 24 : 20}
                        color={Colors[colorScheme].text}
                    />
                </TouchableOpacity>
                <Text style={styles.title}>JUMLAH</Text>
                <View style={styles.backButton} />
            </View>

            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.variantName}>{selectedVariant?.name}</Text>
                    <Text style={styles.variantProductName}>{selectedProduct?.name}</Text>
                </View>
                <Text style={styles.priceText}>
                    Rp {(selectedVariant?.price || 0).toLocaleString("id-ID")}
                </Text>
            </View>

            <View style={styles.quantityWrapper}>
                <View style={styles.quantityRow}>
                    <TouchableOpacity style={styles.qtyButton} onPress={handleDecrease}>
                        <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>

                    <View style={styles.qtyValueContainer}>
                        <Text style={styles.qtyValue}>{quantity}</Text>
                    </View>

                    <TouchableOpacity style={styles.qtyButton} onPress={handleIncrease}>
                        <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footerRow}>
                <TouchableOpacity
                    style={[styles.footerButton, styles.footerButtonSecondary]}
                    onPress={onClose}
                >
                    <Text style={styles.footerButtonSecondaryText}>BATAL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.footerButton, styles.footerButtonPrimary]}
                    onPress={handleConfirm}
                >
                    <Text style={styles.footerButtonPrimaryText}>TAMBAH</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderContent = () => {
        switch (step) {
            case "search":
                return renderSearchStep();
            case "variant":
                return renderVariantStep();
            case "quantity":
                return renderQuantityStep();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>{renderContent()}</View>
            </View>
        </Modal>
    );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
    StyleSheet.create({
        backdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: isTablet ? 48 : 24,
        },
        card: {
            width: "100%",
            maxWidth: isTablet ? 500 : undefined,
            maxHeight: "80%",
            borderRadius: isTablet ? 20 : 16,
            backgroundColor: Colors[colorScheme].secondary,
            overflow: "hidden",
        },
        cardContent: {
            paddingHorizontal: isTablet ? 28 : 20,
            paddingVertical: isTablet ? 24 : 16,
        },
        stepHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isTablet ? 16 : 12,
        },
        backButton: {
            width: isTablet ? 40 : 32,
            height: isTablet ? 40 : 32,
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            textAlign: "center",
            fontSize: isTablet ? 24 : 20,
            fontWeight: "600",
            color: Colors[colorScheme].text,
            flex: 1,
        },
        searchWrapper: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors[colorScheme].background,
            borderRadius: isTablet ? 12 : 8,
            paddingHorizontal: isTablet ? 16 : 12,
            marginBottom: isTablet ? 16 : 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].border,
        },
        searchInput: {
            flex: 1,
            paddingVertical: isTablet ? 14 : 10,
            paddingLeft: isTablet ? 12 : 8,
            fontSize: isTablet ? 18 : 14,
            color: Colors[colorScheme].text,
        },
        list: {
            maxHeight: 300,
        },
        loadingWrapper: {
            paddingVertical: 32,
            alignItems: "center",
        },
        ingredientRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: isTablet ? 14 : 10,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].border,
        },
        ingredientName: {
            fontSize: isTablet ? 18 : 15,
            color: Colors[colorScheme].text,
            fontWeight: "500",
        },
        ingredientInfo: {
            fontSize: isTablet ? 14 : 12,
            color: Colors[colorScheme].icon,
            marginTop: 2,
        },
        emptyText: {
            textAlign: "center",
            color: Colors[colorScheme].icon,
            paddingVertical: 24,
            fontSize: isTablet ? 16 : 14,
        },
        productName: {
            fontSize: isTablet ? 18 : 15,
            color: Colors[colorScheme].icon,
            marginBottom: isTablet ? 12 : 8,
        },
        variantRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: isTablet ? 14 : 10,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].border,
        },
        variantName: {
            fontSize: isTablet ? 20 : 16,
            color: Colors[colorScheme].text,
            fontWeight: "500",
        },
        variantSubtitlePill: {
            marginTop: isTablet ? 6 : 4,
            alignSelf: "flex-start",
            paddingHorizontal: isTablet ? 14 : 10,
            paddingVertical: isTablet ? 6 : 4,
            borderRadius: 999,
            backgroundColor: Colors[colorScheme].background,
        },
        variantSubtitleText: {
            fontSize: isTablet ? 16 : 13,
            color: Colors[colorScheme].icon,
        },
        variantProductName: {
            fontSize: isTablet ? 18 : 14,
            color: Colors[colorScheme].icon,
            marginTop: isTablet ? 4 : 2,
        },
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isTablet ? 16 : 12,
        },
        priceText: {
            fontSize: isTablet ? 22 : 18,
            color: Colors[colorScheme].text,
            fontWeight: "600",
        },
        quantityWrapper: {
            marginBottom: isTablet ? 20 : 16,
        },
        quantityRow: {
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: Colors[colorScheme].border,
            borderRadius: isTablet ? 10 : 8,
            overflow: "hidden",
        },
        qtyButton: {
            width: isTablet ? 64 : 50,
            height: isTablet ? 64 : 50,
            backgroundColor: Colors[colorScheme].border,
            alignItems: "center",
            justifyContent: "center",
        },
        qtyButtonText: {
            fontSize: isTablet ? 26 : 20,
            color: Colors[colorScheme].text,
            fontWeight: "500",
        },
        qtyValueContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors[colorScheme].secondary,
        },
        qtyValue: {
            fontSize: isTablet ? 26 : 20,
            fontWeight: "600",
            color: Colors[colorScheme].text,
        },
        cancelButton: {
            marginTop: isTablet ? 16 : 12,
            height: isTablet ? 56 : 44,
            borderRadius: 999,
            backgroundColor: Colors[colorScheme].primary,
            alignItems: "center",
            justifyContent: "center",
        },
        cancelButtonText: {
            color: Colors[colorScheme].secondary,
            fontWeight: "600",
            fontSize: isTablet ? 20 : 16,
        },
        footerRow: {
            flexDirection: "row",
            columnGap: isTablet ? 12 : 8,
        },
        footerButton: {
            flex: 1,
            height: isTablet ? 56 : 44,
            borderRadius: isTablet ? 10 : 8,
            alignItems: "center",
            justifyContent: "center",
        },
        footerButtonSecondary: {
            borderWidth: 1,
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].secondary,
        },
        footerButtonSecondaryText: {
            color: Colors[colorScheme].text,
            fontWeight: "500",
            fontSize: isTablet ? 18 : 14,
        },
        footerButtonPrimary: {
            backgroundColor: Colors[colorScheme].primary,
        },
        footerButtonPrimaryText: {
            color: Colors[colorScheme].secondary,
            fontWeight: "600",
            fontSize: isTablet ? 20 : 16,
        },
    });

export default AddIngredientModal;
