
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type OutletItemProps = {
  name: string;
  isPrimary?: boolean;
  address: string;
  styles: ReturnType<typeof createStyles>;
};

const OutletItem: React.FC<OutletItemProps> = ({ name, isPrimary, address, styles }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.outletCard}>
      <View style={styles.outletIconWrapper}>
        <AntDesign name="shop" size={24} style={styles.outletIcon} />
      </View>

      <View style={styles.outletInfoWrapper}>
        <View style={styles.outletTitleRow}>
          <ThemedText style={styles.outletName}>{name}</ThemedText>
          {isPrimary && (
            <View style={styles.outletBadge}>
              <ThemedText style={styles.outletBadgeText}>Utama</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.outletAddress}>{address}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const SelectBranchScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      <Header
        showHelp={false}
        title="Pilih Outlet"
        withNotificationButton={false}
      />
      <View
        style={[styles.searchWrapper, isSearchFocused && styles.searchWrapperFocused]}
      >
        <Ionicons
          name="search"
          size={18}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Cari Outlet"
          placeholderTextColor="#A0A0A0"
          style={styles.searchInput}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>

      <OutletItem
        name="Pusat"
        isPrimary
        address="Arjowinangun, Kalipare, Kab. Malang"
        styles={styles}
      />
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: Colors[colorScheme].background,
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 24,
      borderColor: Colors[colorScheme].border,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 16,
      backgroundColor: Colors[colorScheme].secondary,
    },
    searchWrapperFocused: {
      borderColor: Colors[colorScheme].primary,
    },
    searchIcon: {
      color: Colors[colorScheme].icon,
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 0,
    },
    outletCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].secondary,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    outletIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].border2,
      marginRight: 12,
    },
    outletIcon: {
      color: Colors[colorScheme].icon,
    },
    outletInfoWrapper: {
      flex: 1,
    },
    outletTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 1,
      gap: 6,
    },
    outletName: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    outletBadge: {
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].primary,
    },
    outletBadgeText: {
      fontSize: 10,
      color: Colors[colorScheme].text,
    },
    outletAddress: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
    },
  });

export default SelectBranchScreen;

