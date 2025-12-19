import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Skeleton from "./skeleton";

export type ReportCardProps = {
  title: string;
  amount: string;
  subtitle: string;
  subtitleColor?: string;
};



const ReportCard: React.FC<ReportCardProps> = ({ title, amount, subtitle, subtitleColor }) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = useReportCardStyles(colorScheme);

  return (
    <View style={styles.reportCard}>
      <ThemedText type="defaultSemiBold" style={styles.reportCardTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.amountText}>{amount}</ThemedText>
      <ThemedText style={[styles.mutedText, subtitleColor && { color: subtitleColor }]}>
        {subtitle}
      </ThemedText>
    </View>
  );
};

const ReportCardSkeleton = () => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = useReportCardStyles(colorScheme);
  return (
    <View style={styles.reportCard}>
      <Skeleton width={110} height={14} type="rect" style={{ marginBottom: 10 }} />
      <Skeleton width={80} height={20} type="rect" style={{ marginBottom: 8 }} />
      <Skeleton width={110} height={12} type="rect" />
    </View>
  );
};

const useReportCardStyles = (colorScheme: "light" | "dark") => {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;

  return React.useMemo(
    () =>
      StyleSheet.create({
        reportCard: {
          // phone: tetap 2 per layar, tablet: kira-kira 3 per layar
          width: isTablet ? width / 3 - 32 : width * 0.5 - 40,
          minHeight: isTablet ? 130 : 100,
          backgroundColor: Colors[colorScheme].background,
          borderRadius: 10,
          borderColor: Colors[colorScheme].border,
          borderWidth: 1,
          paddingTop: isTablet ? 16 : 10,
          paddingBottom: isTablet ? 16 : 10,
          paddingHorizontal: isTablet ? 18 : 10,
        },
        reportCardTitle: {
          fontSize: isTablet ? 18 : 12,
          fontWeight: "400",
          marginBottom: isTablet ? 6 : 2,
        },
        amountText: {
          fontSize: isTablet ? 24 : 14,
          fontWeight: "bold",
          marginBottom: isTablet ? 6 : 2,
        },
        mutedText: {
          color: Colors[colorScheme].icon,
          marginTop: isTablet ? 4 : 8,
          fontSize: isTablet ? 16 : 12,
        },
      }),
    [colorScheme, width, height, isTablet]
  );
};

export { ReportCard, ReportCardSkeleton };
