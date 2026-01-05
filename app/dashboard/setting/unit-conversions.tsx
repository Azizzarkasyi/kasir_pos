import ConfirmPopup from "@/components/atoms/confirm-popup";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { UNITS, UNIT_TYPE_LABELS } from "@/constants/units";
import { useColorScheme } from "@/hooks/use-color-scheme";
import unitConversionsApi from "@/services/endpoints/unit-conversions";
import { UnitConversion } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ConversionItem = UnitConversion & {
  fromUnitName: string;
  toUnitName: string;
};

export default function UnitConversionsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();

  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [allConversions, setAllConversions] = useState<ConversionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ConversionItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ConversionItem | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [fromUnitId, setFromUnitId] = useState("");
  const [toUnitId, setToUnitId] = useState("");
  const [conversionRate, setConversionRate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadConversions = async () => {
    try {
      setIsLoading(true);
      const response = await unitConversionsApi.getUnitConversions();

      if (response.data) {
        const items = response.data.map(conv => ({
          ...conv,
          fromUnitName: UNITS.find(u => u.id === conv.from_unit_id)?.name || conv.from_unit_id,
          toUnitName: UNITS.find(u => u.id === conv.to_unit_id)?.name || conv.to_unit_id,
        }));
        setAllConversions(items);
        setConversions(items);
      }
    } catch (error: any) {
      console.error("❌ Failed to load conversions:", error);
      Alert.alert("Error", error.message || "Gagal memuat data konversi");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversions();
    }, [])
  );

  // Filter conversions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setConversions(allConversions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allConversions.filter(item =>
        item.fromUnitName.toLowerCase().includes(query) ||
        item.toUnitName.toLowerCase().includes(query) ||
        UNITS.find(u => u.id === item.from_unit_id)?.symbol.toLowerCase().includes(query) ||
        UNITS.find(u => u.id === item.to_unit_id)?.symbol.toLowerCase().includes(query)
      );
      setConversions(filtered);
    }
  }, [searchQuery, allConversions]);

  const handleAdd = () => {
    setFromUnitId("");
    setToUnitId("");
    setConversionRate("");
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (item: ConversionItem) => {
    setFromUnitId(item.from_unit_id);
    setToUnitId(item.to_unit_id);
    setConversionRate(String(item.conversion_rate));
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDelete = (item: ConversionItem) => {
    setDeletingItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await unitConversionsApi.deleteUnitConversion(deletingItem.id);
      setShowDeleteConfirm(false);
      setDeletingItem(null);
      setShowSuccessPopup(true);
      loadConversions();
    } catch (error: any) {
      console.error("❌ Failed to delete conversion:", error);
      Alert.alert("Gagal", error.message || "Gagal menghapus konversi");
    }
  };

  const handleSave = async () => {
    if (!fromUnitId || !toUnitId || !conversionRate) {
      Alert.alert("Validasi", "Semua field harus diisi");
      return;
    }

    if (fromUnitId === toUnitId) {
      Alert.alert("Validasi", "Unit asal dan tujuan tidak boleh sama");
      return;
    }

    const rate = parseFloat(conversionRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert("Validasi", "Rate konversi harus lebih dari 0");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        await unitConversionsApi.updateUnitConversion(editingItem.id, {
          conversion_rate: rate,
        });
      } else {
        await unitConversionsApi.createUnitConversion({
          from_unit_id: fromUnitId,
          to_unit_id: toUnitId,
          conversion_rate: rate,
        });
      }

      setShowAddModal(false);
      setShowSuccessPopup(true);
      loadConversions();
    } catch (error: any) {
      console.error("❌ Failed to save conversion:", error);
      Alert.alert("Gagal", error.message || "Gagal menyimpan konversi");
    } finally {
      setIsSaving(false);
    }
  };

  const unitOptions = [
    { label: "Pilih Unit", value: "" },
    ...UNITS.map(unit => ({
      label: `${unit.name} (${unit.symbol})`,
      value: unit.id,
    })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header title="Konversi Unit" showHelp={false} />

      {/* Search Bar - Absolute Positioned */}
      <View style={styles.searchContainer}>
        <ThemedInput
          label="Cari Konversi"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari unit asal atau tujuan..."
          leftIconName="search"
          showLabel={false}
        />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: isTablet ? 16 : 8,
          paddingBottom: insets.bottom + (isTablet ? 60 : 40),
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ marginTop: isTablet ? 80 : 70 }}
      >
        <View style={styles.contentWrapper}>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
              <ThemedText style={styles.loadingText}>
                Memuat data konversi...
              </ThemedText>
            </View>
          ) : conversions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="swap-horizontal-outline"
                size={isTablet ? 80 : 60}
                color={Colors[colorScheme].icon}
              />
              <ThemedText style={styles.emptyText}>
                Belum ada konversi unit
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Konfigurasi konversi unit di menu pengaturan
              </ThemedText>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {conversions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.conversionItem}
                  onPress={() => handleEdit(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.conversionHeader}>
                    <View style={styles.conversionRow}>
                      <View style={styles.unitBox}>
                        <ThemedText style={styles.unitText}>
                          {item.fromUnitName}
                        </ThemedText>
                        <ThemedText style={styles.unitSymbol}>
                          {UNITS.find(u => u.id === item.from_unit_id)?.symbol}
                        </ThemedText>
                      </View>
                      <Ionicons
                        name="arrow-forward"
                        size={isTablet ? 24 : 20}
                        color={Colors[colorScheme].icon}
                      />
                      <View style={styles.unitBox}>
                        <ThemedText style={styles.unitText}>
                          {item.toUnitName}
                        </ThemedText>
                        <ThemedText style={styles.unitSymbol}>
                          {UNITS.find(u => u.id === item.to_unit_id)?.symbol}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.conversionFooter}>
                    <ThemedText style={styles.rateText}>
                      1 {UNITS.find(u => u.id === item.from_unit_id)?.symbol} = {item.conversion_rate} {UNITS.find(u => u.id === item.to_unit_id)?.symbol}
                    </ThemedText>
                    <Ionicons
                      name="chevron-forward"
                      size={isTablet ? 20 : 16}
                      color={Colors[colorScheme].icon}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle-2" style={styles.modalTitle}>
              {editingItem ? "Edit Konversi" : "Tambah Konversi"}
            </ThemedText>

            <ComboInput
              label="Unit Asal"
              disableAutoComplete
              value={UNITS.find(u => u.id === fromUnitId)?.name ?? ""}
              onChangeText={text => {
                const found = UNITS.find(u => u.name === text);
                if (found && !editingItem) setFromUnitId(found.id);
              }}
              items={unitOptions}
            />

            <ComboInput
              label="Unit Tujuan"
              disableAutoComplete
              value={UNITS.find(u => u.id === toUnitId)?.name ?? ""}
              onChangeText={text => {
                const found = UNITS.find(u => u.name === text);
                if (found && !editingItem) setToUnitId(found.id);
              }}
              items={unitOptions}
            />

            <ThemedInput
              label="Rate Konversi"
              value={conversionRate}
              onChangeText={setConversionRate}
              keyboardType="decimal-pad"
              placeholder={`1 ${UNITS.find(u => u.id === fromUnitId)?.symbol} = ? ${UNITS.find(u => u.id === toUnitId)?.symbol}`}
            />

            <View style={styles.modalButtons}>
              <ThemedButton
                title="Batal"
                variant="secondary"
                onPress={() => setShowAddModal(false)}
                style={styles.modalButton}
              />
              <ThemedButton
                title={isSaving ? "Menyimpan..." : "Simpan"}
                onPress={handleSave}
                disabled={isSaving}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      )}

      <ConfirmPopup
        visible={showDeleteConfirm}
        title="Hapus Konversi"
        message={`Apakah Anda yakin ingin menghapus konversi ${deletingItem?.fromUnitName} ke ${deletingItem?.toUnitName}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingItem(null);
        }}
      />

      <ConfirmPopup
        visible={showSuccessPopup}
        successOnly
        title="Berhasil"
        message="Data konversi berhasil disimpan"
        onConfirm={() => setShowSuccessPopup(false)}
        onCancel={() => setShowSuccessPopup(false)}
      />
    </View>
  );
}

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
  StyleSheet.create({
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isTablet ? 60 : 20,
      marginTop: isTablet ? 16 : 8,
      marginBottom: isTablet ? 20 : 12,
    },
    searchContainer: {
      position: "absolute",
      top: isTablet ? 120 : 110,
      left: 0,
      right: 0,
      paddingHorizontal: isTablet ? 60 : 20,
      zIndex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingBottom: isTablet ? 12 : 8,
    },
    headerTitle: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: "600",
    },
    addButton: {
      width: isTablet ? 48 : 40,
      height: isTablet ? 48 : 40,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
    },
    loadingText: {
      marginTop: 16,
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
    },
    emptyContainer: {
      paddingTop: 60,
      paddingHorizontal: 40,
      alignItems: "center",
    },
    emptyText: {
      marginTop: 16,
      color: Colors[colorScheme].text,
      fontSize: isTablet ? 18 : 16,
      fontWeight: "600",
    },
    emptySubtext: {
      marginTop: 8,
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 16 : 14,
      textAlign: "center",
    },
    listContainer: {
      paddingHorizontal: isTablet ? 60 : 20,
      paddingTop: isTablet ? 80 : 30,
    },
    conversionItem: {
      flexDirection: "column",
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 12 : 8,
      marginBottom: isTablet ? 12 : 8,
      overflow: "hidden",
    },
    conversionHeader: {
      padding: isTablet ? 16 : 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border2,
    },
    conversionFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 12 : 10,
      backgroundColor: Colors[colorScheme].border2,
    },
    conversionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 12 : 8,
      marginBottom: isTablet ? 8 : 4,
    },
    unitBox: {
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 8 : 6,
      borderRadius: isTablet ? 8 : 6,
      alignItems: "center",
    },
    unitText: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: "600",
    },
    unitSymbol: {
      fontSize: isTablet ? 14 : 12,
      color: Colors[colorScheme].icon,
    },
    rateText: {
      fontSize: isTablet ? 16 : 14,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isTablet ? 40 : 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: isTabletLandscape ? 600 : 500,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 32 : 24,
      paddingVertical: isTablet ? 32 : 24,
    },
    modalTitle: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: "600",
      marginBottom: isTablet ? 24 : 20,
    },
    modalButtons: {
      flexDirection: "row",
      gap: isTablet ? 12 : 8,
      marginTop: isTablet ? 24 : 20,
    },
    modalButton: {
      flex: 1,
    },
  });
