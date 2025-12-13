import SectionDivider from "@/components/atoms/section-divider";
import ComboInput from "@/components/combo-input";
import ConfirmPopup from "@/components/atoms/confirm-popup";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRouter, useLocalSearchParams} from "expo-router";
import React, {useState, useEffect} from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {branchApi, Branch} from "@/services/endpoints/branches";
import assetApi, {prepareFileFromUri} from "@/services/endpoints/assets";
import axios from "axios";

type LocationOption = {label: string; value: string};

const WILAYAH_API_BASE = "https://wilayah.id/api";

export default function EditOutletScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();
  const params = useLocalSearchParams();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([
    {label: "Pilih Provinsi", value: ""},
  ]);
  const [regencyOptions, setRegencyOptions] = useState<LocationOption[]>([
    {label: "Pilih Kabupaten / Kota", value: ""},
  ]);
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([
    {label: "Pilih Kecamatan", value: ""},
  ]);
  const [villageOptions, setVillageOptions] = useState<LocationOption[]>([
    {label: "Pilih Kelurahan", value: ""},
  ]);

  // Fetch provinces on mount
  useEffect(() => {
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
        console.log("📡 Response status:", res.status);
        console.log("📦 Received data:", res.data);

        const data = Array.isArray(res.data.data) ? res.data.data : [];
        console.log("✅ Provinces count:", data.length);

        setProvinceOptions([
          {label: "Pilih Provinsi", value: ""},
          ...data.map((item: {code: string; name: string}) => ({
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
  useEffect(() => {
    if (!selectedProvince || !selectedProvince.value) return;

    const fetchRegencies = async () => {
      try {
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
        setRegencyOptions([
          {label: "Pilih Kabupaten / Kota", value: ""},
          ...data.map((item: {code: string; name: string}) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e) {
        console.error("Gagal memuat data kabupaten/kota", e);
      }
    };

    fetchRegencies();
  }, [selectedProvince?.value]);

  // Fetch districts when city changes
  useEffect(() => {
    if (!selectedCity || !selectedCity.value) return;

    const fetchDistricts = async () => {
      try {
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
        setDistrictOptions([
          {label: "Pilih Kecamatan", value: ""},
          ...data.map((item: {code: string; name: string}) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e) {
        console.error("Gagal memuat data kecamatan", e);
      }
    };

    fetchDistricts();
  }, [selectedCity?.value]);

  // Fetch villages when subdistrict changes
  useEffect(() => {
    if (!selectedSubDistrict || !selectedSubDistrict.value) return;

    const fetchVillages = async () => {
      try {
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
        setVillageOptions([
          {label: "Pilih Kelurahan", value: ""},
          ...data.map((item: {code: string; name: string}) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e) {
        console.error("Gagal memuat data kelurahan", e);
      }
    };

    fetchVillages();
  }, [selectedSubDistrict?.value]);

  // Fetch branch data
  useEffect(() => {
    const fetchBranch = async () => {
      if (!branchId) {
        Alert.alert("Error", "ID outlet tidak valid");
        router.back();
        return;
      }

      try {
        setIsLoading(true);
        const response = await branchApi.getBranch(branchId);

        if (response.data) {
          const data = response.data;
          console.log("📥 Fetched branch data:", data);
          setBranch(data);
          setName(data.name);
          setPhone(data.phone || "");
          setSelectedProvince({
            label: data.province.name,
            value: String(data.province.id),
          });
          setProvinceQuery(data.province.name);
          setSelectedCity({label: data.city.name, value: String(data.city.id)});
          setCityQuery(data.city.name);
          setSelectedSubDistrict({
            label: data.subdistrict.name,
            value: String(data.subdistrict.id),
          });
          setSubDistrictQuery(data.subdistrict.name);
          setSelectedVillage({
            label: data.village.name,
            value: String(data.village.id),
          });
          setVillageQuery(data.village.name);
          setAddress(data.address);
          console.log("✅ Form fields populated");
        }
      } catch (error: any) {
        console.error("❌ Failed to fetch branch:", error);
        Alert.alert("Error", "Gagal memuat data outlet");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranch();
  }, [branchId]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Nama outlet harus diisi");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Detail alamat harus diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image first if selected and it's a local file
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
            "Gagal upload gambar. Lanjutkan tanpa mengubah gambar?",
            [
              {
                text: "Batal",
                style: "cancel",
                onPress: () => setIsSubmitting(false),
              },
              {text: "Lanjutkan", onPress: () => {}},
            ]
          );
          return;
        }
      }

      const payload: any = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim(),
      };

      // TODO: Add image URL when backend schema supports it
      // Backend StoreBranch schema doesn't have image_url field yet
      if (uploadedImageUrl) {
        console.log(
          "🖼️ Image URL saved (not sent to backend):",
          uploadedImageUrl
        );
        // payload.image_url = uploadedImageUrl;
      }

      // Only include location if changed (always include all location data)
      if (selectedProvince) {
        payload.province = {
          id: selectedProvince.value || branch?.province.id || "1",
          name: selectedProvince.label || "",
        };
      }
      if (selectedCity) {
        payload.city = {
          id: selectedCity.value || branch?.city.id || "1",
          name: selectedCity.label || "",
        };
      }
      if (selectedSubDistrict) {
        payload.subdistrict = {
          id: selectedSubDistrict.value || branch?.subdistrict.id || "1",
          name: selectedSubDistrict.label || "",
        };
      }
      if (selectedVillage) {
        payload.village = {
          id: selectedVillage.value || branch?.village.id || "1",
          name: selectedVillage.label || "",
        };
      }

      console.log("📦 Updating branch:", payload);

      const response = await branchApi.updateBranch(branchId, payload);

      if (response.data) {
        console.log("✅ Branch updated:", response.data);
        setShowSuccessPopup(true);
      }
    } catch (error: any) {
      console.error("❌ Failed to update branch:", error);
      Alert.alert("Error", error.message || "Gagal memperbarui outlet");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
        <Header
          title="Ubah Outlet"
          showHelp={false}
          withNotificationButton={false}
        />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <ThemedText style={{marginTop: 16, color: Colors[colorScheme].icon}}>
            Memuat data outlet...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header
        title="Ubah Outlet"
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
        message="Outlet berhasil diperbarui"
        onConfirm={() => {
          setShowSuccessPopup(false);
          router.back();
        }}
        onCancel={() => {
          setShowSuccessPopup(false);
          router.back();
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
