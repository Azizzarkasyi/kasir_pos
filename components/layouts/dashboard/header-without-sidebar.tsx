import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DashboardHeaderProps = {
  onPressBack: () => void;
  title: string;
};

const HeaderWithoutSidebar = ({ onPressBack, title }: DashboardHeaderProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme, insets.top);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onPressBack}>
        <AntDesign
          name="close"
          size={18}
          style={{
            color: Colors[colorScheme].icon,
          }}
        />
      </TouchableOpacity>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", topInset: number) =>
  StyleSheet.create({
    container: {
      paddingTop: topInset +10,
      paddingHorizontal: 8,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: Colors[colorScheme].icon,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      gap: 16,
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      backgroundColor: Colors[colorScheme].background,
    },
    iconButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    title: {
      fontSize: 20,
      fontWeight: "500",
      flex: 1,

    },
  });

export default HeaderWithoutSidebar;
