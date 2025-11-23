import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type CategoryItemProps = {
    title: string;
    onEdit?: () => void;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ title, onEdit }) => {
    const colorScheme = useColorScheme() ?? "light";
    const styles = createStyles(colorScheme);

    return (
        <View style={styles.container}>

            <ThemedText style={styles.title}>{title}</ThemedText>

            <TouchableOpacity
                style={styles.editButton}
                onPress={onEdit}
                activeOpacity={0.8}
            >
                <Ionicons
                    name="pencil"
                    size={22}
                    color={Colors[colorScheme].primary}
                />
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].background,
        },
        leftRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        leftIcon: {
            marginRight: 12,
        },
        title: {
            fontWeight: "500",
            color: Colors[colorScheme].icon,
        },
        editButton: {
            paddingHorizontal: 4,
            paddingVertical: 4,
        },
    });

export default CategoryItem;

