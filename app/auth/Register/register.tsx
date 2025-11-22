import Checkbox from "@/components/checkbox";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useNavigation} from "@react-navigation/native";
import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

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
  const navigation = useNavigation();

  // State for form fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [outletKelurahan, setOutletKelurahan] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header />
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
          style={{backgroundColor: Colors[colorScheme].background}}
        >
          <ThemedText type="title" style={styles.title}>
            Daftar
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Halo Usahawan, lengkapi data dibawah ini.
          </ThemedText>

          <View style={styles.section}>
            <ThemedText type="subtitle">Data Usaha</ThemedText>
            <ThemedInput
              label="Nama Usaha"
              value={businessName}
              onChangeText={setBusinessName}
            />
            <ComboInput
              label="Pilih Tipe Bisnis"
              value={businessType}
              onChangeText={setBusinessType}
              items={businessTypes}
            />
            <ComboInput
              label="Kelurahan Outlet Utama"
              value={outletKelurahan}
              onChangeText={setOutletKelurahan}
              items={kelurahanData}
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">Data Diri Pemilik Usaha</ThemedText>
            <ThemedInput
              label="Nama Pemilik"
              value={ownerName}
              onChangeText={setOwnerName}
            />
            <ThemedInput
              label="No. Handphone"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <ThemedInput
              label="No. PIN 6 Angka"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              isPassword
            />
            <ThemedInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <ThemedInput
              label="Kode Referal (Opsional)"
              value={referralCode}
              onChangeText={setReferralCode}
            />
          </View>

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

        </KeyboardAwareScrollView>
      <View style={styles.bottomBar}>
        <ThemedButton
          title="Daftar"
          onPress={() =>
            navigation.navigate("auth/Register/verify-otp" as never)
          }
        />
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
      alignItems: "center",
      marginBottom: 20,
    },
    termsText: {
      marginLeft: 10,
      flex: 1,
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
