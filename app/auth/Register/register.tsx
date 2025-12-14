import Checkbox from "@/components/checkbox";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi } from "@/services";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LocationOption = {label: string; value: string};

const businessTypes = [
  {label: "Pilih Tipe Bisnis", value: ""},
  {label: "Restoran", value: "restoran"},
  {label: "Toko Kelontong", value: "toko-kelontong"},
  {label: "Lainnya", value: "lainnya"},
];

const WILAYAH_API_BASE = "https://wilayah.id/api";

const RegisterScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State for form fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<LocationOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<LocationOption | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<LocationOption | null>(null);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [subDistrictQuery, setSubDistrictQuery] = useState("");
  const [villageQuery, setVillageQuery] = useState("");
  const [outletAddress, setOutletAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(`${WILAYAH_API_BASE}/provinces.json`);
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        setProvinceOptions([
          {label: "Pilih Provinsi", value: ""},
          ...data.map((item: {code: string; name: string}) => ({
            label: item.name,
            value: item.code,
          })),
        ]);
      } catch (e) {
        console.error("Gagal memuat data provinsi", e);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setRegencyOptions([{label: "Pilih Kabupaten / Kota", value: ""}]);
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
        const res = await fetch(
          `${WILAYAH_API_BASE}/regencies/${selectedProvince.value}.json`,
        );
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
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

    setSelectedCity(null);
    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setCityQuery("");
    setSubDistrictQuery("");
    setVillageQuery("");
    setDistrictOptions([{label: "Pilih Kecamatan", value: ""}]);
    setVillageOptions([{label: "Pilih Kelurahan", value: ""}]);

    fetchRegencies();
  }, [selectedProvince?.value]);

  useEffect(() => {
    if (!selectedCity) {
      setDistrictOptions([{label: "Pilih Kecamatan", value: ""}]);
      setSelectedSubDistrict(null);
      setSelectedVillage(null);
      setSubDistrictQuery("");
      setVillageQuery("");
      return;
    }

    const fetchDistricts = async () => {
      try {
        const res = await fetch(
          `${WILAYAH_API_BASE}/districts/${selectedCity.value}.json`,
        );
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
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

    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setVillageOptions([{label: "Pilih Kelurahan", value: ""}]);
    setSubDistrictQuery("");
    setVillageQuery("");

    fetchDistricts();
  }, [selectedCity?.value]);

  useEffect(() => {
    if (!selectedSubDistrict) {
      setVillageOptions([{label: "Pilih Kelurahan", value: ""}]);
      setSelectedVillage(null);
      setVillageQuery("");
      return;
    }

    const fetchVillages = async () => {
      try {
        const res = await fetch(
          `${WILAYAH_API_BASE}/villages/${selectedSubDistrict.value}.json`,
        );
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
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

    setSelectedVillage(null);

    fetchVillages();
  }, [selectedSubDistrict?.value]);

  const handleRegister = async () => {
    // Reset errors
    setErrors({});

    // Validasi form
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) newErrors.businessName = "Nama usaha wajib diisi";
    if (!businessType) newErrors.businessType = "Tipe bisnis wajib dipilih";
    if (!selectedVillage) newErrors.outletKelurahan = "Kelurahan wajib dipilih";
    if (!outletAddress.trim())
      newErrors.outletAddress = "Alamat outlet wajib diisi";
    if (!ownerName.trim()) newErrors.ownerName = "Nama pemilik wajib diisi";
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "No. Handphone wajib diisi";
    } else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = "No. Handphone minimal 10 digit";
    }
    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!pin || pin.length < 6) newErrors.pin = "PIN minimal 6 angka";
    if (!agreedToTerms) {
      Alert.alert(
        "Perhatian",
        "Anda harus menyetujui Syarat dan Ketentuan untuk mendaftar"
      );
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        country: "Indonesia",
        bussiness_name: businessName,
        business_type: businessType,
        bussiness_province: selectedProvince
          ? {id: selectedProvince.value, name: selectedProvince.label}
          : {id: "", name: ""},
        bussiness_city: selectedCity
          ? {id: selectedCity.value, name: selectedCity.label}
          : {id: "", name: ""},
        bussiness_subdistrict: selectedSubDistrict
          ? {id: selectedSubDistrict.value, name: selectedSubDistrict.label}
          : {id: "", name: ""},
        bussiness_village: selectedVillage
          ? {id: selectedVillage.value, name: selectedVillage.label}
          : {id: "", name: ""},
        bussiness_address: outletAddress,
        owner_name: ownerName,
        owner_phone: phoneNumber,
        pin: pin,
        owner_email: email,
        is_accept_tos: agreedToTerms,
      };

      console.log("📤 Registering with:", registerData);

      const response = await authApi.register(registerData);

      console.log("✅ Registration success:", response);

      // Navigate to OTP verification
      router.push({
        pathname: "/auth/Register/verify-otp",
        params: {phone: phoneNumber},
      });
    } catch (error: any) {
      console.error("❌ Registration failed:", error);

      let errorMessage = "Gagal mendaftar. Silakan coba lagi.";

      if (error.code === 409) {
        errorMessage = "Email atau No. Handphone sudah terdaftar";
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (error.errors) {
        setErrors(error.errors);
      }

      Alert.alert("Gagal Mendaftar", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Daftar" />
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {paddingBottom: isTablet ? insets.bottom + 120 : insets.bottom + 80},
        ]}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{
          backgroundColor: Colors[colorScheme].background,
          paddingVertical: isTablet ? 32 : 20,
        }}
      >
        <View style={styles.contentWrapper}>
          <ThemedText style={styles.subtitle}>
            Halo Usahawan, lengkapi data dibawah ini.
          </ThemedText>

        <View style={styles.section}>
          <ThemedInput
            label="Nama Usaha"
            value={businessName}
            onChangeText={text => {
              setBusinessName(text);
              if (errors.businessName) {
                setErrors({...errors, businessName: ""});
              }
            }}
            error={errors.businessName}
          />
          <ComboInput
            label="Pilih Tipe Bisnis"
            value={businessType}
            onChangeText={text => {
              setBusinessType(text);
              if (errors.businessType) {
                setErrors({...errors, businessType: ""});
              }
            }}
            items={businessTypes}
            error={errors.businessType}
          />
          <ComboInput
            label="Provinsi Outlet Utama"
            value={provinceQuery}
            onChange={item => {
              setSelectedProvince(item.value ? item : null);
              setProvinceQuery(item.label);
            }}
            onChangeText={text => {
              setProvinceQuery(text);
              if (!text) setSelectedProvince(null);
            }}
            items={provinceOptions}
          />
          <ComboInput
            label="Kabupaten / Kota Outlet Utama"
            value={cityQuery}
            onChange={item => {
              setSelectedCity(item.value ? item : null);
              setCityQuery(item.label);
            }}
            onChangeText={text => {
              setCityQuery(text);
              if (!text) setSelectedCity(null);
            }}
            items={regencyOptions}
          />
          <ComboInput
            label="Kecamatan Outlet Utama"
            value={subDistrictQuery}
            onChange={item => {
              setSelectedSubDistrict(item.value ? item : null);
              setSubDistrictQuery(item.label);
            }}
            onChangeText={text => {
              setSubDistrictQuery(text);
              if (!text) setSelectedSubDistrict(null);
            }}
            items={districtOptions}
          />
          <ComboInput
            label="Kelurahan Outlet Utama"
            value={villageQuery}
            onChange={item => {
              setSelectedVillage(item.value ? item : null);
              setVillageQuery(item.label);
              if (errors.outletKelurahan) {
                setErrors({...errors, outletKelurahan: ""});
              }
            }}
            onChangeText={text => {
              setVillageQuery(text);
              if (!text) setSelectedVillage(null);
            }}
            items={villageOptions}
            error={errors.outletKelurahan}
          />
          <ThemedInput
            label="Alamat Lengkap Outlet"
            value={outletAddress}
            onChangeText={text => {
              setOutletAddress(text);
              if (errors.outletAddress) {
                setErrors({...errors, outletAddress: ""});
              }
            }}
            error={errors.outletAddress}
            multiline
            numberOfLines={3}
            inputContainerStyle={{
              height: 120,
              alignItems: "flex-start",
            }}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={{marginBottom: 12}}>
            Data Diri Pemilik Usaha
          </ThemedText>
          <ThemedInput
            label="Nama Pemilik"
            value={ownerName}
            onChangeText={text => {
              setOwnerName(text);
              if (errors.ownerName) {
                setErrors({...errors, ownerName: ""});
              }
            }}
            error={errors.ownerName}
          />
          <ThemedInput
            label="No. Handphone"
            value={phoneNumber}
            onChangeText={text => {
              setPhoneNumber(text);
              if (errors.phoneNumber) {
                setErrors({...errors, phoneNumber: ""});
              }
            }}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />
          <ThemedInput
            label="No. PIN 6 Angka"
            value={pin}
            onChangeText={text => {
              setPin(text);
              if (errors.pin) {
                setErrors({...errors, pin: ""});
              }
            }}
            numericOnly
            isPassword
            maxLength={6}
            error={errors.pin}
          />
          <ThemedInput
            label="Email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (errors.email) {
                setErrors({...errors, email: ""});
              }
            }}
            keyboardType="email-address"
            error={errors.email}
          />
          <ThemedInput
            label="Kode Referal (Opsional)"
            value={referralCode}
            onChangeText={setReferralCode}
          />

          <View style={styles.termsContainer}>
            <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={{flex: 1}}
            >
              <ThemedText style={styles.termsText}>
                Dengan ini saya telah menyetujui{" "}
                <ThemedText style={styles.link}>Syarat dan Ketentuan</ThemedText>{" "}
                serta{" "}
                <ThemedText style={styles.link}>Kebijakan Privasi</ThemedText>{" "}
                Qasir
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.bottomBar}>
        <ThemedButton
          title={isLoading ? "Mendaftar..." : "Daftar"}
          onPress={handleRegister}
          disabled={isLoading}
        />
        {/* {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors[colorScheme].primary}
            style={{marginTop: 8}}
          />
        )} */}
      </View>
    </View>
  );
};

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 0,
      paddingBottom: isTabletLandscape ? 80: 20,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: isTabletLandscape ? 80: 20,
      paddingHorizontal: isTablet ? 24 : 16,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
      paddingHorizontal: isTablet ? 56 : 4,
      paddingBottom: isTablet ? 80 : 40,
    },
    title: {
      marginTop: 20,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 20,
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 16,
    },
    section: {
      marginBottom: isTablet ? 24 : 16,
    },
    termsContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 16,
      marginBottom: isTablet ? 80 : 40,
    },
    termsText: {
      marginLeft: 10,
      flex: 1,
      lineHeight: isTablet ? 24 : 20,
      fontSize: isTablet ? 16 : 14,
    },
    link: {
      color: Colors[colorScheme].primary,
      textDecorationLine: "underline",
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

export default RegisterScreen;
