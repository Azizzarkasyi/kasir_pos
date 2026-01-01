import Header from "@/components/header";
import { DashboardMenuKey } from "@/components/layouts/dashboard/menu-config";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { statsApi } from "@/services";
import type { ReportDetailResponse } from "@/services/endpoints/stats";
import { useBranchStore } from "@/stores/branch-store";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";

const ReportDetailScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isPhone = !isTablet;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<DashboardMenuKey>("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [hasScrolledDown, setHasScrolledDown] = React.useState(false);
  const [reportData, setReportData] = React.useState<ReportDetailResponse | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const router = useRouter();

  const { currentBranchName } = useBranchStore();

  type RangePreset = "this_month" | "last_month" | "custom";
  const [rangePreset, setRangePreset] = React.useState<RangePreset>("this_month");
  const [customStart, setCustomStart] = React.useState<string>("");
  const [customEnd, setCustomEnd] = React.useState<string>("");
  const [appliedStart, setAppliedStart] = React.useState<string | undefined>(undefined);
  const [appliedEnd, setAppliedEnd] = React.useState<string | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());

  const formatISODate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getMonthRange = React.useCallback((monthOffset: number) => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const last = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
    return { start: formatISODate(first), end: formatISODate(last) };
  }, []);

  React.useEffect(() => {
    if (rangePreset === "this_month") {
      const r = getMonthRange(0);
      setAppliedStart(r.start);
      setAppliedEnd(r.end);
      return;
    }
    if (rangePreset === "last_month") {
      const r = getMonthRange(-1);
      setAppliedStart(r.start);
      setAppliedEnd(r.end);
      return;
    }
    // custom: keep appliedStart/appliedEnd until user presses Terapkan
  }, [getMonthRange, rangePreset]);

  const fetchReportData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      console.log("📊 Fetching report detail...", { appliedStart, appliedEnd });
      const data = await statsApi.getReportDetail(appliedStart, appliedEnd);
      setReportData(data);
    } catch (error) {
      console.error("❌ Error fetching report data:", error);
      setErrorMessage("Gagal memuat laporan. Coba tarik untuk refresh.");
    } finally {
      setIsLoading(false);
    }
  }, [appliedEnd, appliedStart]);

  React.useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 Report screen focused, refreshing data...");
      fetchReportData();
    }, [fetchReportData])
  );

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
  }, [fetchReportData]);

  const handleApplyCustom = () => {
    setAppliedStart(customStart || undefined);
    setAppliedEnd(customEnd || undefined);
  };

  const onStartDatePickerChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setCustomStart(formatISODate(selectedDate));
    }
  };

  const onEndDatePickerChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setCustomEnd(formatISODate(selectedDate));
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const MetricCard = ({ title, value, subtitle, color }: {
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={styles.metricCard}>
      <ThemedText
        style={styles.metricTitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </ThemedText>
      <ThemedText
        style={[styles.metricValue, color ? { color } : undefined]}
        numberOfLines={1}
        ellipsizeMode="tail"
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </ThemedText>
      {subtitle && (
        <ThemedText
          style={styles.metricSubtitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {subtitle}
        </ThemedText>
      )}
    </View>
  );

  const SalesDetailRow = ({ label, value, isTotal = false }: {
    label: string;
    value: string;
    isTotal?: boolean;
  }) => (
    <View style={[styles.salesDetailRow, isTotal && styles.totalRow]}>
      <ThemedText style={[styles.salesDetailLabel, isTotal && styles.totalLabel]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.salesDetailValue, isTotal && styles.totalValue]}>
        {value}
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          showBack={true}
          showHelp={false}
          title="Detail Laporan"
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ThemedText>Memuat data...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showHelp={false}
        title="Detail Laporan"
        // left={
        //   !isPhone ? (
        //     <TouchableOpacity
        //       onPress={openDrawer}
        //       style={styles.headerIconButton}
        //     >
        //       <Ionicons
        //         name="menu-outline"
        //         size={isTablet ? 36 : 24}
        //         color="white"
        //       />
        //     </TouchableOpacity>
        //   ) : undefined
        // }
        onBackPress={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom:
              !isTabletLandscape || (isTabletLandscape && hasScrolledDown)
                ? isTablet
                  ? 100
                  : 80
                : 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={event => {
          const offsetY = event.nativeEvent.contentOffset.y;
          if (offsetY > 80 && !hasScrolledDown) {
            setHasScrolledDown(true);
          } else if (offsetY <= 80 && hasScrolledDown) {
            setHasScrolledDown(false);
          }
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].primary}
            colors={[Colors[colorScheme].primary]}
          />
        }
      >
        <View style={styles.contentWrapper}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="subtitle-2" style={styles.sectionTitleNoMargin}>
                Rentang Tanggal
              </ThemedText>
              {!!appliedStart && !!appliedEnd && (
                <ThemedText style={styles.rangeLabel} numberOfLines={1}>
                  {`${appliedStart} s/d ${appliedEnd}`}
                </ThemedText>
              )}
            </View>

            <View style={styles.presetRow}>
              <TouchableOpacity
                style={[styles.presetChip, rangePreset === "this_month" && styles.presetChipActive]}
                onPress={() => setRangePreset("this_month")}
              >
                <ThemedText style={[styles.presetChipText, rangePreset === "this_month" && styles.presetChipTextActive]}>
                  Bulan Ini
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetChip, rangePreset === "last_month" && styles.presetChipActive]}
                onPress={() => setRangePreset("last_month")}
              >
                <ThemedText style={[styles.presetChipText, rangePreset === "last_month" && styles.presetChipTextActive]}>
                  Bulan Kemarin
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetChip, rangePreset === "custom" && styles.presetChipActive]}
                onPress={() => setRangePreset("custom")}
              >
                <ThemedText style={[styles.presetChipText, rangePreset === "custom" && styles.presetChipTextActive]}>
                  Custom
                </ThemedText>
              </TouchableOpacity>
            </View>

            {rangePreset === "custom" && (
              <View style={styles.customRangeContainer}>
                <View style={styles.customRangeRow}>
                  <View style={styles.customRangeField}>
                    <ThemedText style={styles.customRangeLabel}>Mulai</ThemedText>
                    <TouchableOpacity
                      onPress={() => setShowStartPicker(true)}
                      style={styles.datePickerButton}
                    >
                      <ThemedText style={styles.datePickerText}>
                        {customStart || "Pilih tanggal"}
                      </ThemedText>
                      <Ionicons
                        name="calendar-outline"
                        size={isTablet ? 20 : 18}
                        color={Colors[colorScheme].icon}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.customRangeField}>
                    <ThemedText style={styles.customRangeLabel}>Sampai</ThemedText>
                    <TouchableOpacity
                      onPress={() => setShowEndPicker(true)}
                      style={styles.datePickerButton}
                    >
                      <ThemedText style={styles.datePickerText}>
                        {customEnd || "Pilih tanggal"}
                      </ThemedText>
                      <Ionicons
                        name="calendar-outline"
                        size={isTablet ? 20 : 18}
                        color={Colors[colorScheme].icon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onStartDatePickerChange}
                  />
                )}
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onEndDatePickerChange}
                  />
                )}
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyCustom}>
                  <ThemedText style={styles.applyButtonText}>Terapkan</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors[colorScheme].secondary} />
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            </View>
          )}

          {/* Summary Cards */}
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Ringkasan Penjualan
            </ThemedText>
            {!!currentBranchName && (
              <ThemedText style={styles.sectionSubtitle} numberOfLines={1}>
                {`Outlet: ${currentBranchName}`}
              </ThemedText>
            )}
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Total Penjualan"
                value={formatCurrency(reportData?.total_penjualan || 0)}
                color={Colors[colorScheme].tint}
              />
              <MetricCard
                title="Total Keuntungan"
                value={formatCurrency(reportData?.total_keuntungan || 0)}
                color="#10b981"
              />
              <MetricCard
                title="Total Transaksi"
                value={reportData?.total_transaksi?.toString() || "0"}
                color="#3b82f6"
              />
              <MetricCard
                title="Produk Terjual"
                value={reportData?.produk_terjual?.toString() || "0"}
                color="#f59e0b"
              />
            </View>
          </View>

          {/* Sales Detail */}
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Detail Penjualan
            </ThemedText>
            <View style={styles.salesDetailContainer}>
              <SalesDetailRow
                label="Penjualan Kotor"
                value={formatCurrency(reportData?.detail_penjualan?.penjualan_kotor || 0)}
              />
              <SalesDetailRow
                label="Diskon"
                value={formatCurrency(reportData?.detail_penjualan?.diskon || 0)}
              />
              <SalesDetailRow
                label="Biaya Layanan"
                value={formatCurrency(reportData?.detail_penjualan?.biaya_layanan || 0)}
              />
              <SalesDetailRow
                label="Pajak"
                value={formatCurrency(reportData?.detail_penjualan?.pajak || 0)}
              />
              <SalesDetailRow
                label="Total"
                value={formatCurrency(reportData?.detail_penjualan?.total || 0)}
                isTotal={true}
              />
            </View>
          </View>

          {/* Best Selling Products */}
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Produk Terlaris
            </ThemedText>
            <View style={styles.productList}>
              {reportData?.produk_terlaris?.map((product: any, index: number) => (
                <View key={index} style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <View style={styles.productRank}>
                      <ThemedText style={styles.rankText}>{index + 1}</ThemedText>
                    </View>
                    <ThemedText style={styles.productName}>{product.name}</ThemedText>
                  </View>
                  <ThemedText style={styles.variantCount}>
                    {product.variant_count} terjual
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Insights */}
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Wawasan Penjualan
            </ThemedText>
            <View style={styles.insightsGrid}>
              <View style={styles.insightCard}>
                <Ionicons
                  name="trending-up-outline"
                  size={isTablet ? 32 : 24}
                  color={Colors[colorScheme].primary}
                />
                <ThemedText style={styles.insightTitle}>Rata-rata Penjualan/Hari</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {formatCurrency(reportData?.wawasan?.rata_rata_penjualan_per_hari || 0)}
                </ThemedText>
              </View>
              <View style={styles.insightCard}>
                <Ionicons
                  name="cart-outline"
                  size={isTablet ? 32 : 24}
                  color={Colors[colorScheme].primary}
                />
                <ThemedText style={styles.insightTitle}>Rata-rata Nilai/Transaksi</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {formatCurrency(reportData?.wawasan?.rata_rata_nilai_penjualan_per_transaksi || 0)}
                </ThemedText>
              </View>
              <View style={styles.insightCard}>
                <Ionicons
                  name="time-outline"
                  size={isTablet ? 32 : 24}
                  color={Colors[colorScheme].primary}
                />
                <ThemedText style={styles.insightTitle}>Jam Paling Ramai</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {reportData?.wawasan?.jam_paling_ramai || "-"}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {!isPhone && (
        <Sidebar
          activeKey={activeMenu}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          onSelect={key => setActiveMenu(key as DashboardMenuKey)}
        />
      )}
    </View>
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
      backgroundColor: Colors[colorScheme].background,
      paddingBottom: isTabletLandscape ? 80 : 20,
    },
    headerIconButton: {
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContainer: {
      paddingHorizontal: isTablet ? 60 : 16,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionCard: {
      backgroundColor:
        colorScheme === "dark" ? "#1f2122" : Colors[colorScheme].secondary,
      borderRadius: 12,
      padding: isTablet ? 16 : 12,
      marginBottom: isTablet ? 12 : 8,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      marginBottom: isTablet ? 12 : 10,
    },
    sectionTitleNoMargin: {
      fontSize: isTablet ? 20 : 18,
      fontWeight: "600",
    },
    rangeLabel: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 14 : 12,
      maxWidth: isTablet ? 360 : 220,
      textAlign: "right",
    },
    presetRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    presetChip: {
      paddingVertical: isTablet ? 10 : 8,
      paddingHorizontal: isTablet ? 14 : 12,
      borderRadius: 10,
      backgroundColor: colorScheme === "dark" ? "#202325" : Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#262a2d" : Colors[colorScheme].border,
    },
    presetChipActive: {
      backgroundColor: Colors[colorScheme].primary,
      borderColor: Colors[colorScheme].primary,
    },
    presetChipText: {
      fontSize: isTablet ? 14 : 12,
      color: Colors[colorScheme].text,
      fontWeight: "600",
    },
    presetChipTextActive: {
      color: Colors[colorScheme].secondary,
    },
    customRangeContainer: {
      marginTop: isTablet ? 14 : 12,
      gap: 10,
    },
    customRangeRow: {
      flexDirection: "row",
      gap: 12,
    },
    customRangeField: {
      flex: 1,
    },
    customRangeLabel: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 14 : 12,
      marginBottom: 6,
    },
    customRangeInput: {
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#262a2d" : Colors[colorScheme].border,
      backgroundColor: colorScheme === "dark" ? "#202325" : Colors[colorScheme].background,
      borderRadius: 10,
      paddingVertical: isTablet ? 12 : 10,
      paddingHorizontal: 12,
      color: Colors[colorScheme].text,
      fontSize: isTablet ? 16 : 14,
    },
    datePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#262a2d" : Colors[colorScheme].border,
      backgroundColor: colorScheme === "dark" ? "#202325" : Colors[colorScheme].background,
      borderRadius: 10,
      paddingVertical: isTablet ? 12 : 10,
      paddingHorizontal: 12,
    },
    datePickerText: {
      color: Colors[colorScheme].text,
      fontSize: isTablet ? 16 : 14,
    },
    applyButton: {
      alignSelf: "flex-start",
      paddingVertical: isTablet ? 10 : 8,
      paddingHorizontal: isTablet ? 14 : 12,
      borderRadius: 10,
      backgroundColor: Colors[colorScheme].primary,
    },
    applyButtonText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "700",
      fontSize: isTablet ? 14 : 12,
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].primary,
      marginBottom: 12,
    },
    errorText: {
      color: Colors[colorScheme].secondary,
      fontSize: isTablet ? 14 : 12,
      fontWeight: "600",
      flex: 1,
    },
    sectionTitle: {
      marginBottom: isTablet ? 10 : 8,
      fontSize: isTablet ? 24 : 18,
      fontWeight: "600",
    },
    sectionSubtitle: {
      marginTop: 0,
      marginBottom: isTablet ? 14 : 12,
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 12,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: isTablet ? 16 : 12,
    },
    metricCard: {
      width: isTablet ? "48%" : "48%",
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      padding: isTablet ? 16 : 10,
      minHeight: isTablet ? 130 : 100,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      justifyContent: "space-between",
    },
    metricTitle: {
      fontSize: isTablet ? 20 : 12,
      fontWeight: "400",
      color: Colors[colorScheme].text,
      marginBottom: isTablet ? 6 : 2,
    },
    metricValue: {
      fontSize: isTablet ? 28 : 14,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
      marginBottom: isTablet ? 6 : 2,
    },
    whiteText: {
      color: "white",
    },
    metricSubtitle: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].icon,
      marginTop: isTablet ? 4 : 8,
    },
    salesDetailContainer: {
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      padding: isTablet ? 16 : 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    salesDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: isTablet ? 12 : 10,
      borderBottomWidth: 1,
      borderBottomColor:
        colorScheme === "dark" ? "#262a2d" : Colors[colorScheme].border,
    },
    totalRow: {
      borderBottomWidth: 0,
      borderTopWidth: 2,
      borderTopColor: Colors[colorScheme].primary,
      paddingTop: isTablet ? 16 : 14,
      marginTop: isTablet ? 8 : 6,
    },
    salesDetailLabel: {
      fontSize: isTablet ? 16 : 14,
    },
    totalLabel: {
      fontWeight: "600",
      fontSize: isTablet ? 18 : 16,
    },
    salesDetailValue: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: "500",
    },
    totalValue: {
      fontWeight: "bold",
      fontSize: isTablet ? 18 : 16,
      color: Colors[colorScheme].primary,
    },
    productList: {
      gap: isTablet ? 12 : 10,
    },
    productItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      padding: isTablet ? 16 : 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    productInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 12 : 10,
    },
    productRank: {
      width: isTablet ? 32 : 28,
      height: isTablet ? 32 : 28,
      borderRadius: isTablet ? 16 : 14,
      backgroundColor: Colors[colorScheme].primary,
      justifyContent: "center",
      alignItems: "center",
    },
    rankText: {
      color: "white",
      fontWeight: "bold",
      fontSize: isTablet ? 14 : 12,
    },
    productName: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: "500",
    },
    variantCount: {
      fontSize: isTablet ? 14 : 12,
      color: Colors[colorScheme].icon,
    },
    insightsGrid: {
      gap: isTablet ? 16 : 12,
    },
    insightCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 16 : 12,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      padding: isTablet ? 16 : 10,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    insightTitle: {
      flex: 1,
      fontSize: isTablet ? 16 : 14,
      color: Colors[colorScheme].icon,
    },
    insightValue: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: "600",
    },
  });

export default ReportDetailScreen;
