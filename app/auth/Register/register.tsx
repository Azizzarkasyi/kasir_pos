import Checkbox from "@/components/checkbox";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React, {useState} from "react";
import {StyleSheet, View, Alert, ActivityIndicator} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {authApi} from "@/services";
import {useRouter} from "expo-router";

const businessTypes = [
  {label: "Pilih Tipe Bisnis", value: ""},
  {label: "Restoran", value: "restoran"},
  {label: "Toko Kelontong", value: "toko-kelontong"},
  {label: "Lainnya", value: "lainnya"},
];

const kelurahanData = [
  {label: "Pilih Kelurahan", value: ""},
  {label: "Menteng", value: "menteng"},
  {label: "Gambir", value: "gambir"},
  {label: "Senen", value: "senen"},
];

const RegisterScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State for form fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [outletKelurahan, setOutletKelurahan] = useState("");
  const [outletAddress, setOutletAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    // Reset errors
    setErrors({});

    // Validasi form
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) newErrors.businessName = "Nama usaha wajib diisi";
    if (!businessType) newErrors.businessType = "Tipe bisnis wajib dipilih";
    if (!outletKelurahan) newErrors.outletKelurahan = "Kelurahan wajib dipilih";
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
      // Parse kelurahan (format: "value")
      const regencyData = {
        id: outletKelurahan,
        name:
          kelurahanData.find(k => k.value === outletKelurahan)?.label ||
          outletKelurahan,
      };

      const registerData = {
        country: "Indonesia",
        bussiness_name: businessName,
        business_type: businessType,
        bussiness_regency: regencyData,
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
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Daftar" />
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {paddingBottom: insets.bottom + 80},
        ]}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{
          backgroundColor: Colors[colorScheme].background,
          paddingVertical: 24,
        }}
      >
        <ThemedText style={styles.subtitle}>
          Halo Usahawan, lengkapi data dibawah ini.
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={{marginBottom: 12}}>
            Data Usaha
          </ThemedText>
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
            label="Kelurahan Outlet Utama"
            value={outletKelurahan}
            onChangeText={text => {
              setOutletKelurahan(text);
              if (errors.outletKelurahan) {
                setErrors({...errors, outletKelurahan: ""});
              }
            }}
            items={kelurahanData}
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
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Data Diri Pemilik Usaha</ThemedText>
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
            <ThemedText style={styles.termsText}>
              Dengan ini saya telah menyetujui{" "}
              <ThemedText style={styles.link}>Syarat dan Ketentuan</ThemedText>{" "}
              serta{" "}
              <ThemedText style={styles.link}>Kebijakan Privasi</ThemedText>{" "}
              Qasir
            </ThemedText>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.bottomBar}>
        <ThemedButton
          title={isLoading ? "Mendaftar..." : "Daftar"}
          onPress={handleRegister}
          disabled={isLoading}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors[colorScheme].primary}
            style={{marginTop: 8}}
          />
        )}
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 20,
    },
    scrollContainer: {
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    title: {
      marginTop: 20,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 20,
      color: Colors[colorScheme].icon,
    },
    section: {
      marginBottom: 20,
    },
    termsContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 16,
      marginBottom: 100,
    },
    termsText: {
      marginLeft: 10,
      flex: 1,
      lineHeight: 20,
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
