import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React, {useEffect, useRef, useState} from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

export type ThemedInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  width?: number | string;
  showLabel?: boolean;
  rightIcon?: React.ReactNode;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  inputContainerStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  /** Optional external ref to control the underlying TextInput (e.g. focusing from a Modal). */
  inputRef?: React.RefObject<TextInput | null>;
  /** When true, input will try to auto-focus reliably inside a Modal when modalVisible becomes true. */
  isAutoFocusOnModal?: boolean;
  size?: "sm" | "base" | "md";
  /** When true, only numeric characters (0-9) are allowed */
  numericOnly?: boolean;
};

export function ThemedInput({
  label,
  error,
  isPassword = false,
  leftIcon,
  leftIconName,
  width = "100%",
  showLabel = true,
  rightIcon,
  rightIconName,
  inputContainerStyle,
  containerStyle,
  inputRef: externalInputRef,
  isAutoFocusOnModal,
  size = "base",
  numericOnly = false,
  ...rest
}: ThemedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const value = rest.value || "";
  const colorScheme = useColorScheme() ?? "light";
  const editable = rest.editable ?? true;
  const styles = createStyles(colorScheme, !!error, isFocused, size, editable);

  // Handle numeric-only input
  const handleTextChange = (text: string) => {
    if (numericOnly) {
      const numericValue = text.replace(/[^0-9]/g, "");
      rest.onChangeText?.(numericValue);
    } else {
      rest.onChangeText?.(text);
    }
  };

  const focusAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const internalRef = useRef<TextInput | null>(null);
  const inputRef = externalInputRef ?? internalRef;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, focusAnim]);

  useEffect(() => {
    if (!isAutoFocusOnModal) return;

    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timeout);
  }, [isAutoFocusOnModal, inputRef]);

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
      outputRange: [
        error ? "red" : Colors[colorScheme].text,
        error ? "red" : Colors[colorScheme].primary,
      ],
    }),
    backgroundColor: Colors[colorScheme].background,
    paddingHorizontal: 4,
  };

  return (
    <View style={[styles.container, {width}, containerStyle as any]}>
      <View style={[styles.inputContainer, inputContainerStyle]}>
        {showLabel ? (
          <Animated.Text style={[styles.label, labelStyle]}>
            {label}
          </Animated.Text>
        ) : null}
        <View style={styles.leftIconContainer}>
          {leftIcon ? (
            leftIcon
          ) : leftIconName ? (
            <Ionicons
              name={leftIconName}
              size={20}
              color={Colors[colorScheme].icon}
            />
          ) : null}
        </View>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            rest.multiline ? {textAlignVertical: "center"} : null,
          ]}
          {...rest}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPinVisible}
          keyboardType={numericOnly ? "number-pad" : rest.keyboardType}
        />
        <View style={styles.iconContainer}>
          {error ? (
            <Ionicons name="alert-circle" size={24} color={"red"} />
          ) : isPassword ? (
            <TouchableOpacity onPress={() => setIsPinVisible(!isPinVisible)}>
              <Ionicons
                name={isPinVisible ? "eye-off-outline" : "eye-outline"}
                size={24}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          ) : rightIcon ? (
            rightIcon
          ) : rightIconName ? (
            <Ionicons
              name={rightIconName as any}
              size={20}
              color={Colors[colorScheme].icon}
            />
          ) : null}
        </View>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (
  colorScheme: "light" | "dark",
  hasError: boolean,
  isFocused: boolean,
  size: "sm" | "base" | "md",
  editable: boolean
) =>
  StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: 8,
      marginVertical: size === "sm" ? 6 : size === "md" ? 8 : 10,
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: editable
        ? Colors[colorScheme].background
        : Colors[colorScheme].border2,
      borderColor: hasError
        ? "red"
        : isFocused
        ? Colors[colorScheme].primary
        : Colors[colorScheme].border,
      paddingHorizontal: size === "sm" ? 10 : size === "md" ? 14 : 12,
      minHeight: size === "sm" ? 48 : size === "md" ? 52 : 56,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
    },
    label: {
      position: "absolute",
      fontSize: size === "sm" ? 14 : size === "md" ? 14 : 16,
      top: size === "sm" ? 12 : size === "md" ? 12 : 16,
      left: 12,
    },
    leftIconContainer: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: size === "sm" ? 14 : size === "md" ? 15 : 16,
      color: Colors[colorScheme].text,
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
  });
