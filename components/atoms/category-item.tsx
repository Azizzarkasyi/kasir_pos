import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";

type CategoryItemProps = {
    title: string;
    onEdit?: () => void;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ title, onEdit }) => {
    const colorScheme = useColorScheme() ?? "light";
    const {width, height} = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const styles = createStyles(colorScheme, isTablet);

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <TouchableOpacity
                style={styles.editButton}
                onPress={onEdit}
                activeOpacity={0.8}
            >
                <AntDesign
                    name="edit"
                    size={isTablet ? 28 : 22}
                    color={Colors[colorScheme].primary}
                />
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: isTablet ? 16 : 12,
            paddingHorizontal: isTablet ? 20 : 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].background,
        },
        leftRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        leftIcon: {
            marginRight: isTablet ? 16 : 12,
        },
        title: {
            fontWeight: "500",
            fontSize: isTablet ? 20 : 16,
            color: Colors[colorScheme].icon,
        },
        editButton: {
            paddingHorizontal: isTablet ? 8 : 4,
            paddingVertical: isTablet ? 8 : 4,
        },
    });

export default CategoryItem;

