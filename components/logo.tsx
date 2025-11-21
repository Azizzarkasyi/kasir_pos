import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const Logo = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.logoContainer}>
      <ThemedText style={styles.logo}>Qasir</ThemedText>
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    fontSize: 60,
    fontWeight: 'bold',
    color: Colors[colorScheme].primary,
    lineHeight: 72,
  },
});

export default Logo;