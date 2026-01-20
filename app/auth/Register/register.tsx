import Checkbox from "@/components/checkbox";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi } from "@/services";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Animated, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LocationOption = { label: string; value: string };

import { businessTypes } from "@/constants/business-types";

const WILAYAH_API_BASE = "https://wilayah.id/api";

const RegisterScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [progressAnim] = useState(new Animated.Value(1 / 3));

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

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep / totalSteps,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(`${WILAYAH_API_BASE}/provinces.json`);
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        setProvinceOptions([
          { label: "Pilih Provinsi", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
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
        const res = await fetch(
          `${WILAYAH_API_BASE}/regencies/${selectedProvince.value}.json`,
        );
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        setRegencyOptions([
          { label: "Pilih Kabupaten / Kota", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
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
    setDistrictOptions([{ label: "Pilih Kecamatan", value: "" }]);
    setVillageOptions([{ label: "Pilih Kelurahan", value: "" }]);

    fetchRegencies();
  }, [selectedProvince?.value]);

  useEffect(() => {
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
        const res = await fetch(
          `${WILAYAH_API_BASE}/districts/${selectedCity.value}.json`,
        );
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        setDistrictOptions([
          { label: "Pilih Kecamatan", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
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
    setVillageOptions([{ label: "Pilih Kelurahan", value: "" }]);
    setSubDistrictQuery("");
    setVillageQuery("");

    fetchDistricts();
  }, [selectedCity?.value]);

  useEffect(() => {
    if (!selectedSubDistrict) {
      setVillageOptions([{ label: "Pilih Kelurahan", value: "" }]);
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
          { label: "Pilih Kelurahan", value: "" },
          ...data.map((item: { code: string; name: string }) => ({
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

  // Step 1 validation - Data Toko
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) newErrors.businessName = "Nama usaha wajib diisi";
    if (!businessType) newErrors.businessType = "Tipe bisnis wajib dipilih";
    if (!selectedVillage) newErrors.outletKelurahan = "Kelurahan wajib dipilih";
    if (!outletAddress.trim())
      newErrors.outletAddress = "Alamat outlet wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // Step 2 validation - Data Pemilik
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // Step 3 validation - Akun & Keamanan
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!pin || pin.length < 6) newErrors.pin = "PIN minimal 6 angka";
    if (!agreedToTerms) {
      Alert.alert(
        "Perhatian",
        "Anda harus menyetujui Syarat dan Ketentuan untuk mendaftar"
      );
      return false;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setErrors({});

    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    setErrors({});

    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      const registerData = {
        country: "Indonesia",
        bussiness_name: businessName,
        business_type: businessType,
        bussiness_province: selectedProvince
          ? { id: selectedProvince.value, name: selectedProvince.label }
          : { id: "", name: "" },
        bussiness_city: selectedCity
          ? { id: selectedCity.value, name: selectedCity.label }
          : { id: "", name: "" },
        bussiness_subdistrict: selectedSubDistrict
          ? { id: selectedSubDistrict.value, name: selectedSubDistrict.label }
          : { id: "", name: "" },
        bussiness_village: selectedVillage
          ? { id: selectedVillage.value, name: selectedVillage.label }
          : { id: "", name: "" },
        bussiness_address: outletAddress,
        owner_name: ownerName,
        owner_phone: phoneNumber,
        pin: pin,
        owner_email: email,
        is_accept_tos: agreedToTerms,
      };


      const response = await authApi.register(registerData) as any;


      router.push({
        pathname: "/auth/Register/verify-otp",
        params: { phone: response.data?.user?.phone },
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

  const stepInfo = [
    {
      number: 1,
      title: "Data Toko",
      icon: "storefront-outline" as const,
    },
    {
      number: 2,
      title: "Identitas",
      icon: "person-outline" as const,
    },
    {
      number: 3,
      title: "Keamanan",
      icon: "shield-checkmark-outline" as const,
    },
  ];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {stepInfo.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <React.Fragment key={step.number}>
            {/* Step Item */}
            <TouchableOpacity
              style={styles.stepWrapper}
              activeOpacity={0.7}
              onPress={() => {
                if (isCompleted) {
                  setErrors({});
                  setCurrentStep(step.number);
                }
              }}
            >
              <View style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isCompleted && styles.stepCircleCompleted
              ]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                ) : (
                  <ThemedText style={[
                    styles.stepNumber,
                    isActive && styles.stepNumberActive
                  ]}>{step.number}</ThemedText>
                )}
              </View>
              <ThemedText style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive
              ]}>{step.title}</ThemedText>
            </TouchableOpacity>

            {/* Line connector */}
            {index < stepInfo.length - 1 && (
              <View style={[
                styles.stepLine,
                isCompleted && styles.stepLineActive
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // Step 1: Data Toko
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.sectionTitleContainer}>
        <ThemedText style={styles.sectionTitle}>Detail Usaha</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>Lengkapi data usaha Anda untuk mulai berjualan</ThemedText>
      </View>

      <ThemedInput
        label="Nama Usaha"

        value={businessName}
        onChangeText={text => {
          setBusinessName(text);
          if (errors.businessName) setErrors({ ...errors, businessName: "" });
        }}
        error={errors.businessName}
      />

      <ComboInput
        label="Tipe Bisnis"
        value={businessType}
        onChangeText={text => {
          setBusinessType(text);
          if (errors.businessType) setErrors({ ...errors, businessType: "" });
        }}
        items={businessTypes}
        error={errors.businessType}
      />

      <View style={styles.divider} />
      <ThemedText style={styles.groupLabel}>Alamat Outlet</ThemedText>

      <ComboInput
        label="Provinsi"
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
        label="Kabupaten / Kota"
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

      <View style={styles.rowInputs}>
        <View style={{ flex: 1, paddingRight: 6 }}>
          <ComboInput
            label="Kecamatan"
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
        </View>
        <View style={{ flex: 1, paddingLeft: 6 }}>
          <ComboInput
            label="Kelurahan"
            value={villageQuery}
            onChange={item => {
              setSelectedVillage(item.value ? item : null);
              setVillageQuery(item.label);
              if (errors.outletKelurahan) setErrors({ ...errors, outletKelurahan: "" });
            }}
            onChangeText={text => {
              setVillageQuery(text);
              if (!text) setSelectedVillage(null);
            }}
            items={villageOptions}
            error={errors.outletKelurahan}
          />
        </View>
      </View>

      <ThemedInput
        label="Alamat Lengkap"
        value={outletAddress}
        onChangeText={text => {
          setOutletAddress(text);
          if (errors.outletAddress) setErrors({ ...errors, outletAddress: "" });
        }}
        error={errors.outletAddress}
        multiline
        numberOfLines={3}
        inputContainerStyle={{
          height: 100,
          alignItems: "flex-start",
        }}
      />
    </View>
  );

  // Step 2: Data Pemilik
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.sectionTitleContainer}>
        <ThemedText style={styles.sectionTitle}>Data Pemilik</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>Informasi kontak pemilik usaha untuk verifikasi</ThemedText>
      </View>

      <ThemedInput
        label="Nama Lengkap"

        value={ownerName}
        onChangeText={text => {
          setOwnerName(text);
          if (errors.ownerName) setErrors({ ...errors, ownerName: "" });
        }}
        error={errors.ownerName}
      />

      <ThemedInput
        label="No. Handphone"

        value={phoneNumber}
        onChangeText={text => {
          setPhoneNumber(text);
          if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
        }}
        keyboardType="phone-pad"
        numericOnly
        error={errors.phoneNumber}
      />

      <ThemedInput
        label="Email"

        value={email}
        onChangeText={text => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: "" });
        }}
        keyboardType="email-address"
        error={errors.email}
      />

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={Colors[colorScheme].primary} />
        <ThemedText style={styles.infoBoxText}>
          Pastikan nomor aktif untuk menerima kode OTP.
        </ThemedText>
      </View>
    </View>
  );

  // Step 3: Akun & Keamanan
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.sectionTitleContainer}>
        <ThemedText style={styles.sectionTitle}>Keamanan Akun</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>Buat PIN untuk mengamankan transaksi Anda</ThemedText>
      </View>

      <ThemedInput
        label="PIN 6 Angka"
        value={pin}
        onChangeText={text => {
          setPin(text);
          if (errors.pin) setErrors({ ...errors, pin: "" });
        }}
        numericOnly
        isPassword
        maxLength={6}
        error={errors.pin}
      />

      <View style={[styles.infoBox, { marginTop: 4, marginBottom: 24 }]}>
        <Ionicons name="lock-closed" size={20} color={Colors[colorScheme].primary} />
        <ThemedText style={styles.infoBoxText}>
          Jaga kerahasiaan PIN Anda.
        </ThemedText>
      </View>

      <ThemedInput
        label="Kode Referral (Opsional)"
        value={referralCode}
        onChangeText={setReferralCode}
      />

      <View style={styles.termsContainer}>
        <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          style={{ flex: 1 }}
        >
          <ThemedText style={styles.termsText}>
            Saya menyetujui <ThemedText style={styles.link}>Syarat & Ketentuan</ThemedText> serta <ThemedText style={styles.link}>Kebijakan Privasi</ThemedText>.
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Fixed */}
      <View style={styles.headerFixed}>
        <Header
          title="Daftar Akun Baru"
          onHelpPress={() => router.push('/dashboard/help')}
        />
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            })
          }]} />
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: isTablet && !isTabletLandscape ? 120 : isTablet ? 300 : 250 },
        ]}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={120}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{
          backgroundColor: Colors[colorScheme].background,
        }}
      >
        <View style={styles.contentWrapper}>
          {renderStepIndicator()}
          <View style={styles.cardContainer}>
            {renderCurrentStep()}
          </View>
          {/* Spacer to prevent content from being hidden by absolute footer */}
          <View style={{ height: 120 }} />
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Bar Absolute */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomBarButtons}>
          {currentStep > 1 && (
            <ThemedButton
              title="Kembali"
              variant="secondary"
              onPress={handlePrevStep}
              style={styles.btnBack}
            />
          )}

          <ThemedButton
            title={
              currentStep < totalSteps
                ? "Lanjut"
                : isLoading
                  ? "Memproses..."
                  : "Daftar"
            }
            onPress={currentStep < totalSteps ? handleNextStep : handleRegister}
            disabled={isLoading}
            style={styles.btnNext}
          />
        </View>
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
      backgroundColor: Colors[colorScheme].background, // Full background
    },
    headerFixed: {
      backgroundColor: Colors[colorScheme].background,
      zIndex: 10,
    },
    progressContainer: {
      height: 2,
      backgroundColor: Colors[colorScheme].border2,
      width: '100%',
    },
    progressBar: {
      height: '100%',
      backgroundColor: Colors[colorScheme].primary,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingTop: 16,
      justifyContent: isTablet && !isTabletLandscape ? "center" : undefined,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 600 : isTablet ? 500 : '100%',
      alignSelf: "center",
      paddingHorizontal: isTablet ? 0 : 20,
    },

    // Step Indicator Simple
    stepIndicatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    stepWrapper: {
      alignItems: 'center',
    },
    stepCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors[colorScheme].border2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    stepCircleActive: {
      backgroundColor: Colors[colorScheme].primary,
    },
    stepCircleCompleted: {
      backgroundColor: Colors[colorScheme].primary,
    },
    stepNumber: {
      fontSize: 12,
      fontWeight: 'bold',
      color: Colors[colorScheme].icon,
    },
    stepNumberActive: {
      color: '#fff',
    },
    stepLabel: {
      fontSize: 11,
      color: Colors[colorScheme].icon,
      fontWeight: '500',
    },
    stepLabelActive: {
      color: Colors[colorScheme].primary,
      fontWeight: '700',
    },
    stepLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors[colorScheme].border2,
      marginHorizontal: 8,
      marginBottom: 16, // align with circle center roughly
    },
    stepLineActive: {
      backgroundColor: Colors[colorScheme].primary,
    },

    // Card Like Container
    cardContainer: {
      // Clean clean look, no shadow/border for modern feel on mobile, just spacing
    },
    sectionTitleContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
    },

    // Step Content
    stepContent: {
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: Colors[colorScheme].border2,
      marginVertical: 24,
    },
    groupLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
      marginBottom: 16,
    },
    rowInputs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${Colors[colorScheme].primary}10`,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    infoBoxText: {
      marginLeft: 10,
      fontSize: 13,
      color: Colors[colorScheme].text,
      flex: 1,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 16,
    },
    termsText: {
      marginLeft: 10,
      fontSize: 14,
      lineHeight: 20,
      color: Colors[colorScheme].icon,
      flex: 1,
    },
    link: {
      color: Colors[colorScheme].primary,
      fontWeight: 'bold',
    },

    // Bottom Bar
    bottomBar: {
      backgroundColor: Colors[colorScheme].background,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border2,
      paddingTop: 16,
      paddingHorizontal: 24,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      elevation: 10, // Shadow for android
      shadowColor: "#000", // Shadow for iOS
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    bottomBarButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    btnBack: {
      flex: 1,
    },
    btnNext: {
      flex: 2,
    },
  });

export default RegisterScreen;
