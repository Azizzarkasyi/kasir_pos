import SectionDivider from "@/components/atoms/section-divider";
import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {StyleSheet, useWindowDimensions, View, Alert} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {branchApi} from "@/services/endpoints/branches";
import assetApi, {prepareFileFromUri} from "@/services/endpoints/assets";

export default function AddOutletScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [district, setDistrict] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [subDistrictId, setSubDistrictId] = useState("");
  const [address, setAddress] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Nama outlet harus diisi");
      return;
    }
    if (!province || !city || !district || !subDistrict) {
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
              {text: "Lanjutkan", onPress: () => {}},
            ]
          );
          return;
        }
      }

      const payload: any = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        province: {
          id: provinceId || "1",
          name: province,
        },
        city: {
          id: cityId || "1",
          name: city,
        },
        subdistrict: {
          id: districtId || "1",
          name: district,
        },
        village: {
          id: subDistrictId || "1",
          name: subDistrict,
        },
        address: address.trim(),
        status: "active",
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

      console.log("📦 Creating branch:", payload);

      const response = await branchApi.createBranch(payload);

      if (response.data) {
        console.log("✅ Branch created:", response.data);
        Alert.alert("Berhasil", "Outlet berhasil ditambahkan", [
          {
            text: "OK",
            onPress: () => {
              router.back();
              // Trigger refresh on index page
              router.setParams({refresh: Date.now().toString()});
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Failed to create branch:", error);
      Alert.alert("Error", error.message || "Gagal menambahkan outlet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
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
              value={province}
              onChangeText={setProvince}
              items={[
                {label: "JAWA TIMUR", value: "JAWA TIMUR"},
                {label: "DKI JAKARTA", value: "DKI JAKARTA"},
                {label: "JAWA BARAT", value: "JAWA BARAT"},
              ]}
              size="md"
            />
            <ComboInput
              label="Kota/Kabupaten"
              value={city}
              onChangeText={setCity}
              items={[
                {label: "Kota Malang", value: "Kota Malang"},
                {label: "Kab. Malang", value: "Kab. Malang"},
                {label: "Surabaya", value: "Surabaya"},
              ]}
              size="md"
            />
            <ComboInput
              label="Kecamatan"
              value={district}
              onChangeText={setDistrict}
              items={[
                {label: "Kedungkandang", value: "Kedungkandang"},
                {label: "Klojen", value: "Klojen"},
                {label: "Lowokwaru", value: "Lowokwaru"},
              ]}
              size="md"
            />
            <ComboInput
              label="Kelurahan"
              value={subDistrict}
              onChangeText={setSubDistrict}
              items={[
                {label: "Arjowinangun", value: "Arjowinangun"},
                {label: "Sawojajar", value: "Sawojajar"},
                {label: "Tlogowaru", value: "Tlogowaru"},
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
