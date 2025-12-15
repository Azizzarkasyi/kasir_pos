import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Branch, branchApi } from "@/services/endpoints/branches";
import { useBranchStore } from "@/stores/branch-store";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

type OutletItemProps = {
  branch: Branch;
  isSelected: boolean;
  onPress: (branch: Branch) => void;
  styles: ReturnType<typeof createStyles>;
  isTablet: boolean;
  colorScheme: "light" | "dark";
};

const OutletItem: React.FC<OutletItemProps> = ({
  branch,
  isSelected,
  onPress,
  styles,
  isTablet,
  colorScheme,
}) => {
  const formatAddress = () => {
    const parts = [
      branch.village?.name,
      branch.subdistrict?.name,
      branch.city?.name,
      branch.province?.name,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.outletCard, isSelected && styles.outletCardSelected]}
      onPress={() => onPress(branch)}
    >
      <View style={styles.outletIconWrapper}>
        <AntDesign
          name="shop"
          size={isTablet ? 32 : 24}
          style={styles.outletIcon}
        />
      </View>

      <View style={styles.outletInfoWrapper}>
        <View style={styles.outletTitleRow}>
          <ThemedText
            style={[styles.outletName, isSelected && styles.outletNameSelected]}
          >
            {branch.name}
          </ThemedText>
        </View>
        <ThemedText style={styles.outletAddress}>{formatAddress()}</ThemedText>
      </View>

      {isSelected && (
        <View style={styles.checkboxWrapper}>
          <Ionicons
            name="checkmark-circle"
            size={isTablet ? 32 : 24}
            color="#22C55E"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const SelectBranchScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();

  // Use branch store
  const { currentBranchId, setCurrentBranch } = useBranchStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(currentBranchId);

  useEffect(() => {
    fetchBranches();
    // Sync local state with store
    if (currentBranchId) {
      setSelectedBranchId(currentBranchId);
    }
  }, [currentBranchId]);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await branchApi.getBranches();
      if (response.data) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBranch = async (branch: Branch) => {
    try {
      setSelectedBranchId(branch.id);
      // Use store to save branch (handles AsyncStorage internally)
      await setCurrentBranch({
        id: String(branch.id),
        name: branch.name,
        address: branch.address,
        province: branch.province ? { id: String(branch.province.id), name: branch.province.name } : undefined,
        city: branch.city ? { id: String(branch.city.id), name: branch.city.name } : undefined,
        subdistrict: branch.subdistrict ? { id: String(branch.subdistrict.id), name: branch.subdistrict.name } : undefined,
        village: branch.village ? { id: String(branch.village.id), name: branch.village.name } : undefined,
      });
      console.log("Selected branch saved via store:", branch.name);
    } catch (error) {
      console.error("Error saving selected branch:", error);
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort branches: selected branch first, then alphabetically
  const sortedBranches = [...filteredBranches].sort((a, b) => {
    if (a.id === selectedBranchId) return -1;
    if (b.id === selectedBranchId) return 1;
    return a.name.localeCompare(b.name);
  });

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
            style={[
              styles.searchWrapper,
              isSearchFocused && styles.searchWrapperFocused,
            ]}
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
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size={isTablet ? "large" : "small"}
                color={Colors[colorScheme].primary}
              />
            </View>
          ) : (
            <FlatList
              data={sortedBranches}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <OutletItem
                  branch={item}
                  isSelected={selectedBranchId === item.id}
                  onPress={handleSelectBranch}
                  styles={styles}
                  isTablet={isTablet}
                  colorScheme={colorScheme}
                />
              )}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <ThemedText style={styles.emptyText}>
                  {searchQuery ? "Outlet tidak ditemukan" : "Belum ada outlet"}
                </ThemedText>
              }
            />
          )}
        </View>
      </View>
    </>
  );
};

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
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
      lineHeight: isTablet ? 24 : 16,
      color: Colors[colorScheme].icon,
    },
    outletCardSelected: {
      borderColor: "#22C55E",
      borderWidth: 2,
    },
    outletNameSelected: {
      color: "#22C55E",
    },
    checkboxWrapper: {
      marginLeft: isTablet ? 12 : 8,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: isTablet ? 48 : 32,
    },
    listContainer: {
      paddingBottom: isTablet ? 24 : 16,
    },
    separator: {
      height: isTablet ? 16 : 12,
    },
    emptyText: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].icon,
      textAlign: "center",
      paddingVertical: isTablet ? 48 : 32,
    },
  });

export default SelectBranchScreen;
