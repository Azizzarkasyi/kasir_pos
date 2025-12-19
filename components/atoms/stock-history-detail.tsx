import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDetailDate } from "@/utils/date-utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

export type StockHistoryDetailProps = {
  productName: string;
  variantName: string;
  actionType: "add_stock" | "remove_stock" | "adjust_stock" | "sale";
  amount: number;
  prevStock: number;
  currStock: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

const StockHistoryDetail: React.FC<StockHistoryDetailProps> = ({
  productName,
  variantName,
  actionType,
  amount,
  prevStock,
  currStock,
  note,
  createdAt,
  updatedAt,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = useStockHistoryDetailStyles(colorScheme);

  const getActionTypeConfig = () => {
    switch (actionType) {
      case "add_stock":
        return {
          icon: "add-circle-outline",
          color: "#10b981",
          label: "Stok Masuk",
          bgGradient: ["#10b981", "#059669"],
        };
      case "remove_stock":
        return {
          icon: "remove-circle-outline",
          color: "#ef4444",
          label: "Stok Keluar",
          bgGradient: ["#ef4444", "#dc2626"],
        };
      case "adjust_stock":
        return {
          icon: "sync-outline",
          color: "#f59e0b",
          label: "Penyesuaian Stok",
          bgGradient: ["#f59e0b", "#d97706"],
        };
      case "sale":
        return {
          icon: "cart-outline",
          color: "#8b5cf6",
          label: "Terjual",
          bgGradient: ["#8b5cf6", "#7c3aed"],
        };
      default:
        return {
          icon: "help-circle-outline",
          color: Colors[colorScheme].icon,
          label: "Tidak Diketahui",
          bgGradient: [Colors[colorScheme].icon, Colors[colorScheme].icon],
        };
    }
  };

  const actionConfig = getActionTypeConfig();

  return (
    <View style={styles.container}>
      {/* Hero Header with Neutral Color */}
      <View style={[styles.heroSection, { backgroundColor: colorScheme === "dark" ? "#1a1d1f" : Colors[colorScheme].secondary }]}>
        <View style={styles.heroPattern}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.patternCircle, { backgroundColor: actionConfig.color }]} />
          ))}
        </View>
        <View style={styles.heroContent}>
          <View style={styles.productHeader}>
            <ThemedText style={styles.productName}>{productName}</ThemedText>
            <ThemedText style={styles.variantName}>{variantName}</ThemedText>
          </View>
          <View style={[styles.actionBadge, { backgroundColor: actionConfig.color }]}>
            <Ionicons name={actionConfig.icon as any} size={24} color="white" />
            <ThemedText style={styles.actionLabel}>{actionConfig.label}</ThemedText>
          </View>
        </View>
      </View>

      {/* Stock Change Card */}
      <View style={styles.stockCard}>
        <View style={styles.stockHeader}>
          <Ionicons name="analytics-outline" size={20} color={Colors[colorScheme].icon} />
          <ThemedText style={styles.stockTitle}>Perubahan Stok</ThemedText>
        </View>
        <View style={styles.stockChangeContainer}>
          <View style={styles.stockBox}>
            <ThemedText style={styles.stockBoxLabel}>Awal</ThemedText>
            <ThemedText style={styles.stockBoxValue}>{prevStock}</ThemedText>
          </View>
          <View style={styles.changeArrow}>
            <Ionicons
              name={actionType === "remove_stock" || actionType === "sale" ? "remove-circle" : "add-circle"}
              size={32}
              color={actionConfig.color}
            />
            <ThemedText style={[styles.changeAmount, { color: actionConfig.color }]}>
              {actionType === "remove_stock" || actionType === "sale" ? "-" : "+"}{amount}
            </ThemedText>
          </View>
          <View style={styles.stockBox}>
            <ThemedText style={styles.stockBoxLabel}>Akhir</ThemedText>
            <ThemedText style={styles.stockBoxValue}>{currStock}</ThemedText>
          </View>
        </View>
      </View>

      {/* Details Grid */}
      <View style={styles.detailsSection}>
        <ThemedText style={styles.sectionTitle}>Informasi Transaksi</ThemedText>
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: actionConfig.color + "20" }]}>
              <Ionicons name="calendar-outline" size={20} color={actionConfig.color} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Tanggal</ThemedText>
              <ThemedText style={[styles.detailValue, styles.dateValue]}>{formatDetailDate(createdAt)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: actionConfig.color + "20" }]}>
              <Ionicons name="swap-vertical-outline" size={20} color={actionConfig.color} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Tipe</ThemedText>
              <ThemedText style={[styles.detailValue, { color: actionConfig.color }]}>
                {actionConfig.label}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: actionConfig.color + "20" }]}>
              <Ionicons name="layers-outline" size={20} color={actionConfig.color} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Stok Awal</ThemedText>
              <ThemedText style={styles.detailValue}>{prevStock} unit</ThemedText>
            </View>
          </View>
          
          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: actionConfig.color + "20" }]}>
              <Ionicons name="cube-outline" size={20} color={actionConfig.color} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Stok Akhir</ThemedText>
              <ThemedText style={styles.detailValue}>{currStock} unit</ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Note Section */}
      {note && (
        <View style={styles.noteSection}>
          <View style={styles.noteHeader}>
            <Ionicons name="document-text-outline" size={20} color={Colors[colorScheme].icon} />
            <ThemedText style={styles.noteTitle}>Catatan</ThemedText>
          </View>
          <View style={styles.noteBox}>
            <ThemedText style={styles.noteText}>{note}</ThemedText>
          </View>
        </View>
      )}

      {/* Footer */}
      {updatedAt && updatedAt !== createdAt && (
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={16} color={Colors[colorScheme].icon} />
          <ThemedText style={styles.footerText}>
            Diperbarui:{"\n"}{formatDetailDate(updatedAt)}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const useStockHistoryDetailStyles = (colorScheme: "light" | "dark") => {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;

  return React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: Colors[colorScheme].background,
        },
        heroSection: {
          paddingTop: isTablet ? 30 : 20,
          paddingBottom: isTablet ? 40 : 30,
          paddingHorizontal: isTablet ? 24 : 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          position: "relative",
          overflow: "hidden",
        },
        heroPattern: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
          alignItems: "center",
          opacity: 0.1,
        },
        patternCircle: {
          width: isTablet ? 80 : 60,
          height: isTablet ? 80 : 60,
          borderRadius: isTablet ? 40 : 30,
          backgroundColor: "white",
          margin: isTablet ? 20 : 15,
        },
        heroContent: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: isTablet ? 20 : 10,
        },
        productHeader: {
          flex: 1,
          marginRight: 20,
        },
        productName: {
          fontSize: isTablet ? 28 : 24,
          fontWeight: "bold",
          color: Colors[colorScheme].text,
          marginBottom: 6,
        },
        variantName: {
          fontSize: isTablet ? 16 : 14,
          color: Colors[colorScheme].icon,
        },
        actionBadge: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: isTablet ? 16 : 12,
          paddingVertical: isTablet ? 12 : 8,
          borderRadius: 25,
          gap: 8,
        },
        actionLabel: {
          fontSize: isTablet ? 16 : 14,
          fontWeight: "600",
          color: "white",
        },
        stockCard: {
          marginHorizontal: isTablet ? 24 : 20,
          marginTop: -20,
          padding: isTablet ? 24 : 20,
          backgroundColor: colorScheme === "dark" ? "#1a1d1f" : "white",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors[colorScheme].border,
          shadowColor: Colors[colorScheme].text,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        stockHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
        },
        stockTitle: {
          fontSize: isTablet ? 18 : 16,
          fontWeight: "600",
          color: Colors[colorScheme].text,
        },
        stockChangeContainer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        stockBox: {
          flex: 1,
          alignItems: "center",
          padding: isTablet ? 16 : 12,
          backgroundColor: colorScheme === "dark" ? "#212528" : Colors[colorScheme].secondary,
          borderRadius: 12,
        },
        stockBoxLabel: {
          fontSize: isTablet ? 12 : 11,
          color: Colors[colorScheme].icon,
          marginBottom: 4,
        },
        stockBoxValue: {
          fontSize: isTablet ? 28 : 24,
          fontWeight: "bold",
          color: Colors[colorScheme].text,
        },
        changeArrow: {
          alignItems: "center",
          marginHorizontal: isTablet ? 20 : 16,
        },
        changeAmount: {
          fontSize: isTablet ? 18 : 16,
          fontWeight: "bold",
          marginTop: 4,
        },
        detailsSection: {
          marginTop: isTablet ? 32 : 24,
          paddingHorizontal: isTablet ? 24 : 20,
        },
        sectionTitle: {
          fontSize: isTablet ? 20 : 18,
          fontWeight: "600",
          color: Colors[colorScheme].text,
          marginBottom: 16,
        },
        detailsGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 0,
        },
        detailCard: {
          width: "48%",
          flexDirection: "row",
          alignItems: "center",
          padding: isTablet ? 16 : 12,
          backgroundColor: colorScheme === "dark" ? "#1a1d1f" : "white",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors[colorScheme].border,
          marginBottom: isTablet ? 16 : 12,
          minHeight: isTablet ? 72 : 64,
        },
        detailIcon: {
          width: isTablet ? 40 : 36,
          height: isTablet ? 40 : 36,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          flexShrink: 0,
        },
        detailContent: {
          flex: 1,
          justifyContent: "center",
          alignItems: "flex-start",
        },
        detailLabel: {
          fontSize: isTablet ? 12 : 11,
          color: Colors[colorScheme].icon,
          marginBottom: 4,
        },
        detailValue: {
          fontSize: isTablet ? 14 : 13,
          fontWeight: "600",
          color: Colors[colorScheme].text,
          lineHeight: isTablet ? 18 : 16,
        },
        dateValue: {
          lineHeight: isTablet ? 20 : 18,
          textAlign: "left",
        },
        noteSection: {
          marginTop: isTablet ? 32 : 24,
          paddingHorizontal: isTablet ? 24 : 20,
        },
        noteHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        },
        noteTitle: {
          fontSize: isTablet ? 18 : 16,
          fontWeight: "600",
          color: Colors[colorScheme].text,
        },
        noteBox: {
          padding: isTablet ? 16 : 14,
          backgroundColor: colorScheme === "dark" ? "#1a1d1f" : "white",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors[colorScheme].border,
        },
        noteText: {
          fontSize: isTablet ? 14 : 13,
          color: Colors[colorScheme].text,
          lineHeight: isTablet ? 20 : 18,
        },
        footer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "auto",
          paddingVertical: isTablet ? 20 : 16,
          paddingHorizontal: isTablet ? 24 : 20,
          gap: 8,
        },
        footerText: {
          fontSize: isTablet ? 12 : 11,
          color: Colors[colorScheme].icon,
        },
      }),
    [colorScheme, width, height, isTablet]
  );
};

export default StockHistoryDetail;
