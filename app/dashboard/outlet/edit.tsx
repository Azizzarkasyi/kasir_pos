import SectionDivider from "@/components/atoms/section-divider";
import ComboInput from "@/components/combo-input";
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
          setProvince(data.province.name);
          setProvinceId(String(data.province.id));
          setCity(data.city.name);
          setCityId(String(data.city.id));
          setDistrict(data.subdistrict.name);
          setDistrictId(String(data.subdistrict.id));
          setSubDistrict(data.village.name);
          setSubDistrictId(String(data.village.id));
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
      if (province) {
        payload.province = {
          id:
            provinceId && provinceId !== "undefined"
              ? provinceId
              : branch?.province.id || "1",
          name: province,
        };
      }
      if (city) {
        payload.city = {
          id:
            cityId && cityId !== "undefined" ? cityId : branch?.city.id || "1",
          name: city,
        };
      }
      if (district) {
        payload.subdistrict = {
          id:
            districtId && districtId !== "undefined"
              ? districtId
              : branch?.subdistrict.id || "1",
          name: district,
        };
      }
      if (subDistrict) {
        payload.village = {
          id:
            subDistrictId && subDistrictId !== "undefined"
              ? subDistrictId
              : branch?.village.id || "1",
          name: subDistrict,
        };
      }

      console.log("📦 Updating branch:", payload);

      const response = await branchApi.updateBranch(branchId, payload);

      if (response.data) {
        console.log("✅ Branch updated:", response.data);
        Alert.alert("Berhasil", "Outlet berhasil diperbarui", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
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
