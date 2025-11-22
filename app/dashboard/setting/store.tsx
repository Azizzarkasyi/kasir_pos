import ComboInput from "@/components/combo-input";
import ConfirmPopup from "@/components/atoms/confirm-popup";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React from "react";
import {StyleSheet, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";

export default function StoreSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const [businessType, setBusinessType] = React.useState("services_other");
  const [storeName, setStoreName] = React.useState("Toko klontong aas");
  const [defaultTax, setDefaultTax] = React.useState("0.0");
  const [ownerName, setOwnerName] = React.useState("Basofi");
  const phone = "+6288277069611";
  const [language, setLanguage] = React.useState("en");
  const [currency, setCurrency] = React.useState("idr");
  const [address, setAddress] = React.useState(
    "RCC-CC1_3, Bengkok, Beriman, Arjowinangun, Kec. Kedungkandang, Kota Malang"
  );
  const photoUri: string | undefined = undefined;
  const [country, setCountry] = React.useState("id");
  const [province, setProvince] = React.useState("JAWA TIMUR");
  const [cityRegion, setCityRegion] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <ImageUpload uri={photoUri} onPress={() => {}} />
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Store or Business Data</ThemedText>
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
          <ThemedInput
            label="Mobile Number"
            value={phone}
            editable={false}
            rightIcon={
              <ThemedText style={{color: Colors[colorScheme].primary}}>
                Verification
              </ThemedText>
            }
          />
          <ThemedText style={{color: "red"}}>
            * Have not verified yet
          </ThemedText>
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
        </View>

        <View style={styles.bottomButtonWrapper}>
          <ThemedButton title="SAVE" onPress={() => setConfirmOpen(true)} />
        </View>

        <ConfirmPopup
          visible={confirmOpen}
          title="WARNING"
          message="Data has not been saved. Are you sure you want to return?"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
          }}
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
