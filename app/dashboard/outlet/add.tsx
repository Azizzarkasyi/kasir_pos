import ConfirmPopup from "@/components/atoms/confirm-popup";
import SectionDivider from "@/components/atoms/section-divider";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import assetApi, { prepareFileFromUri } from "@/services/endpoints/assets";
import { branchApi } from "@/services/endpoints/branches";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type LocationOption = { label: string; value: string };

const WILAYAH_API_BASE = "https://wilayah.id/api";

export default function AddOutletScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedProvince, setSelectedProvince] =
    useState<LocationOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [selectedSubDistrict, setSelectedSubDistrict] =
    useState<LocationOption | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<LocationOption | null>(
    null
  );
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [subDistrictQuery, setSubDistrictQuery] = useState("");
  const [villageQuery, setVillageQuery] = useState("");
  const [address, setAddress] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([
    { label: "Pilih Provinsi", value: "" },
  ]);
  const [regencyOptions, setRegencyOptions] = useState<LocationOption[]>([
    { label: "Pilih Kabupaten / Kota", value: "" },
  ]);
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([
    { label: "Pilih Kecamatan", value: "" },
  ]);
  const [villageOptions, setVillageOptions] = useState<LocationOption[]>([
    { label: "Pilih Kelurahan", value: "" },
  ]);

  // Fetch provinces on mount
  React.useEffect(() => {
    const fetchProvinces = async () => {
      try {
        console.log(
          "🔄 Fetching provinces from:",
          `${WILAYAH_API_BASE}/provinces.json`
        );
        const res = await axios.get(`${WILAYAH_API_BASE}/provinces.json`, {
          timeout: 10000,
          headers: {
            Accept: "application/json",
          },
        });

        const data = Array.isArray(res.data.data) ? res.data.data : [];

        setProvinceOptions([
          { label: "Pilih Provinsi", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e: any) {
        console.error("❌ Gagal memuat data provinsi:", e.message);
        Alert.alert("Error", `Gagal memuat data provinsi: ${e.message}`);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch regencies when province changes
  React.useEffect(() => {
    if (!selectedProvince) {
      setRegencyOptions([{ label: "Pilih Kabupaten / Kota", value: "" }]);
      setSelectedCity(null);
      setSelectedSubDistrict(null);
      setSelectedVillage(null);
      setCityQuery("");
      setSubDistrictQuery("");
      setVillageQuery("");
      return;
    }

    const fetchRegencies = async () => {
      try {
        console.log(
          "🔄 Fetching regencies for province:",
          selectedProvince.value
        );
        const res = await axios.get(
          `${WILAYAH_API_BASE}/regencies/${selectedProvince.value}.json`,
          {
            timeout: 10000,
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = Array.isArray(res.data.data) ? res.data.data : [];
        console.log("✅ Regencies count:", data.length);

        setRegencyOptions([
          { label: "Pilih Kabupaten / Kota", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e: any) {
        console.error("❌ Gagal memuat data kabupaten/kota:", e.message);
        Alert.alert("Error", `Gagal memuat data kota: ${e.message}`);
      }
    };

    setSelectedCity(null);
    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setCityQuery("");
    setSubDistrictQuery("");
    setVillageQuery("");
    setDistrictOptions([{ label: "Pilih Kecamatan", value: "" }]);
    setVillageOptions([{ label: "Pilih Kelurahan", value: "" }]);

    fetchRegencies();
  }, [selectedProvince?.value]);

  // Fetch districts when city changes
  React.useEffect(() => {
    if (!selectedCity) {
      setDistrictOptions([{ label: "Pilih Kecamatan", value: "" }]);
      setSelectedSubDistrict(null);
      setSelectedVillage(null);
      setSubDistrictQuery("");
      setVillageQuery("");
      return;
    }

    const fetchDistricts = async () => {
      try {
        console.log("🔄 Fetching districts for city:", selectedCity.value);
        const res = await axios.get(
          `${WILAYAH_API_BASE}/districts/${selectedCity.value}.json`,
          {
            timeout: 10000,
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = Array.isArray(res.data.data) ? res.data.data : [];
        console.log("✅ Districts count:", data.length);

        setDistrictOptions([
          { label: "Pilih Kecamatan", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e: any) {
        console.error("❌ Gagal memuat data kecamatan:", e.message);
        Alert.alert("Error", `Gagal memuat data kecamatan: ${e.message}`);
      }
    };

    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setVillageOptions([{ label: "Pilih Kelurahan", value: "" }]);
    setSubDistrictQuery("");
    setVillageQuery("");

    fetchDistricts();
  }, [selectedCity?.value]);

  // Fetch villages when subdistrict changes
  React.useEffect(() => {
    if (!selectedSubDistrict) {
      setVillageOptions([{ label: "Pilih Kelurahan", value: "" }]);
      setSelectedVillage(null);
      setVillageQuery("");
      return;
    }

    const fetchVillages = async () => {
      try {
        console.log(
          "🔄 Fetching villages for subdistrict:",
          selectedSubDistrict.value
        );
        const res = await axios.get(
          `${WILAYAH_API_BASE}/villages/${selectedSubDistrict.value}.json`,
          {
            timeout: 10000,
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = Array.isArray(res.data.data) ? res.data.data : [];
        console.log("✅ Villages count:", data.length);

        setVillageOptions([
          { label: "Pilih Kelurahan", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e: any) {
        console.error("❌ Gagal memuat data kelurahan:", e.message);
        Alert.alert("Error", `Gagal memuat data kelurahan: ${e.message}`);
      }
    };

    setSelectedVillage(null);
    setVillageQuery("");

    fetchVillages();
  }, [selectedSubDistrict?.value]);

  const handleSave = async (): Promise<void> => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Nama outlet harus diisi");
      return;
    }
    if (
      !selectedProvince ||
      !selectedCity ||
      !selectedSubDistrict ||
      !selectedVillage
    ) {
      Alert.alert(
        "Error",
        "Alamat lengkap (Provinsi, Kota, Kecamatan, Kelurahan) harus diisi"
      );
      return;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Detail alamat harus diisi");
      return;
    }
    try {
      setIsSubmitting(true);

      // Upload image first if selected
      let uploadedImageUrl: string | undefined;
      if (imageUri && !imageUri.startsWith("http")) {
        console.log("📤 Uploading image...");
        try {
          const file = prepareFileFromUri(imageUri);
          const uploadResponse = await assetApi.uploadImage(file);
          if (uploadResponse.data?.url) {
            uploadedImageUrl = uploadResponse.data.url;
            console.log("✅ Image uploaded:", uploadedImageUrl);
          }
        } catch (uploadError: any) {
          console.error("❌ Image upload failed:", uploadError);
          Alert.alert(
            "Peringatan",
            "Gagal upload gambar. Lanjutkan tanpa gambar?",
            [
              {
                text: "Batal",
                style: "cancel",
                onPress: () => setIsSubmitting(false),
              },
              { text: "Lanjutkan", onPress: () => { } },
            ]
          );
          return;
        }
      }

      const payload: any = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        province: {
          id: selectedProvince?.value || "1",
          name: selectedProvince?.label || "",
        },
        city: {
          id: selectedCity?.value || "1",
          name: selectedCity?.label || "",
        },
        subdistrict: {
          id: selectedSubDistrict?.value || "1",
          name: selectedSubDistrict?.label || "",
        },
        village: {
          id: selectedVillage?.value || "1",
          name: selectedVillage?.label || "",
        },
        address: address.trim(),
        status: "active",
      };

      // Add image URL to payload if uploaded
      if (uploadedImageUrl) {
        console.log("🖼️ Adding image URL to payload:", uploadedImageUrl);
        payload.image_url = uploadedImageUrl;
      }

      console.log("📦 Creating branch:", payload);

      const response = await branchApi.createBranch(payload);

      if (response.data) {
        console.log("✅ Branch created:", response.data);
        setShowSuccessPopup(true);
      }
    } catch (error: any) {
      console.error("❌ Failed to create branch:", error);
      Alert.alert("Error", error.message || "Gagal menambahkan outlet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header
        title="Tambah Outlet"
        showHelp={false}
        withNotificationButton={false}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <ImageUpload
            uri={imageUri || undefined}
            initials={(name || "OT").slice(0, 2).toUpperCase()}
            onImageSelected={uri => {
              console.log("📸 Image selected:", uri);
              setImageUri(uri);
            }}
            disabled={isSubmitting}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.contentWrapper}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Informasi Outlet
            </ThemedText>
            <ThemedInput
              label="Nama Outlet"
              size="md"
              value={name}
              onChangeText={setName}
            />
            <ThemedInput
              label="Nomor Telepon"
              size="md"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <SectionDivider />

        <View style={styles.sectionContainer}>
          <View style={styles.contentWrapper}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Alamat Outlet
            </ThemedText>
            <ComboInput
              label="Provinsi"
              value={provinceQuery}
              onChangeText={text => {
                setProvinceQuery(text);
                const found = provinceOptions.find(p => p.label === text);
                if (found) {
                  setSelectedProvince(found);
                }
              }}
              items={provinceOptions}
              size="md"
            />
            <ComboInput
              label="Kota/Kabupaten"
              value={cityQuery}
              onChangeText={text => {
                setCityQuery(text);
                const found = regencyOptions.find(c => c.label === text);
                if (found) {
                  setSelectedCity(found);
                }
              }}
              items={regencyOptions}
              size="md"
            />
            <ComboInput
              label="Kecamatan"
              value={subDistrictQuery}
              onChangeText={text => {
                setSubDistrictQuery(text);
                const found = districtOptions.find(d => d.label === text);
                if (found) {
                  setSelectedSubDistrict(found);
                }
              }}
              items={districtOptions}
              size="md"
            />
            <ComboInput
              label="Kelurahan"
              value={villageQuery}
              onChangeText={text => {
                setVillageQuery(text);
                const found = villageOptions.find(v => v.label === text);
                if (found) {
                  setSelectedVillage(found);
                }
              }}
              items={villageOptions}
              size="md"
            />
            <ThemedInput
              label="Alamat"
              value={address}
              onChangeText={setAddress}
              multiline
              inputContainerStyle={{
                height: 120,
                alignItems: "flex-start",
                paddingVertical: 12,
              }}
            />
          </View>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.contentWrapper}>
            <ThemedButton
              title={isSubmitting ? "Menyimpan..." : "Simpan"}
              variant="primary"
              onPress={handleSave}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <ConfirmPopup
        visible={showSuccessPopup}
        successOnly
        title="Berhasil"
        message="Outlet berhasil ditambahkan"
        onConfirm={() => {
          setShowSuccessPopup(false);
          router.back();
          router.setParams({ refresh: Date.now().toString() });
        }}
        onCancel={() => {
          setShowSuccessPopup(false);
          router.back();
          router.setParams({ refresh: Date.now().toString() });
        }}
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
    scrollContent: {
      paddingTop: isTablet ? 28 : 18,
      paddingBottom: isTablet ? 40 : 24,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionContainer: {
      paddingHorizontal: isTablet ? 60 : 20,
      paddingVertical: isTablet ? 32 : 24,
    },
    sectionTitle: {
      marginBottom: isTablet ? 16 : 8,
      fontSize: isTablet ? 20 : 16,
    },
    bottomBar: {
      paddingHorizontal: isTablet ? 60 : 20,
      paddingTop: isTablet ? 16 : 8,
      paddingBottom: isTablet ? 24 : 16,
      backgroundColor: Colors[colorScheme].background,
    },
  });
