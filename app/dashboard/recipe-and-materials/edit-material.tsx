import VariantItem from "@/components/atoms/variant-item";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
import MerkPicker from "@/components/mollecules/merk-picker";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import {Product} from "@/types/api";
import {useProductFormStore} from "@/stores/product-form-store";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, Alert, StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function EditMaterialScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    name,
    price,
    brand,
    imageUri,
    capitalPrice,
    variants,
    setName,
    setPrice,
    setBrand,
    setImageUri,
    setCapitalPrice,
    setVariants,
    reset,
  } = useProductFormStore(state => state);

  const {
    id,
    name: paramName,
    brand: paramBrand,
    imageUri: paramImageUri,
    capitalPrice: paramCapitalPrice,
    variants: paramVariants,
    variant_name,
    variant_price,
  } = useLocalSearchParams<{
    id?: string;
    name?: string;
    brand?: string;
    imageUri?: string;
    capitalPrice?: string;
    variants?: string;
    variant_name?: string;
    variant_price?: string;
  }>();

  // Load material data from API
  useEffect(() => {
    const loadMaterial = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await productApi.getProduct(id);

        if (response.data) {
          const product = response.data;
          setName(product.name);
          setPrice(String(product.price));
          if (product.merk_id) setBrand(product.merk_id);
          if (product.photo_url) setImageUri(product.photo_url);
          if (product.capital_price) setCapitalPrice(product.capital_price);

          console.log("✅ Material loaded:", product);
        }
      } catch (error: any) {
        console.error("❌ Failed to load material:", error);
        Alert.alert("Error", "Gagal memuat data bahan");
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterial();
  }, [id]);

  React.useEffect(() => {
    if (variant_name && variant_price) {
      const priceNum = Number(String(variant_price).replace(/[^0-9]/g, ""));
      setVariants(prev => [
        ...prev,
        {name: String(variant_name), price: priceNum},
      ]);
      router.replace("/dashboard/recipe-and-materials/edit-material" as never);
    }
  }, [variant_name, variant_price, router]);

  const isDirty =
    name.trim() !== "" ||
    brand.trim() !== "" ||
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

  const handleSave = async () => {
    if (!id) {
      Alert.alert("Error", "ID bahan tidak ditemukan");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Nama bahan harus diisi");
      return;
    }

    const cleanPrice = String(price).replace(/[^0-9]/g, "");
    const numericPrice = Number(cleanPrice);

    if (!cleanPrice || numericPrice <= 0) {
      Alert.alert("Error", "Harga jual harus lebih dari 0");
      return;
    }

    if (!brand || brand.length < 10 || !brand.startsWith("cm")) {
      Alert.alert("Error", "Merk harus dipilih");
      return;
    }

    try {
      setIsSaving(true);

      const payload: any = {
        name: name.trim(),
        price: numericPrice,
        merk_id: brand,
        is_ingredient: true,
      };

      if (imageUri) payload.photo_url = imageUri;
      if (capitalPrice > 0) payload.capital_price = capitalPrice;

      console.log("📦 Updating material:", payload);

      const response = await productApi.updateProduct(id, payload);

      if (response.data) {
        console.log("✅ Material updated successfully:", response.data);
        Alert.alert("Sukses", "Bahan berhasil diperbarui", [
          {
            text: "OK",
            onPress: () => {
              reset();
              router.back();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Failed to update material:", error);
      Alert.alert("Error", error.message || "Gagal memperbarui bahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
        <Header
          showHelp={false}
          title="Edit Bahan"
          withNotificationButton={false}
        />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <ThemedText style={{marginTop: 16, color: Colors[colorScheme].icon}}>
            Memuat data bahan...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header
        showHelp={false}
        title="Edit Bahan"
        withNotificationButton={false}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 80,
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
            setImageUri(null);
          }}
        />

        <View style={{height: 24}} />
        <View style={styles.rowSection}>
          <ThemedInput
            label="Nama Produk"
            value={name}
            onChangeText={setName}
          />
          <ThemedInput
            label="Harga Jual"
            value={price}
            onChangeText={setPrice}
            numericOnly
          />
          <MerkPicker
            label="Pilih Merk"
            value={brand}
            size="md"
            onChange={setBrand}
          />

          <ThemedInput
            label="Harga Modal"
            value={String(capitalPrice)}
            onChangeText={v => setCapitalPrice(Number(v))}
            numericOnly
            placeholder="Harga Modal"
            placeholderTextColor={Colors[colorScheme].icon}
            inputContainerStyle={{
              backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#FFFFFF",
            }}
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.rowContent}>
          <MenuRow
            title="Kelola Stok"
            rightText="Stok Tidak Aktif"
            showBottomBorder={false}
            variant="link"
            onPress={() =>
              router.push("/dashboard/recipe-and-materials/stock" as never)
            }
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.variantsSection}>
          {variants.length > 0 ? (
            <>
              <ThemedText type="subtitle-2">Varian</ThemedText>
              {variants.map((v, idx) => (
                <VariantItem
                  key={idx}
                  initials={(v.name || "VR").slice(0, 2).toUpperCase()}
                  name={v.name}
                  price={v.price}
                  stock={v.stock}
                  onPress={() => {}}
                />
              ))}
            </>
          ) : null}

          <ThemedButton
            title="Tambah Varian"
            variant="secondary"
            onPress={() =>
              router.push("/dashboard/recipe-and-materials/variant" as never)
            }
          />
        </View>
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
      backgroundColor: Colors[colorScheme].border2,
      height: 12,
    },
    rowSection: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    rowContent: {
      paddingHorizontal: 20,
      paddingVertical: 6,
    },
    variantsSection: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      gap: 12,
      flexDirection: "column",
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
