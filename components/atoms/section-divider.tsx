import { Colors } from "@/constants/theme";
import { StyleSheet, useColorScheme, View } from "react-native";

const SectionDivider = () => {
    const colorScheme = useColorScheme() ?? "light";
    const styles = createStyles(colorScheme);
    return <View style={styles.sectionDivider} />;
};


const createStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
        sectionDivider: {
            backgroundColor: Colors[colorScheme].border2,
            height: 6,
        },
    });

export default SectionDivider;