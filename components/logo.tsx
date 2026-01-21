import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const Logo = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.logoContainer}>
      <Image source={require('../assets/logos/logo_elbic.png')} style={styles.logoImage} />
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoImage: {
    width: 180,
    height: 180,
  },
});

export default Logo;