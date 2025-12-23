import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { faqService } from "@/services/endpoints/faqs";
import { FAQ } from "@/types/faq";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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


const HelpScreen = () => {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const isLandscape = width > height;
    const isTabletLandscape = isTablet && isLandscape;
    const styles = createStyles(colorScheme, isTablet, isTabletLandscape);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await faqService.getActive() as any;
            const sortedFaqs = response.sort((a: FAQ, b: FAQ) => a.order - b.order);
            setFaqs(sortedFaqs);
        } catch (err) {
            setError("Gagal memuat data FAQ. Silakan coba lagi.");
            console.error("Error fetching FAQs:", err);
        } finally {
            setLoading(false);
        }
    };

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

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
                            <ThemedText style={styles.loadingText}>Memuat data FAQ...</ThemedText>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={48} color={Colors[colorScheme].danger} />
                            <ThemedText style={styles.errorText}>{error}</ThemedText>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchFAQs}>
                                <ThemedText style={styles.retryButtonText}>Coba Lagi</ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : faqs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="help-circle-outline" size={64} color={Colors[colorScheme].icon} />
                            <ThemedText style={styles.emptyTitle}>Belum ada FAQ</ThemedText>
                            <ThemedText style={styles.emptySubtitle}>
                                Pertanyaan yang sering diajukan belum tersedia saat ini.
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.faqList}>
                            {faqs.map((item) => {
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
                    )}

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
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 60,
            gap: 16,
        },
        loadingText: {
            fontSize: isTablet ? 16 : 14,
            color: Colors[colorScheme].icon,
            marginTop: 8,
        },
        errorContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 60,
            gap: 16,
        },
        errorText: {
            fontSize: isTablet ? 16 : 14,
            color: Colors[colorScheme].danger,
            textAlign: "center",
            marginTop: 8,
        },
        retryButton: {
            backgroundColor: Colors[colorScheme].primary,
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 8,
            marginTop: 8,
        },
        retryButtonText: {
            color: "white",
            fontWeight: "600",
            fontSize: isTablet ? 14 : 12,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 80,
            paddingHorizontal: 40,
        },
        emptyTitle: {
            fontSize: isTablet ? 20 : 18,
            fontWeight: "600",
            color: Colors[colorScheme].text,
            marginTop: 16,
            marginBottom: 8,
        },
        emptySubtitle: {
            fontSize: isTablet ? 16 : 14,
            color: Colors[colorScheme].icon,
            textAlign: "center",
            lineHeight: isTablet ? 24 : 20,
        },
    });

export default HelpScreen;
