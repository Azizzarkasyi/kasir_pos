import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const SmallLogo = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.logoContainer}>
      <Image source={require('@/assets/logos/logo_elbic.png')} style={styles.logoImage} />
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
});

export default SmallLogo;