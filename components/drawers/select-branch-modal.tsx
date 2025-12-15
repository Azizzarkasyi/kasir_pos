import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Branch, branchApi } from "@/services";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Checkbox from "../atoms/checkbox";

export type SelectBranchModalProps = {
  visible: boolean;
  selectedBranches: Branch[];
  onSelect: (branches: Branch[]) => void;
  onClose: () => void;
};

const SelectBranchModal: React.FC<SelectBranchModalProps> = ({
  visible,
  selectedBranches,
  onSelect,
  onClose,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (visible) {
      fetchBranches("");
      setSearchQuery("");
    }
  }, [visible]);

  const fetchBranches = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (query) {
        params.search = query;
      }
      const response = await branchApi.getBranches(params);
      if (response.data) {
        setBranches(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data outlet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      fetchBranches(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, visible]);

  const handleToggle = (branch: Branch) => {
    const isSelected = selectedBranches.some((b) => b.id === branch.id);
    if (isSelected) {
      onSelect(selectedBranches.filter((b) => b.id !== branch.id));
    } else {
      onSelect([...selectedBranches, branch]);
    }
  };

  const renderBranchItem = ({ item }: { item: Branch }) => {
    const isSelected = selectedBranches.some((b) => b.id === item.id);
    return (
      <TouchableOpacity
        style={styles.branchItem}
        activeOpacity={0.7}
        onPress={() => handleToggle(item)}
      >
        <View style={styles.branchInfo}>
          <Text style={styles.branchName}>{item.name}</Text>
          <Text style={styles.branchAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <Checkbox checked={isSelected} onPress={() => handleToggle(item)} />
      </TouchableOpacity>
    );
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
            <Text style={styles.title}>Pilih Outlet</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <Ionicons
              name="search"
              size={isTablet ? 22 : 18}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Cari Outlet"
              placeholderTextColor={Colors[colorScheme].icon}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => fetchBranches(searchQuery)}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : branches.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Tidak ada outlet tersedia</Text>
            </View>
          ) : (
            <FlatList
              data={branches}
              keyExtractor={(item) => item.id}
              renderItem={renderBranchItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
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
      justifyContent: "flex-end",
    },
    card: {
      maxHeight: "80%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: Colors[colorScheme].background,
      paddingTop: 20,
      paddingBottom: 32,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isTablet ? 24 : 20,
      marginBottom: 16,
    },
    title: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: "700",
      color: Colors[colorScheme].text,
    },
    listContent: {
      paddingHorizontal: isTablet ? 24 : 20,
    },
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: isTablet ? 24 : 20,
      marginBottom: isTablet ? 16 : 12,
      borderRadius: isTablet ? 16 : 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 12 : 10,
      backgroundColor: Colors[colorScheme].secondary,
    },
    searchIcon: {
      color: Colors[colorScheme].icon,
      marginRight: isTablet ? 12 : 8,
    },
    searchInput: {
      flex: 1,
      fontSize: isTablet ? 18 : 14,
      paddingVertical: 0,
      color: Colors[colorScheme].text,
    },
    branchItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: isTablet ? 16 : 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    branchInfo: {
      flex: 1,
      marginRight: 12,
    },
    branchName: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    branchAddress: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].icon,
    },
    centerContainer: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      fontSize: 14,
      color: Colors[colorScheme].danger,
      textAlign: "center",
      marginBottom: 12,
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: Colors[colorScheme].primary,
      borderRadius: 8,
    },
    retryText: {
      fontSize: 14,
      color: "#fff",
      fontWeight: "600",
    },
    emptyText: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      textAlign: "center",
    },
  });

export default SelectBranchModal;
