/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Brand colors
// Background (main): #2c2f38
// Background (secondary): #212129
// Default text: #FFFFFF
// Primary/Text accents: #F6E34C
const tintColorLight = '#F6E34C';
const tintColorDark = '#F6E34C';

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#212129',
    tint: tintColorLight,
    icon: '#F6E34C',
    tabIconDefault: '#fff',
    tabIconSelected: tintColorLight,
    accent: '#F6E34C',
    tabBarBackground: '#2c2f38',
  },
  dark: {
    text: '#FFFFFF',
    background: '#212129',
    tint: tintColorDark,
    icon: '#F6E34C',
    tabIconDefault: '#fff',
    tabIconSelected: tintColorDark,
    accent: '#F6E34C',
    tabBarBackground: '#2c2f38',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
