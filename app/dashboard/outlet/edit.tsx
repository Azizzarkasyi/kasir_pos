import SectionDivider from "@/components/atoms/section-divider";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function EditOutletScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const [name, setName] = useState("Pusat");
  const [phone, setPhone] = useState("6288217069611");
  const [province, setProvince] = useState("JAWA TIMUR");
  const [city, setCity] = useState("Kab. Malang");
  const [district, setDistrict] = useState("Kedungkandang");
  const [subDistrict, setSubDistrict] = useState("Arjowinangun");
  const [address, setAddress] = useState(
    "Arjowinangun, Kalipare, Kab. Malang, Jawa Timur"
  );
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleSave = () => {
    const payload = {
      name,
      phone,
      province,
      city,
      district,
      subDistrict,
      address,
      imageUri,
    };
    console.log("Ubah outlet", payload);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header title="Ubah Outlet" showHelp={false} withNotificationButton={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ImageUpload
          uri={imageUri || undefined}
          initials={(name || "OT").slice(0, 2).toUpperCase()}
          onPress={() => {
            // Integrasi picker gambar bisa ditambahkan nanti
            setImageUri(null);
          }}
        />

        <View style={styles.sectionContainer}>
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

        <SectionDivider />

        <View style={styles.sectionContainer}>
          <ThemedText type="subtitle-2" style={styles.sectionTitle}>
            Alamat Outlet
          </ThemedText>
          <ComboInput
            label="Provinsi"
            value={province}
            onChangeText={setProvince}
            items={[
              { label: "JAWA TIMUR", value: "JAWA TIMUR" },
              { label: "DKI JAKARTA", value: "DKI JAKARTA" },
              { label: "JAWA BARAT", value: "JAWA BARAT" },
            ]}
            size="md"
          />
          <ComboInput
            label="Kota/Kabupaten"
            value={city}
            onChangeText={setCity}
            items={[
              { label: "Kota Malang", value: "Kota Malang" },
              { label: "Kab. Malang", value: "Kab. Malang" },
              { label: "Surabaya", value: "Surabaya" },
            ]}
            size="md"
          />
          <ComboInput
            label="Kecamatan"
            value={district}
            onChangeText={setDistrict}
            items={[
              { label: "Kedungkandang", value: "Kedungkandang" },
              { label: "Klojen", value: "Klojen" },
              { label: "Lowokwaru", value: "Lowokwaru" },
            ]}
            size="md"
          />
          <ComboInput
            label="Kelurahan"
            value={subDistrict}
            onChangeText={setSubDistrict}
            items={[
              { label: "Arjowinangun", value: "Arjowinangun" },
              { label: "Sawojajar", value: "Sawojajar" },
              { label: "Tlogowaru", value: "Tlogowaru" },
            ]}
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

        <View style={styles.bottomBar}>
          <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    scrollContent: {
      paddingTop: 18,
      paddingBottom: 24,
    },
    sectionContainer: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    sectionTitle: {
      marginBottom: 8,
    },
    bottomBar: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: Colors[colorScheme].background,
    },
  });

