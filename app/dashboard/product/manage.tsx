import Header from "@/components/header";
import MenuRow from "@/components/menu-row";
import ProBadge from "@/components/ui/pro-badge";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserPlan } from "@/hooks/use-user-plan";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";

export default function ManageProductsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(isTablet, isTabletLandscape);
  const { isBasic } = useUserPlan();



  return (
    <>
      <Header title="Kelola Produk" showHelp={false} />
      <View
        style={[
          styles.container,
          isTablet && styles.containerTablet,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >

        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            isTablet && styles.contentContainerTablet,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            <View style={isTablet ? styles.spacerTablet : styles.spacer} />

          <View
            style={[
              styles.menuWrapper,
              isTablet && styles.menuWrapperTablet,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: Colors[colorScheme].border,
              },
            ]}
          >
            <MenuRow
              title="Produk"
              subtitle="Kelola semua produk untuk katalog toko kamu di sini."
              variant="link"
              showBottomBorder={false}
              onPress={() => router.push("/dashboard/product/products" as never)}
            />
          </View>

          <View
            style={[
              styles.menuWrapper,
              isTablet && styles.menuWrapperTablet,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: Colors[colorScheme].border,
              },
            ]}
          >
            <MenuRow
              title="Atur Stok"
              subtitle="Ubah, tambah, atau kurangi stok produk dengan cepat."
              variant="link"
              showBottomBorder={false}
              onPress={() => router.push("/dashboard/stock/manage" as never)}
            />
          </View>

          <View
            style={[
              styles.menuWrapper,
              isTablet && styles.menuWrapperTablet,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: Colors[colorScheme].border,
              },
            ]}
          >
            <MenuRow
              title="Bahan Baku & Resep"
              subtitle="Buat resep produk dari bahan baku."
              variant="link"
              showBottomBorder={false}
              onPress={() => {
                if (!isBasic) {
                  router.push("/dashboard/recipe-and-materials" as never);
                }
              }}
              disabled={isBasic}
              rightComponent={isBasic ? <ProBadge size="small" /> : undefined}
            />
          </View>
          </View>
        </ScrollView>
      </View>
    </>

  );
}

const createStyles = (isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 24,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    spacer: {
      height: 12,
    },
    menuWrapper: {
      paddingHorizontal: 20,
      borderBottomWidth: 1,
    },
    containerTablet: {
      paddingHorizontal: 24,
    },
    contentContainerTablet: {
      paddingBottom: 40,
    },
    spacerTablet: {
      height: 20,
    },
    menuWrapperTablet: {
      paddingHorizontal: 28,
    },
  });

export { };
