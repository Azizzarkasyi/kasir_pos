import ConfirmPopup from "@/components/atoms/confirm-popup";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React, {useEffect, useState} from "react";
import {StyleSheet, View, Alert, ActivityIndicator} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {settingsApi, StoreInfo} from "@/services";

export default function StoreSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
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
  const [province, setProvince] = useState("");
  const [cityRegion, setCityRegion] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await settingsApi.getStoreInfo();
      if (response.data) {
        const storeData = response.data;
        setStore(storeData);
        setBusinessType(storeData.bussiness_type || "");
        setStoreName(storeData.owner_name || "");
        setDefaultTax(storeData.tax?.toString() || "0");
        setOwnerName(storeData.owner_name || "");
        setPhone(storeData.owner_phone || "");
        setLanguage(storeData.language || "id");
        setCurrency(storeData.curency || "IDR");
        setAddress(storeData.address || "");
        setCountry(storeData.country || "Indonesia");
        setProvince(storeData.province?.name || "");
        setPhotoUri(storeData.photo);
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
      await settingsApi.updateStore({
        owner_name: ownerName.trim(),
        bussiness_type: businessType,
        tax: parseFloat(defaultTax) || 0,
        language: language,
        country: country,
        address: address.trim(),
      });
      Alert.alert("Berhasil", "Data toko berhasil diperbarui");
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
          {justifyContent: "center", alignItems: "center"},
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Store" showHelp={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <ImageUpload uri={photoUri} onPress={() => {}} />
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2" style={{marginBottom: 12}}>
            Store or Business Data
          </ThemedText>
          <ComboInput
            label="Business Type"
            value={businessType}
            onChangeText={setBusinessType}
            items={[
              {label: "Jasa/Service Lainnya", value: "services_other"},
              {label: "Makanan/Minuman", value: "food_beverage"},
              {label: "Retail", value: "retail"},
            ]}
          />
          <ThemedInput
            label="Store Business Name"
            value={storeName}
            onChangeText={setStoreName}
          />
          <ThemedInput
            label="Default Tax"
            value={defaultTax}
            onChangeText={setDefaultTax}
            keyboardType="decimal-pad"
          />
          <ThemedInput
            label="Owner Name"
            value={ownerName}
            onChangeText={setOwnerName}
          />
          <ThemedInput label="Mobile Number" value={phone} editable={false} />
          {/* <ThemedText style={{color: "red"}}>
            * Have not verified yet
          </ThemedText> */}
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Store Location</ThemedText>
          <ComboInput
            label="Country"
            value={country}
            onChangeText={setCountry}
            items={[
              {label: "Indonesia", value: "id"},
              {label: "Malaysia", value: "my"},
              {label: "Singapore", value: "sg"},
            ]}
          />
          <ComboInput
            label="Province"
            value={province}
            onChangeText={setProvince}
            items={[
              {label: "JAWA TIMUR", value: "JAWA TIMUR"},
              {label: "DKI JAKARTA", value: "DKI JAKARTA"},
              {label: "JAWA BARAT", value: "JAWA BARAT"},
            ]}
          />
          <ComboInput
            label="Region/City"
            value={cityRegion}
            onChangeText={setCityRegion}
            items={[
              {label: "Kota Malang", value: "Kota Malang"},
              {label: "Kab. Malang", value: "Kab. Malang"},
              {label: "Surabaya", value: "Surabaya"},
            ]}
          />
          <ThemedInput
            label="Address"
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
        {/* 
        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">
            Select Language and Currency
          </ThemedText>
          <ComboInput
            label="Language"
            value={language}
            onChangeText={setLanguage}
            items={[
              {label: "English", value: "en"},
              {label: "Indonesia", value: "id"},
            ]}
          />
          <ComboInput
            label="Currency"
            value={currency}
            onChangeText={setCurrency}
            items={[{label: "Indonesian Rupiah", value: "idr"}]}
          />
        </View> */}

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
      </ScrollView>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 80,
    },
    sectionCard: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    bottomButtonWrapper: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },
  });
