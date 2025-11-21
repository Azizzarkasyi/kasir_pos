import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export function ThemedButton({ title, variant = 'primary', style, ...rest }: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const backgroundColor = variant === 'primary' ? Colors[colorScheme].primary : 'transparent';
  const textColor = variant === 'primary' ? Colors[colorScheme].secondary : Colors[colorScheme].primary;
  const borderColor = Colors[colorScheme].primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        variant === 'secondary' && styles.secondaryButton,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});