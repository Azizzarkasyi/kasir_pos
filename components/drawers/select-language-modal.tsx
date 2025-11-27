import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
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
    const styles = createStyles(colorScheme);

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
                                size={20}
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

const createStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
        backdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
        },
        card: {
            width: "100%",
            maxWidth: 420,
            borderRadius: 16,
            backgroundColor: Colors[colorScheme].secondary,
            paddingHorizontal: 24,
            paddingVertical: 24,
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
            marginBottom: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: "700",
            color: Colors[colorScheme].text,
        },
        optionsContainer: {
            marginTop: 10,
            rowGap: 16,
        },
        optionRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        radioOuter: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: Colors[colorScheme].primary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
        },
        radioInner: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: Colors[colorScheme].primary,
        },
        optionLabel: {
            fontSize: 16,
            color: Colors[colorScheme].text,
        },
    });

export default SelectLanguageModal;
