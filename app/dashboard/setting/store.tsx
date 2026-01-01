import ConfirmPopup from "@/components/atoms/confirm-popup";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { businessTypes } from "@/constants/business-types";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { settingsApi, StoreInfo } from "@/services";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type LocationOption = { label: string; value: string };

const WILAYAH_API_BASE = "https://wilayah.id/api";

export default function StoreSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [businessType, setBusinessType] = useState("");
  const [storeName, setStoreName] = useState("");
  const [defaultTax, setDefaultTax] = useState("0");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("id");
  const [currency, setCurrency] = useState("IDR");
  const [address, setAddress] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [country, setCountry] = useState("Indonesia");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Province state
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([
    { label: "Pilih Provinsi", value: "" },
  ]);
  const [selectedProvince, setSelectedProvince] =
    useState<LocationOption | null>(null);
  const [provinceQuery, setProvinceQuery] = useState("");
  const pendingProvinceId = useRef<string | null>(null);

  // City/Regency state
  const [cityOptions, setCityOptions] = useState<LocationOption[]>([
    { label: "Pilih Kabupaten/Kota", value: "" },
  ]);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const pendingCityId = useRef<string | null>(null);

  // Subdistrict/Kecamatan state
  const [subdistrictOptions, setSubdistrictOptions] = useState<LocationOption[]>([
    { label: "Pilih Kecamatan", value: "" },
  ]);
  const [selectedSubdistrict, setSelectedSubdistrict] =
    useState<LocationOption | null>(null);
  const [subdistrictQuery, setSubdistrictQuery] = useState("");
  const pendingSubdistrictId = useRef<string | null>(null);

  // Village/Kelurahan state
  const [villageOptions, setVillageOptions] = useState<LocationOption[]>([
    { label: "Pilih Kelurahan", value: "" },
  ]);
  const [selectedVillage, setSelectedVillage] =
    useState<LocationOption | null>(null);
  const [villageQuery, setVillageQuery] = useState("");
  const pendingVillageId = useRef<string | null>(null);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(`${WILAYAH_API_BASE}/provinces.json`, {
          timeout: 10000,
          headers: {
            Accept: "application/json",
          },
        });
        const data = Array.isArray(res.data.data) ? res.data.data : [];

        const options = [
          { label: "Pilih Provinsi", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ];
        setProvinceOptions(options);

        // Auto-select province if we have a pending province ID
        if (pendingProvinceId.current) {
          const found = options.find(
            (p: LocationOption) => p.value === pendingProvinceId.current
          );
          if (found && found.value) {
            setSelectedProvince(found);
            setProvinceQuery(found.label);
          }
          pendingProvinceId.current = null;
        }
      } catch (e: any) {
        console.error("❌ Gagal memuat data provinsi:", e.message);
        Alert.alert("Error", `Gagal memuat data provinsi: ${e.message}`);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (!selectedProvince || !selectedProvince.value) {
      setCityOptions([{ label: "Pilih Kabupaten/Kota", value: "" }]);
      setSelectedCity(null);
      setCityQuery("");
      return;
    }

    const fetchCities = async () => {
      try {
        const res = await axios.get(
          `${WILAYAH_API_BASE}/regencies/${selectedProvince.value}.json`,
          { timeout: 10000, headers: { Accept: "application/json" } }
        );
        const data = Array.isArray(res.data.data) ? res.data.data : [];

        const options = [
          { label: "Pilih Kabupaten/Kota", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ];
        setCityOptions(options);

        // Auto-select city if pending
        if (pendingCityId.current) {
          const found = options.find(
            (p: LocationOption) => p.value === pendingCityId.current
          );
          if (found && found.value) {
            setSelectedCity(found);
            setCityQuery(found.label);
          }
          pendingCityId.current = null;
        }
      } catch (e: any) {
        console.error("❌ Gagal memuat kota:", e.message);
      }
    };
    fetchCities();
  }, [selectedProvince?.value]);

  // Fetch subdistricts when city changes
  useEffect(() => {
    if (!selectedCity || !selectedCity.value) {
      setSubdistrictOptions([{ label: "Pilih Kecamatan", value: "" }]);
      setSelectedSubdistrict(null);
      setSubdistrictQuery("");
      return;
    }

    const fetchSubdistricts = async () => {
      try {
        const res = await axios.get(
          `${WILAYAH_API_BASE}/districts/${selectedCity.value}.json`,
          { timeout: 10000, headers: { Accept: "application/json" } }
        );
        const data = Array.isArray(res.data.data) ? res.data.data : [];

        const options = [
          { label: "Pilih Kecamatan", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ];
        setSubdistrictOptions(options);

        // Auto-select subdistrict if pending
        if (pendingSubdistrictId.current) {
          const found = options.find(
            (p: LocationOption) => p.value === pendingSubdistrictId.current
          );
          if (found && found.value) {
            setSelectedSubdistrict(found);
            setSubdistrictQuery(found.label);
          }
          pendingSubdistrictId.current = null;
        }
      } catch (e: any) {
        console.error("❌ Gagal memuat kecamatan:", e.message);
      }
    };
    fetchSubdistricts();
  }, [selectedCity?.value]);

  // Fetch villages when subdistrict changes
  useEffect(() => {
    if (!selectedSubdistrict || !selectedSubdistrict.value) {
      setVillageOptions([{ label: "Pilih Kelurahan", value: "" }]);
      setSelectedVillage(null);
      setVillageQuery("");
      return;
    }

    const fetchVillages = async () => {
      try {
        const res = await axios.get(
          `${WILAYAH_API_BASE}/villages/${selectedSubdistrict.value}.json`,
          { timeout: 10000, headers: { Accept: "application/json" } }
        );
        const data = Array.isArray(res.data.data) ? res.data.data : [];

        const options = [
          { label: "Pilih Kelurahan", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
            label: item.name,
            value: item.code,
          })),
        ];
        setVillageOptions(options);

        // Auto-select village if pending
        if (pendingVillageId.current) {
          const found = options.find(
            (p: LocationOption) => p.value === pendingVillageId.current
          );
          if (found && found.value) {
            setSelectedVillage(found);
            setVillageQuery(found.label);
          }
          pendingVillageId.current = null;
        }
      } catch (e: any) {
        console.error("❌ Gagal memuat kelurahan:", e.message);
      }
    };
    fetchVillages();
  }, [selectedSubdistrict?.value]);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await settingsApi.getStoreInfo();

      if (!response.data) {
        return;
      }

      const storeData = response.data;
      setStore(storeData);
      setBusinessType(storeData.bussiness_type || "");
      setStoreName(storeData.branches?.[0].name || "");
      setDefaultTax(storeData.tax?.toString() || "0");
      setOwnerName(storeData.owner_name || "");
      setPhone(storeData.owner_phone || "");
      setLanguage(storeData.language || "id");
      setCurrency(storeData.curency || "IDR");
      setAddress(storeData.address || "");
      setCountry(storeData.country || "Indonesia");
      setPhotoUri(storeData.photo);

      // Determine location data source - use branch data if store-level is empty
      const locationSource = storeData.province?.id ? storeData : storeData.branches?.[0];

      if (locationSource) {
        // Handle province auto-select
        if (locationSource?.province) {
          const provinceId = String(locationSource.province.id || "");
          const provinceName = locationSource.province.name || "";
          pendingProvinceId.current = provinceId;
          setProvinceQuery(provinceName);
          setSelectedProvince({ label: provinceName, value: provinceId });
        }

        // Handle city auto-select
        if (locationSource?.city) {
          const cityId = String(locationSource.city.id || "");
          const cityName = locationSource.city.name || "";
          pendingCityId.current = cityId;
          setCityQuery(cityName);
          setSelectedCity({ label: cityName, value: cityId });
        }

        // Handle subdistrict auto-select
        if (locationSource?.subdistrict) {
          const subdistrictId = String(locationSource.subdistrict.id || "");
          const subdistrictName = locationSource.subdistrict.name || "";
          pendingSubdistrictId.current = subdistrictId;
          setSubdistrictQuery(subdistrictName);
          setSelectedSubdistrict({ label: subdistrictName, value: subdistrictId });
        }

        // Handle village auto-select
        if (locationSource?.village) {
          const villageId = String(locationSource.village.id || "");
          const villageName = locationSource.village.name || "";
          pendingVillageId.current = villageId;
          setVillageQuery(villageName);
          setSelectedVillage({ label: villageName, value: villageId });
        }
      }
    } catch (error: any) {
      console.error("❌ Failed to load store:", error);
      Alert.alert("Error", "Gagal memuat data toko");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStore = async () => {
    if (!storeName.trim()) {
      Alert.alert("Validasi", "Nama toko tidak boleh kosong");
      return;
    }

    if (!ownerName.trim()) {
      Alert.alert("Validasi", "Nama pemilik tidak boleh kosong");
      return;
    }

    setIsSaving(true);

    try {
      const updateData: any = {
        owner_name: ownerName.trim(),
        business_name: storeName,
        bussiness_type: businessType,
        tax: parseFloat(defaultTax) || 0,
        language: language,
        country: country,
        address: address.trim(),
      };

      // Include province with ID and name
      if (selectedProvince && selectedProvince.value) {
        updateData.province = {
          id: selectedProvince.value,
          name: selectedProvince.label,
        };
      }

      // Include city with ID and name
      if (selectedCity && selectedCity.value) {
        updateData.city = {
          id: selectedCity.value,
          name: selectedCity.label,
        };
      }

      // Include subdistrict with ID and name
      if (selectedSubdistrict && selectedSubdistrict.value) {
        updateData.subdistrict = {
          id: selectedSubdistrict.value,
          name: selectedSubdistrict.label,
        };
      }

      // Include village with ID and name
      if (selectedVillage && selectedVillage.value) {
        updateData.village = {
          id: selectedVillage.value,
          name: selectedVillage.label,
        };
      }

      const response = await settingsApi.updateStore(updateData);
      setShowSuccessPopup(true);
      setConfirmOpen(false);
      loadStoreData();
    } catch (error: any) {
      console.error("❌ Failed to update store:", error);
      Alert.alert("Gagal", error.message || "Gagal memperbarui data toko");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <Header title="Toko" showHelp={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={{ marginBottom: 12 }}>
              Data Toko atau Bisnis
            </ThemedText>
            <ComboInput
              label="Jenis Bisnis"
              disableAutoComplete={true}
              value={businessType}
              onChangeText={setBusinessType}
              items={businessTypes}
            />
          </View>
          <ThemedInput
            label="Nama Bisnis Toko"
            value={storeName}
            onChangeText={setStoreName}
          />
          <ThemedInput
            label="Pajak Default"
            value={defaultTax}
            onChangeText={setDefaultTax}
            keyboardType="decimal-pad"
            rightIcon={<ThemedText type="default">%</ThemedText>}
          />
          <ThemedInput
            label="Nama Pemilik"
            value={ownerName}
            onChangeText={setOwnerName}
          />
          <ThemedInput label="Nomor Telepon" value={phone} editable={false} />
          {/* <ThemedText style={{color: "red"}}>
            * Have not verified yet
          </ThemedText> */}
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2" style={{ marginBottom: 10 }}>Lokasi Toko</ThemedText>
          <ComboInput
            label="Provinsi"
            value={provinceQuery}
            onChangeText={text => {
              setProvinceQuery(text);
              const found = provinceOptions.find(p => p.label === text);
              if (found && found.value) {
                setSelectedProvince(found);
                // Reset child locations
                setSelectedCity(null);
                setCityQuery("");
                setSelectedSubdistrict(null);
                setSubdistrictQuery("");
                setSelectedVillage(null);
                setVillageQuery("");
              }
            }}
            items={provinceOptions}
          />
          <ComboInput
            label="Kabupaten/Kota"
            value={cityQuery}
            onChangeText={text => {
              setCityQuery(text);
              const found = cityOptions.find(c => c.label === text);
              if (found && found.value) {
                setSelectedCity(found);
                // Reset child locations
                setSelectedSubdistrict(null);
                setSubdistrictQuery("");
                setSelectedVillage(null);
                setVillageQuery("");
              }
            }}
            items={cityOptions}
          />
          <ComboInput
            label="Kecamatan"
            value={subdistrictQuery}
            onChangeText={text => {
              setSubdistrictQuery(text);
              const found = subdistrictOptions.find(s => s.label === text);
              if (found && found.value) {
                setSelectedSubdistrict(found);
                // Reset child location
                setSelectedVillage(null);
                setVillageQuery("");
              }
            }}
            items={subdistrictOptions}
          />
          <ComboInput
            label="Kelurahan"
            value={villageQuery}
            onChangeText={text => {
              setVillageQuery(text);
              const found = villageOptions.find(v => v.label === text);
              if (found && found.value) {
                setSelectedVillage(found);
              }
            }}
            items={villageOptions}
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

        <View style={styles.bottomButtonWrapper}>
          <ThemedButton
            title={isSaving ? "SAVING..." : "SAVE"}
            onPress={handleSaveStore}
            disabled={isSaving}
          />
        </View>

        <ConfirmPopup
          visible={confirmOpen}
          title="Konfirmasi"
          message="Apakah Anda yakin ingin menyimpan perubahan?"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleSaveStore}
        />

        <ConfirmPopup
          visible={showSuccessPopup}
          successOnly
          title="Berhasil"
          message="Data toko berhasil diperbarui"
          onConfirm={() => setShowSuccessPopup(false)}
          onCancel={() => setShowSuccessPopup(false)}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: isTablet ? 60 : 20,
      paddingBottom: isTablet ? 100 : 80,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionCard: {
      marginTop: isTablet ? 20 : 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 16 : 8,
      paddingVertical: isTablet ? 16 : 8,
    },
    bottomButtonWrapper: {
      marginTop: isTablet ? 20 : 10,
    },
  });
