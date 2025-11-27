import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
} from "react-native";

type ComboItem = {label: string; value: string};

type ComboInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  items: ComboItem[];
  error?: string;
  disableAutoComplete?: boolean;
  size?: "sm" | "base" | "md";
};

const ComboInput: React.FC<ComboInputProps> = ({
  label,
  value,
  onChangeText,
  items,
  error,
  disableAutoComplete,
  size = "base",
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, !!error, size);
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);

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
    size === "sm" ? [14, 12] : size === "md" ? [15, 12] : [16, 12];

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
      outputRange: [Colors[colorScheme].text, Colors[colorScheme].primary],
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
          setOpen(true);
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
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (disableAutoComplete) return;
            setIsFocused(true);
            setOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
        />
        {items?.length ? (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setOpen(o => !o)}
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

      {open && filtered.length > 0 && (
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.dropdownOverlay}>
            <View style={styles.dropdown}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {filtered.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.item}
                    onPress={() => {
                      onChangeText(item.label);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[styles.itemText, { color: Colors[colorScheme].text }]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
      paddingHorizontal: size === "sm" ? 10 : size === "md" ? 14 : 12,
      borderColor: Colors[colorScheme].primary,
      height: size === "sm" ? 48 : size === "md" ? 52 : 56,
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
      fontSize: size === "sm" ? 14 : size === "md" ? 15 : 16,
      color: Colors[colorScheme].text,

      borderRadius: 4,
      height: "100%",
    },
    iconContainer: {
      paddingLeft: 12,
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginTop: 4,
      marginLeft: 12,
    },
    dropdownOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
      fontSize: 16,
    },
  });

export default ComboInput;
