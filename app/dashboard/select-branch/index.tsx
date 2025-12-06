
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

type OutletItemProps = {
  name: string;
  isPrimary?: boolean;
  address: string;
  styles: ReturnType<typeof createStyles>;
  isTablet: boolean;
};

const OutletItem: React.FC<OutletItemProps> = ({ name, isPrimary, address, styles, isTablet }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.outletCard}>
      <View style={styles.outletIconWrapper}>
        <AntDesign name="shop" size={isTablet ? 32 : 24} style={styles.outletIcon} />
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
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  return (
    <>
      <Header
        showHelp={false}
        title="Pilih Outlet"
        withNotificationButton={false}
      />

      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View
            style={[styles.searchWrapper, isSearchFocused && styles.searchWrapperFocused]}
          >
            <Ionicons
              name="search"
              size={isTablet ? 24 : 18}
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
            isTablet={isTablet}
          />
        </View>
      </View>
    </>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: isTablet ? 40 : 16,
      backgroundColor: Colors[colorScheme].background,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: isTablet ? 16 : 12,
      borderWidth: 1,
      marginTop: isTablet ? 32 : 24,
      borderColor: Colors[colorScheme].border,
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 16 : 12,
      marginBottom: isTablet ? 24 : 16,
      backgroundColor: Colors[colorScheme].secondary,
    },
    searchWrapperFocused: {
      borderColor: Colors[colorScheme].primary,
    },
    searchIcon: {
      color: Colors[colorScheme].icon,
      marginRight: isTablet ? 12 : 8,
    },
    searchInput: {
      flex: 1,
      fontSize: isTablet ? 20 : 14,
      paddingVertical: 0,
    },
    outletCard: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isTablet ? 20 : 12,
      paddingVertical: isTablet ? 18 : 12,
      borderRadius: isTablet ? 16 : 12,
      backgroundColor: Colors[colorScheme].secondary,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    outletIconWrapper: {
      width: isTablet ? 56 : 40,
      height: isTablet ? 56 : 40,
      borderRadius: isTablet ? 12 : 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].border2,
      marginRight: isTablet ? 16 : 12,
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
      marginBottom: isTablet ? 4 : 1,
      gap: isTablet ? 10 : 6,
    },
    outletName: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    outletBadge: {
      paddingHorizontal: isTablet ? 12 : 8,
      paddingVertical: isTablet ? 2 : 0,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].primary,
    },
    outletBadgeText: {
      fontSize: isTablet ? 14 : 10,
      color: "white",
    },
    outletAddress: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].icon,
    },
  });

export default SelectBranchScreen;

