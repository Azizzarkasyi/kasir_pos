import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    UIManager,
    View,
    useWindowDimensions,
} from "react-native";

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const FAQS: FAQItem[] = [
    {
        id: "1",
        question: "Bagaimana cara menghubungkan printer bluetooth?",
        answer:
            "Masuk ke menu Pengaturan > Printer. Pastikan bluetooth perangkat Anda menyala, lalu pindai perangkat printer yang tersedia dan pilih untuk menghubungkan.",
    },
    {
        id: "2",
        question: "Bagaimana cara mengubah profil toko?",
        answer:
            "Anda dapat mengubah profil toko melalui menu Pengaturan > Toko. Di sana Anda dapat mengubah nama toko, alamat, dan logo.",
    },
    {
        id: "3",
        question: "Apakah bisa menggunakan scanner barcode?",
        answer:
            "Ya, aplikasi ini mendukung penggunaan barcode scanner bluetooth maupun scanner bawaan kamera perangkat.",
    },
    {
        id: "4",
        question: "Bagaimana cara melihat laporan laba rugi?",
        answer:
            "Laporan laba rugi dapat dilihat pada menu Laporan. Anda dapat memfilter laporan berdasarkan periode harian, mingguan, atau bulanan.",
    },
    {
        id: "5",
        question: "Bagaimana cara menambah pegawai?",
        answer:
            "Masuk ke menu Pegawai, lalu tekan tombol tambah (+) di pojok kanan atas atau tombol 'Tambah Pegawai'. Isi data pegawai dan hak akses yang diinginkan.",
    },
];

const HelpScreen = () => {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const isLandscape = width > height;
    const isTabletLandscape = isTablet && isLandscape;
    const styles = createStyles(colorScheme, isTablet, isTabletLandscape);

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={styles.container}>
            <Header title="Bantuan" showHelp={false} />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentWrapper}>
                    <View style={styles.headerSection}>
                        <ThemedText style={styles.sectionTitle}>
                            Pertanyaan Umum (FAQ)
                        </ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>
                            Temukan jawaban untuk pertanyaan yang sering diajukan
                        </ThemedText>
                    </View>

                    <View style={styles.faqList}>
                        {FAQS.map((item) => {
                            const isExpanded = expandedId === item.id;
                            return (
                                <View key={item.id} style={styles.faqItem}>
                                    <TouchableOpacity
                                        style={styles.questionButton}
                                        onPress={() => toggleExpand(item.id)}
                                        activeOpacity={0.7}
                                    >
                                        <ThemedText style={styles.questionText}>
                                            {item.question}
                                        </ThemedText>
                                        <Ionicons
                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color={Colors[colorScheme].icon}
                                        />
                                    </TouchableOpacity>
                                    {isExpanded && (
                                        <View style={styles.answerContainer}>
                                            <ThemedText style={styles.answerText}>
                                                {item.answer}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.contactSection}>
                        <ThemedText style={styles.contactTitle}>
                            Masih butuh bantuan?
                        </ThemedText>
                        <TouchableOpacity style={styles.contactButton}>
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={20}
                                color="white"
                            />
                            <ThemedText style={styles.contactButtonText}>
                                Hubungi Kami
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const createStyles = (
    colorScheme: "light" | "dark",
    isTablet: boolean,
    isTabletLandscape: boolean
) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
        },
        scrollContainer: {
            paddingBottom: 40,
        },
        contentWrapper: {
            width: "100%",
            maxWidth: isTabletLandscape ? 960 : undefined,
            alignSelf: "center",
            paddingHorizontal: isTablet ? 24 : 16,
            paddingTop: isTablet ? 24 : 16,
        },
        headerSection: {
            marginBottom: isTablet ? 32 : 24,
        },
        sectionTitle: {
            fontSize: isTablet ? 28 : 22,
            fontWeight: "bold",
            marginBottom: 8,
            color: Colors[colorScheme].text,
        },
        sectionSubtitle: {
            fontSize: isTablet ? 16 : 14,
            color: Colors[colorScheme].icon,
        },
        faqList: {
            gap: 12,
            marginBottom: 32,
        },
        faqItem: {
            backgroundColor:
                colorScheme === "dark" ? "#1f2122" : Colors[colorScheme].secondary,
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: Colors[colorScheme].border,
        },
        questionButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isTablet ? 20 : 16,
        },
        questionText: {
            fontSize: isTablet ? 18 : 15,
            fontWeight: "600",
            flex: 1,
            marginRight: 16,
            color: Colors[colorScheme].text,
        },
        answerContainer: {
            paddingHorizontal: isTablet ? 20 : 16,
            paddingBottom: isTablet ? 20 : 16,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme].border,
            paddingTop: 12,
        },
        answerText: {
            fontSize: isTablet ? 16 : 14,
            color: Colors[colorScheme].icon,
            lineHeight: isTablet ? 24 : 20,
        },
        contactSection: {
            alignItems: "center",
            padding: 24,
            backgroundColor:
                colorScheme === "dark" ? "#1a2525" : Colors[colorScheme].background,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors[colorScheme].border,
            borderStyle: "dashed",
        },
        contactTitle: {
            fontSize: isTablet ? 18 : 16,
            fontWeight: "600",
            marginBottom: 16,
            color: Colors[colorScheme].text,
        },
        contactButton: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors[colorScheme].primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 100,
            gap: 8,
        },
        contactButtonText: {
            color: "white",
            fontWeight: "600",
            fontSize: isTablet ? 16 : 14,
        },
    });

export default HelpScreen;
