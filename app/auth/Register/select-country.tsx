import CountryListItem from "@/components/country-list-item";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useNavigation} from "expo-router";
import React, {useState} from "react";
import {FlatList, StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const countries = [
  {id: "1", name: "Indonesia"},
  {id: "2", name: "Brunei"},
  {id: "3", name: "Cambodia"},
  {id: "4", name: "Laos"},
  {id: "5", name: "Malaysia"},
  {id: "6", name: "Myanmar"},
  {id: "7", name: "Philippines"},
  {id: "8", name: "Singapore"},
  {id: "9", name: "Thailand"},
  {id: "10", name: "Timor Leste"},
];

const SelectCountryScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const navigation = useNavigation();

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({item}: {item: {id: string; name: string}}) => (
    <CountryListItem
      item={item}
      selected={selectedCountry === item.id}
      onPress={() => setSelectedCountry(item.id)}
    />
  );

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 80,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        style={{backgroundColor: Colors[colorScheme].background}}
      >
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Pilih Negara
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Kamu tidak bisa mengubah pilihan negaramu setelah proses verifikasi
            selesai.
          </ThemedText>
          <ThemedInput
            label="Cari Negara"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            showsVerticalScrollIndicator={false}
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={[styles.list]}
            contentContainerStyle={{paddingBottom: 20}}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.bottomBar}>
        <ThemedButton
          title="Lanjutkan"
          variant="primary"
          onPress={() => navigation.navigate("auth/Register/register" as never)}
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
    content: {
      flex: 1,
    },
    title: {
      marginTop: 20,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 20,
      color: Colors[colorScheme].icon,
    },
    list: {
      marginTop: 20,
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

export default SelectCountryScreen;
