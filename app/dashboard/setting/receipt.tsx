import HelpPopup from "@/components/atoms/help-popup";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {useRouter} from "expo-router";
import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";

export default function ReceiptSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const navigation = useNavigation();
  const router = useRouter();
  const [logoUri, setLogoUri] = React.useState<string | undefined>(undefined);
  const [extraNotes, setExtraNotes] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [showHelpExtra, setShowHelpExtra] = React.useState(false);
  const [showHelpMessage, setShowHelpMessage] = React.useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{paddingHorizontal: 8}}>
          <ThemedText style={{color: Colors[colorScheme].primary}}>
            Lihat Struk
          </ThemedText>
        </TouchableOpacity>
      ),
      title: "Atur Struk",
    });
  }, [navigation, colorScheme]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.logoRow}>
            <ImageUpload uri={logoUri} onPress={() => setLogoUri(undefined)} />
            <View style={{flex: 1, marginLeft: 12}}>
              <ThemedButton
                title="Upload Logo"
                variant="secondary"
                onPress={() => setLogoUri(undefined)}
              />
              <ThemedText style={styles.helperText}>
                Ukuran Max 1Mb, format PNG atau JPG
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Pengaturan Dasar</ThemedText>
          <ThemedInput
            label="Keterangan Tambahan (Opsional)"
            value={extraNotes}
            onChangeText={setExtraNotes}
            multiline
            maxLength={100}
            rightIcon={
              <TouchableOpacity onPress={() => setShowHelpExtra(true)}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={Colors[colorScheme].primary}
                />
              </TouchableOpacity>
            }
            inputContainerStyle={{
              height: 100,
              alignItems: "center",
              paddingVertical: 12,
            }}
          />
          <View style={styles.counterRow}>
            <ThemedText
              style={{color: Colors[colorScheme].icon}}
            >{`${extraNotes.length}/100`}</ThemedText>
          </View>
          <ThemedInput
            label="Pesan (Opsional)"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={100}
            rightIcon={
              <TouchableOpacity onPress={() => setShowHelpMessage(true)}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={Colors[colorScheme].primary}
                />
              </TouchableOpacity>
            }
            inputContainerStyle={{
              height: 100,
              alignItems: "center",
              paddingVertical: 12,
            }}
          />
          <View style={styles.counterRow}>
            <ThemedText
              style={{color: Colors[colorScheme].icon}}
            >{`${message.length}/100`}</ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.sectionCardHighlight}
          onPress={() => router.push("/dashboard/setting/order-receipt" as never)}
        >
          <View style={{flex: 1}}>
            <ThemedText>Ingin Pengaturan Tambahan?</ThemedText>
            <ThemedText style={{color: Colors[colorScheme].icon}}>
              Kamu akan lebih leluasa mengatur struk sesuai keinginanmu.
            </ThemedText>
          </View>
          <View style={styles.rightChevron}>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={Colors[colorScheme].primary}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomButtonWrapper}>
          <ThemedButton title="Simpan" onPress={() => {}} />
        </View>
        <HelpPopup
          visible={showHelpExtra}
          title="Keterangan Tambahan"
          description="Keterangan tambahan akan ditampilkan di bawah nama outlet kamu."
          onClose={() => setShowHelpExtra(false)}
        />
        <HelpPopup
          visible={showHelpMessage}
          title="Pesan Untuk Pelanggan"
          description="Pesan akan ditampilkan di bawah kembalian struk."
          onClose={() => setShowHelpMessage(false)}
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
      paddingBottom: 100,
    },
    sectionCard: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    sectionDivider: {
      marginTop: 12,
      height: 8,
      backgroundColor: Colors[colorScheme].secondary,
      borderRadius: 8,
    },
    logoRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    helperText: {
      marginTop: 6,
      color: Colors[colorScheme].icon,
    },
    counterRow: {
      alignItems: "flex-end",
      marginTop: -8,
      marginBottom: 8,
    },
    sectionCardHighlight: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: "#FFA000",
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rightChevron: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    bottomButtonWrapper: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },
  });
