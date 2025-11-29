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
};



const ReportCard: React.FC<ReportCardProps> = ({ title, amount, subtitle }) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = useReportCardStyles(colorScheme);

  return (
    <View style={styles.reportCard}>
      <ThemedText type="defaultSemiBold" style={styles.reportCardTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.amountText}>{amount}</ThemedText>
      <ThemedText style={styles.mutedText}>{subtitle}</ThemedText>
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
  const { width } = useWindowDimensions();

  return React.useMemo(
    () =>
      StyleSheet.create({
        reportCard: {
          width: width * 0.5 - 24,
          minHeight: 90,
          backgroundColor: Colors[colorScheme].background,
          borderRadius: 10,
          borderColor: Colors[colorScheme].border,
          borderWidth: 1,
          padding: 10,
        },
        reportCardTitle: {
          fontSize: 12,
          fontWeight: "400",
        },
        amountText: {
          fontSize: 14,
          fontWeight: "bold",
        },
        mutedText: {
          color: Colors[colorScheme].icon,
          marginTop: 4,
          fontSize: 12,
        },
      }),
    [colorScheme, width]
  );
};

export { ReportCard, ReportCardSkeleton };
