/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#00b960ff',
    secondary: '#FFFFFF',
    border: '#d3d3d3ff',
    border2: '#efefefff',
    shadow: '#b4b4b4ff',
    tabBackground: '#e7e7e7ff',
    tabActive: '#ffffffff',
    badgeBackground: '#ffffffff',
    badgeActive: '#00b960ff',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#00b960ff',
    secondary: '#FFFFFF',
    border: '#d3d3d3ff',
    border2: '#efefefff',
    shadow: '#d3d3d3ff',
    tabBackground: '#8e8e8eff',
    tabActive: '#ffffffff',
    badgeBackground: '#ffffffff',
    badgeActive: '#00b960ff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'Roboto',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'Roboto',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'Roboto',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Roboto',
    serif: 'Roboto',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  web: {
    sans: "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    serif: "'Roboto', Georgia, 'Times New Roman', serif",
    rounded: "'Roboto', 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
