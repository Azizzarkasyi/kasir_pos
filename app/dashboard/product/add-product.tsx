import {useRouter, useLocalSearchParams} from "expo-router";
import ComboInput from "@/components/combo-input";
import CostBarcodeFields from "@/components/cost-barcode-fields";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
import ProductCard from "@/components/product-card";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function AddProductScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [enableCostBarcode, setEnableCostBarcode] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [capitalPrice, setCapitalPrice] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [variants, setVariants] = useState<
    {name: string; price: number; stockText?: string}[]
  >([]);
  const {variant_name, variant_price} = useLocalSearchParams<{
    variant_name?: string;
    variant_price?: string;
  }>();

  React.useEffect(() => {
    if (variant_name && variant_price) {
      const priceNum = Number(String(variant_price).replace(/[^0-9]/g, ""));
      setVariants(prev => [...prev, {name: String(variant_name), price: priceNum}]);
      router.replace("/dashboard/product/add-product" as never);
    }
  }, [variant_name, variant_price, router]);

  const formatIDR = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  const handleSave = () => {
    const payload = {
      name,
      price,
      brand,
      category,
      favorite,
      enableCostBarcode,
      imageUri,
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

        <ThemedInput label="Nama Produk" value={name} onChangeText={setName} />
        <ThemedInput
          label="Harga Jual"
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
        />

        <ComboInput
          label="Pilih Merk"
          value={brand}
          onChangeText={setBrand}
          items={[
            {label: "Pilih Merk", value: ""},
            {label: "Tidak ada merk", value: "none"},
            {label: "Qasir", value: "qasir"},
          ]}
        />
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

        <MenuRow
          title="Produk Favorit"
          subtitle="Tampilkan produk di kategori terdepan."
          variant="toggle"
          value={favorite}
          onValueChange={setFavorite}
          badgeText="Baru"
        />

        <MenuRow
          title="Atur Harga Modal dan Barcode"
          variant="toggle"
          value={enableCostBarcode}
          onValueChange={setEnableCostBarcode}
          showBottomBorder={!enableCostBarcode}
        />

        {enableCostBarcode ? (
          <CostBarcodeFields
            capitalPrice={capitalPrice}
            onCapitalPriceChange={setCapitalPrice}
            barcode={barcode}
            onBarcodeChange={setBarcode}
          />
        ) : null}

        <MenuRow
          title="Kelola Stok"
          rightText="Stok Tidak Aktif"
          variant="link"
          onPress={() => router.push("/dashboard/product/stock" as never)}
        />

        {variants.length > 0 ? (
          <>
            <View style={styles.sectionDivider} />
            <ThemedText type="subtitle-2">Varian</ThemedText>
            {variants.map((v, idx) => (
              <ProductCard
                key={idx}
                initials={(v.name || "VR").slice(0, 2).toUpperCase()}
                name={v.name}
                subtitle={`Rp${formatIDR(v.price)}`}
                rightText={v.stockText || "Stok Tidak Aktif"}
                onPress={() => {}}
              />
            ))}
          </>
        ) : null}

        <View style={styles.sectionDivider} />

        <ThemedButton
          title="Tambah Varian"
          variant="secondary"
          onPress={() => router.push("/dashboard/product/variant" as never)}
        />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
      </View>
      {}
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
