import {
  BottomTabBar,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsiveValue } from '@/hooks/use-responsive';

export function BlurPillTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const tabBarBackground = Colors[colorScheme].tabBarBackground;
  const marginHorizontal = useResponsiveValue({
    mobile: 16,
    tablet: 24,
    desktop: 32,
    largeDesktop: 32,
  });
  const maxWidth = useResponsiveValue<number | undefined>({
    mobile: undefined,
    tablet: 420,
    desktop: 480,
    largeDesktop: 520,
  });

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: insets.bottom,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pill,
          {
            marginHorizontal: marginHorizontal ?? 16,
            maxWidth: maxWidth ?? undefined,
          },
        ]}
      >
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tabBarBackground }]} />
        ) : (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}
        <BottomTabBar {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  pill: {
    overflow: 'hidden',
    borderRadius: 40,
    width: '100%',
  },
});
