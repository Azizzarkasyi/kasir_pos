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
import {useProductFormStore} from "@/stores/product-form-store";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef} from "react";
import {StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function AddMaterialScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const {
    name,
    price,
    brand,
    imageUri,
    capitalPrice,
    barcode,
    variants,
    setName,
    setPrice,
    setBrand,
    setImageUri,
    setCapitalPrice,
    setBarcode,
    setVariants,
  } = useProductFormStore(state => state);
  const {variant_name, variant_price} = useLocalSearchParams<{
    variant_name?: string;
    variant_price?: string;
  }>();

  React.useEffect(() => {
    if (variant_name && variant_price) {
      const priceNum = Number(String(variant_price).replace(/[^0-9]/g, ""));
      setVariants(prev => [
        ...prev,
        {name: String(variant_name), price: priceNum},
      ]);
      router.replace("/dashboard/recipe-and-materials/add-material" as never);
    }
  }, [variant_name, variant_price, router]);

  // Barcode sekarang dikelola via Zustand store dan diisi langsung dari layar scan,
  // jadi tidak lagi diambil dari query param.

  const isDirty =
    Object.values({
      name,
      price,
      brand,
      imageUri: imageUri || "",
      capitalPrice,
      barcode,
    }).some(value => {
      if (typeof value === "string") {
        return value.trim() !== "";
      }

      if (typeof value === "number") {
        return value > 0;
      }

      return false;
    }) || variants.length > 0;

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
      brand,
      imageUri,
      capitalPrice,
      barcode,
      variants,
    };
    console.log("Tambah produk", payload);
    router.back();
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header
        showHelp={false}
        title="Tambah Bahan"
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
