import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, type TextProps, useWindowDimensions } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'subtitle-2';
};

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const color = Colors[colorScheme].text;
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const themedStyles = isTablet ? tabletStyles : styles;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? themedStyles.default : undefined,
        type === 'title' ? themedStyles.title : undefined,
        type === 'defaultSemiBold' ? themedStyles.defaultSemiBold : undefined,
        type === 'subtitle' ? themedStyles.subtitle : undefined,
        type === 'subtitle-2' ? themedStyles.subtitle2 : undefined,
        type === 'link' ? themedStyles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle2: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});

const tabletStyles = StyleSheet.create({
  default: {
    fontSize: 18,
    lineHeight: 26,
  },
  defaultSemiBold: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 32,
    fontSize: 18,
    color: '#0a7ea4',
  },
});