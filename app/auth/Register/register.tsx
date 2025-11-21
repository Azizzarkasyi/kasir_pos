import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Header from '@/components/header';
import { ThemedInput } from '@/components/themed-input';
import ComboInput from '@/components/combo-input';
import Checkbox from '@/components/checkbox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedButton } from '@/components/themed-button';

const businessTypes = [
  { label: 'Pilih Tipe Bisnis', value: '' },
  { label: 'Restoran', value: 'restoran' },
  { label: 'Toko Kelontong', value: 'toko-kelontong' },
  { label: 'Lainnya', value: 'lainnya' },
];

const kelurahanData = [
  { label: 'Pilih Kelurahan', value: '' },
  { label: 'Menteng', value: 'menteng' },
  { label: 'Gambir', value: 'gambir' },
  { label: 'Senen', value: 'senen' },
];

const RegisterScreen = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();

  // State for form fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [outletKelurahan, setOutletKelurahan] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Header />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedText type="title" style={styles.title}>Daftar</ThemedText>
          <ThemedText style={styles.subtitle}>Halo Usahawan, lengkapi data dibawah ini.</ThemedText>

          <View style={styles.section}>
            <ThemedText type="subtitle">Data Usaha</ThemedText>
            <ThemedInput label="Nama Usaha" value={businessName} onChangeText={setBusinessName} />
            <ComboInput label="Pilih Tipe Bisnis" value={businessType} onChangeText={setBusinessType} items={businessTypes} />
            <ComboInput label="Kelurahan Outlet Utama" value={outletKelurahan} onChangeText={setOutletKelurahan} items={kelurahanData} />
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">Data Diri Pemilik Usaha</ThemedText>
            <ThemedInput label="Nama Pemilik" value={ownerName} onChangeText={setOwnerName} />
            <ThemedInput label="No. Handphone" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
            <ThemedInput label="No. PIN 6 Angka" value={pin} onChangeText={setPin} keyboardType="number-pad" isPassword />
            <ThemedInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <ThemedInput label="Kode Referal (Opsional)" value={referralCode} onChangeText={setReferralCode} />
          </View>

          <View style={styles.termsContainer}>
            <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms} />
            <ThemedText style={styles.termsText}>
              Dengan ini saya telah menyetujui <ThemedText style={styles.link}>Syarat dan Ketentuan</ThemedText> serta <ThemedText style={styles.link}>Kebijakan Privasi</ThemedText> Qasir
            </ThemedText>
          </View>

          <ThemedButton title="Daftar" onPress={() => {}} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 20,
    },
    scrollContainer: {
      paddingBottom: 20,
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
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    termsText: {
      marginLeft: 10,
      flex: 1,
    },
    link: {
      color: Colors[colorScheme].primary,
      textDecorationLine: 'underline',
    },
  });

export default RegisterScreen;