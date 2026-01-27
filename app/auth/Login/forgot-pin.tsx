import CountryCodePicker from "@/components/country-code-picker";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi } from "@/services";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    useWindowDimensions,
    View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ForgotPinScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const countryItems = [
        { label: "Indonesia", value: "🇮🇩" },
        { label: "Malaysia", value: "🇲🇾" },
        { label: "Singapore", value: "🇸🇬" },
        { label: "Thailand", value: "🇹🇭" },
        { label: "Philippines", value: "🇵🇭" },
        { label: "Brunei", value: "🇧🇳" },
    ];
    const [countryCode, setCountryCode] = useState(countryItems[0].value);

    // Countdown timer effect
    useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleSendLink = async () => {
        if (!phone) {
            Alert.alert("Error", "Nomor handphone tidak boleh kosong");
            return;
        }
        if (phone.length < 10) {
            Alert.alert("Error", "Nomor handphone minimal 10 digit");
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.requestForgotPin(phone);
            // Assuming response structure based on FORGOT_PIN_API.md
            // The service wrapper usually returns { success: boolean, data: ... } or throws?
            // Let's assume standard response handling similar to verify-otp

            // Note: verify-otp checks response.success. authApi implementations in existing code return data directly sometimes?
            // Looking at auth.ts: requestOtp returns ApiResponse<any>.
            // In verify-otp: const response = await authApi.requestOtp(...) -> if (response.success)

            if (response.success || (response as any).message === "Reset PIN link sent successfully") {
                Alert.alert("Sukses", "Link reset password sudah dikirim.");
                setCountdown(30);
            } else {
                Alert.alert("Gagal", response.message || "Gagal mengirim link reset password");
            }
        } catch (error: any) {
            console.error("Forgot Pin Error:", error);
            Alert.alert("Error", error.message || "Terjadi kesalahan saat mengirim request");
        } finally {
            setLoading(false);
        }
    };

    const styles = createStyles(colorScheme, isTablet);

    return (
        <View style={styles.container}>
            <Header title="Lupa PIN" onHelpPress={() => router.push("/dashboard/help")} />
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                style={{ backgroundColor: Colors[colorScheme].background }}
            >
                <View style={styles.formContainer}>
                    <ThemedText style={styles.description}>
                        Masukkan nomor handphone yang terdaftar untuk menerima link reset PIN.
                    </ThemedText>

                    <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 20 }}>
                        <CountryCodePicker
                            value={countryCode}
                            onChange={setCountryCode}
                            items={countryItems}
                        />
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <ThemedInput
                                label="No. Handphone"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                containerStyle={{ marginTop: 0 }}
                            />
                        </View>
                    </View>

                    <ThemedButton
                        title={countdown > 0 ? `Kirim Ulang (${countdown}s)` : "Kirim Link Reset"}
                        onPress={handleSendLink}
                        disabled={loading || countdown > 0}
                        style={{ marginTop: 32 }}
                    />
                </View>
            </KeyboardAwareScrollView>
        </View>
    );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
        },
        scrollContainer: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
        },
        formContainer: {
            marginTop: 20,
            width: "100%",
            maxWidth: isTablet ? 480 : 400,
            alignSelf: "center",
        },
        description: {
            fontSize: 16,
            color: Colors[colorScheme].icon, // Use icon color for slightly muted text
            marginBottom: 10,
            textAlign: 'center',
            lineHeight: 24,
        }
    });
