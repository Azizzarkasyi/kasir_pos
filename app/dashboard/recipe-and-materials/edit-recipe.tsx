import ComboInput from "@/components/combo-input";
import ConfirmationDialog, { ConfirmationDialogHandle } from "@/components/drawers/confirmation-dialog";
import ImageUpload from "@/components/image-upload";
import ProductCard from "@/components/product-card";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditRecipeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [capitalPrice, setCapitalPrice] = useState(0);
  const [variants, setVariants] = useState<
    {name: string; price: number; stockText?: string}[]
  >([]);
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
    category?: string;
    imageUri?: string;
    capitalPrice?: string;
    variant_name?: string;
    variant_price?: string;
  }>();
  const {variant_name, variant_price} = params;

  React.useEffect(() => {
    if (variant_name && variant_price) {
      const priceNum = Number(String(variant_price).replace(/[^0-9]/g, ""));
      setVariants(prev => [...prev, {name: String(variant_name), price: priceNum}]);
      router.replace("/dashboard/product/add-product" as never);
    }
  }, [variant_name, variant_price, router]);

  useEffect(() => {
    if (params.name !== undefined) {
      setName(String(params.name));
    }
    if (params.price !== undefined) {
      setPrice(String(params.price));
    }
    if (params.category !== undefined) {
      setCategory(String(params.category));
    }
    if (params.imageUri !== undefined && params.imageUri !== "") {
      setImageUri(String(params.imageUri));
    }
    if (params.capitalPrice !== undefined) {
      const parsed = Number(String(params.capitalPrice).replace(/[^0-9]/g, ""));
      if (!Number.isNaN(parsed)) {
        setCapitalPrice(parsed);
      }
    }
  }, [params]);

  const isDirty =
    name.trim() !== "" ||
    price.trim() !== "" ||
    category.trim() !== "" ||
    imageUri !== null ||
    capitalPrice > 0 ||
    variants.length > 0;

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", e => {
      if (!isDirty) {
        return;
      }

      const action = e.data.action;
      e.preventDefault();

      confirmationRef.current?.showConfirmationDialog({
        title: "Konfirmasi",
        message: "Data belum disimpan. Yakin ingin keluar dari halaman ini?",
        onCancel: () => {
          // Tetap di sini
        },
        onConfirm: () => {
          navigation.dispatch(action);
        },
      });
    });

    return sub;
  }, [navigation, isDirty]);

  const formatIDR = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  const handleSave = () => {
    const payload = {
      name,
      price,
      category,
      imageUri,
      capitalPrice,
      variants,
    };
    console.log("Tambah produk", payload);
    router.back();
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 20,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ImageUpload
          uri={imageUri || undefined}
          initials={(name || "NP").slice(0, 2).toUpperCase()}
          onPress={() => {
            // Integrasi picker bisa ditambahkan nanti
            setImageUri(null);
          }}
        />

        <View style={{height: 24}} />

        <ThemedInput label="Nama Resep" value={name} onChangeText={setName} />
        <ComboInput
          label="Pilih Kategori"
          value={category}
          onChangeText={setCategory}
          items={[
            {label: "Pilih Kategori", value: ""},
            {label: "Umum", value: "umum"},
            {label: "Minuman", value: "minuman"},
            {label: "Makanan", value: "makanan"},
          ]}
        />

        <View style={styles.sectionDivider} />

        <ThemedText type="subtitle-2">Bahan</ThemedText>

        {variants.length > 0 ? (
          <>
            <View style={styles.sectionDivider} />
            {variants.map((v, idx) => (
              <ProductCard
                key={idx}
                initials={(v.name || "VR").slice(0, 2).toUpperCase()}
                name={v.name}
                subtitle={`Jumlah: ${formatIDR(v.price)}`}
                rightText={v.stockText || ""}
                onPress={() => {}}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <ThemedText type="default">
              Belum ada bahan, tap "Tambah Bahan" untuk menambahkan.
            </ThemedText>
          </View>
        )}

        <View style={styles.sectionDivider} />

        <ThemedButton
          title="Tambah Bahan"
          variant="secondary"
          onPress={() =>
            router.push(
              "/dashboard/recipe-and-materials/ingredients" as never,
            )
          }
        />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
      </View>

      <ConfirmationDialog ref={confirmationRef} />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    inlineCard: {
      marginTop: 8,
    },
    sectionDivider: {
      backgroundColor: Colors[colorScheme].tint,
      marginVertical: 16,
    },
    emptyStateContainer: {
      borderLeftWidth: 2,
      borderColor: Colors[colorScheme].icon,
      paddingVertical: 4,
      marginTop: 12,
      paddingHorizontal: 8,
      backgroundColor: Colors[colorScheme].background,

    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
