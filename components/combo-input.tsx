import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDropdown } from "@/hooks/use-dropdown";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";

type ComboItem = {label: string; value: string};

type ComboInputProps = {
  onChange?: (item: ComboItem) => void;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  items: ComboItem[];
  error?: string;
  disableAutoComplete?: boolean;
  size?: "sm" | "base" | "md";
};

const ComboInput: React.FC<ComboInputProps> = ({
  onChange,
  label,
  value,
  onChangeText,
  items,
  error,
  disableAutoComplete,
  size = "base",
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const hasError = !!error;
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const isTablet = Math.min(screenWidth, screenHeight) >= 600;
  const [isFocused, setIsFocused] = useState(false);
  const styles = createStyles(colorScheme, hasError, size, isTablet, isFocused);
  const idRef = useRef(`combo-${label}-${Math.random().toString(36).slice(2)}`);
  const {open, setOpen, openDropdown, closeDropdown, toggleDropdown} = useDropdown(false, idRef.current);

  const focusAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, focusAnim]);

  const labelTopRange: [number, number] =
    size === "sm" ? [12, -8] : size === "md" ? [14, -8] : [16, -8];

  const labelFontRange: [number, number] =
    size === "sm"
      ? isTablet ? [18, 14] : [14, 12]
      : size === "md"
      ? isTablet ? [19, 14] : [15, 12]
      : isTablet
      ? [20, 14]
      : [16, 12];

  const labelStyle = {
    top: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: labelTopRange,
    }),
    fontSize: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: labelFontRange,
    }),
    color: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        hasError ? "red" : Colors[colorScheme].text,
        hasError ? "red" : Colors[colorScheme].primary,
      ],
    }),
    backgroundColor: Colors[colorScheme].background,
    paddingHorizontal: 4,
  } as any;

  const filtered = disableAutoComplete
    ? items
    : items.filter(i =>
        i.label.toLowerCase().includes((value || "").toLowerCase())
      );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          {
            borderColor: !!error
              ? "red"
              : isFocused
              ? Colors[colorScheme].primary
              : Colors[colorScheme].border,
          },
        ]}
        onPress={() => {
          if (!disableAutoComplete) return;
          toggleDropdown();
        }}
        activeOpacity={1}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={value}
          editable={!disableAutoComplete}
          pointerEvents={disableAutoComplete ? "none" : "auto"}
          onChangeText={text => {
            if (disableAutoComplete) return;
            onChangeText(text);
            if (!open) openDropdown();
          }}
          onFocus={() => {
            if (disableAutoComplete) return;
            setIsFocused(true);
            openDropdown();
          }}
          onBlur={() => setIsFocused(false)}
        />
        {items?.length ? (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={toggleDropdown}
          >
            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {open && (
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdown}>
              {filtered.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Belum ada data</Text>
                </View>
              ) : (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  {filtered.map(item => (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.item}
                      onPress={() => {
                        if (disableAutoComplete && item.value === "") {
                          closeDropdown();
                          return;
                        }
                        onChange?.(item);
                        onChangeText(item.label);
                        closeDropdown();
                      }}
                    >
                      <Text
                        style={[
                          styles.itemText,
                          {color: Colors[colorScheme].text},
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const createStyles = (
  colorScheme: "light" | "dark",
  hasError: boolean,
  size: "sm" | "base" | "md",
  isTablet: boolean,
  isFocused: boolean,
) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: size === "sm" ? 6 : size === "md" ? 8 : 10,
      position: "relative",
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal:
        size === "sm"
          ? isTablet ? 14 : 10
          : size === "md"
          ? isTablet ? 18 : 14
          : isTablet
          ? 16
          : 12,
      borderColor: hasError
        ? "red"
        : isFocused
        ? Colors[colorScheme].primary
        : Colors[colorScheme].border,
      height:
        size === "sm"
          ? isTablet ? 56 : 48
          : size === "md"
          ? isTablet ? 60 : 52
          : isTablet
          ? 64
          : 56,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      backgroundColor: Colors[colorScheme].background,
    },
    label: {
      position: "absolute",
      left: 12,
    },
    input: {
      flex: 1,
      fontSize:
        size === "sm"
          ? isTablet ? 18 : 14
          : size === "md"
          ? isTablet ? 19 : 15
          : isTablet
          ? 20
          : 16,
      color: Colors[colorScheme].text,
      paddingLeft: 4,
      borderRadius: 4,
      height: "100%",
    },
    iconContainer: {
      paddingLeft: 12,
    },
    errorText: {
      color: "red",
      fontSize: isTablet ? 14 : 12,
      marginTop: 4,
      marginLeft: 12,
    },
    dropdownOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: -1000,
      zIndex: 19,
    },
    dropdown: {
      position: "absolute",
      top: size === "sm" ? 52 : size === "md" ? 56 : 60,
      left: 0,
      right: 0,
      shadowColor: Colors[colorScheme].shadow,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      maxHeight: 200,
      overflow: "hidden",
      backgroundColor: Colors[colorScheme].background,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
      paddingHorizontal: 8,
      paddingVertical: 6,
      elevation: 20,
      zIndex: 20,
    },
    item: {
      paddingVertical: 12,
      paddingHorizontal: 12,

    },
    itemText: {
      fontSize:
        size === "sm"
          ? isTablet ? 18 : 14
          : size === "md"
          ? isTablet ? 19 : 15
          : isTablet
          ? 20
          : 16,
    },
    emptyContainer: {
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize:
        size === "sm"
          ? isTablet ? 18 : 14
          : size === "md"
          ? isTablet ? 19 : 15
          : isTablet
          ? 20
          : 16,
      color: Colors[colorScheme].text,
      opacity: 0.6,
    },
  });

export default ComboInput;
