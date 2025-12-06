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

export type LanguageValue = "en" | "id";

export type SelectLanguageModalProps = {
    visible: boolean;
    value: LanguageValue;
    onChange: (value: LanguageValue) => void;
    onClose: () => void;
};

const LANGUAGE_OPTIONS: { label: string; value: LanguageValue }[] = [
    { label: "English", value: "en" },
    { label: "Indonesia", value: "id" },
];

const SelectLanguageModal: React.FC<SelectLanguageModalProps> = ({
    visible,
    value,
    onChange,
    onClose,
}) => {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const styles = createStyles(colorScheme, isTablet);

    const handleSelect = (next: LanguageValue) => {
        onChange(next);
    };

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
                        <Text style={styles.title}>Pilih Bahasa</Text>
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
                        {LANGUAGE_OPTIONS.map((option) => {
                            const selected = option.value === value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={styles.optionRow}
                                    activeOpacity={0.7}
                                    onPress={() => handleSelect(option.value)}
                                >
                                    <View style={styles.radioOuter}>
                                        {selected && <View style={styles.radioInner} />}
                                    </View>
                                    <Text style={styles.optionLabel}>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
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
        },
        radioOuter: {
            width: isTablet ? 32 : 24,
            height: isTablet ? 32 : 24,
            borderRadius: isTablet ? 16 : 12,
            borderWidth: 2,
            borderColor: Colors[colorScheme].primary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: isTablet ? 16 : 12,
        },
        radioInner: {
            width: isTablet ? 16 : 12,
            height: isTablet ? 16 : 12,
            borderRadius: isTablet ? 8 : 6,
            backgroundColor: Colors[colorScheme].primary,
        },
        optionLabel: {
            fontSize: isTablet ? 20 : 16,
            color: Colors[colorScheme].text,
        },
    });

export default SelectLanguageModal;
