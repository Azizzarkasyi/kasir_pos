import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

export type ScannerTypeValue = "usb" | "bluetooth";

export type SelectScannerTypeModalProps = {
    visible: boolean;
    onSelect: (value: ScannerTypeValue) => void;
    onClose: () => void;
};

const SCANNER_TYPE_OPTIONS: { label: string; value: ScannerTypeValue; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "USB", value: "usb", icon: "hardware-chip-outline" },
    { label: "Bluetooth", value: "bluetooth", icon: "bluetooth" },
];

const SelectScannerTypeModal: React.FC<SelectScannerTypeModalProps> = ({
    visible,
    onSelect,
    onClose,
}) => {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const styles = createStyles(colorScheme, isTablet);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Pilih Jenis Scanner</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="close"
                                size={isTablet ? 28 : 20}
                                color={Colors[colorScheme].icon}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.optionsContainer}>
                        {SCANNER_TYPE_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.optionRow}
                                activeOpacity={0.7}
                                onPress={() => onSelect(option.value)}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={isTablet ? 28 : 22}
                                    color={Colors[colorScheme].icon}
                                    style={styles.optionIcon}
                                />
                                <Text style={styles.optionLabel}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
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
            paddingHorizontal: isTablet ? 40 : 24,
        },
        card: {
            width: "100%",
            maxWidth: isTablet ? 500 : 420,
            borderRadius: isTablet ? 20 : 16,
            backgroundColor: Colors[colorScheme].secondary,
            paddingHorizontal: isTablet ? 32 : 24,
            paddingVertical: isTablet ? 32 : 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
        },
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isTablet ? 24 : 16,
        },
        title: {
            fontSize: isTablet ? 22 : 18,
            fontWeight: "700",
            color: Colors[colorScheme].text,
        },
        optionsContainer: {
            marginTop: isTablet ? 16 : 10,
            rowGap: isTablet ? 24 : 16,
        },
        optionRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: isTablet ? 12 : 8,
        },
        optionIcon: {
            marginRight: isTablet ? 16 : 12,
        },
        optionLabel: {
            fontSize: isTablet ? 20 : 16,
            color: Colors[colorScheme].text,
        },
    });

export default SelectScannerTypeModal;
