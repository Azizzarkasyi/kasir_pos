import CountryListItem from "@/components/country-list-item";
import Header from "@/components/header";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import React, {useState} from "react";
import {ThemedButton} from "@/components/themed-button";
import {useNavigation} from "@react-navigation/native";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{flex: 1}}
    >
      <View
        style={[
          styles.container,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ]}
      >
        <Header />
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
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
          />
          <ThemedButton
            title="Lanjutkan"
            variant="primary"
            style={{marginTop: 20}}
            onPress={() =>
              navigation.navigate("auth/Register/register" as never)
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
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
  });

export default SelectCountryScreen;
