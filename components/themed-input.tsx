import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React, {useEffect, useRef, useState} from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

export type ThemedInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export function ThemedInput({
  label,
  error,
  isPassword = false,
  ...rest
}: ThemedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPinVisible, setIsPinVisible] = useState(false);
  const value = rest.value || "";
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, !!error, isFocused);

  const focusAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, focusAnim]);

  const labelStyle = {
    top: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors[colorScheme].icon, Colors[colorScheme].primary],
    }),
    backgroundColor: Colors[colorScheme].background,
    paddingHorizontal: 4,
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          style={styles.input}
          {...rest}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPinVisible}
        />
        <View style={styles.iconContainer}>
          {error ? (
            <Ionicons name="alert-circle" size={24} color={"red"} />
          ) : isPassword ? (
            <TouchableOpacity onPress={() => setIsPinVisible(!isPinVisible)}>
              <Ionicons
                name={isPinVisible ? "eye-off" : "eye"}
                size={24}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
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
  isFocused: boolean
) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: 10,
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: hasError
        ? "red"
        : isFocused
        ? Colors[colorScheme].primary
        : Colors[colorScheme].icon,
      paddingHorizontal: 12,
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
    },
    label: {
      position: "absolute",
      left: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
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
