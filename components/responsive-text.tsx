import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useResponsiveFontSize } from '@/hooks/use-responsive';
import { FONT_SIZES } from '@/constants/breakpoints';

type FontSizeKey = keyof typeof FONT_SIZES.mobile;

interface ResponsiveTextProps extends TextProps {
  children: React.ReactNode;
  /** Font size key that scales with breakpoint */
  size?: FontSizeKey;
  /** Text color from theme */
  lightColor?: string;
  darkColor?: string;
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * A text component with responsive font sizes that scale based on breakpoint.
 *
 * @example
 * <ResponsiveText size="lg">Large responsive text</ResponsiveText>
 * <ResponsiveText size="heading" weight="bold">Heading</ResponsiveText>
 */
export function ResponsiveText({
  children,
  size = 'md',
  lightColor,
  darkColor,
  weight = 'normal',
  align = 'left',
  style,
  ...props
}: ResponsiveTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const fontSize = useResponsiveFontSize(size);

  const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }[weight];

  return (
    <Text
      style={[
        { color, fontSize, fontWeight, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

/**
 * Responsive heading component
 */
export function ResponsiveHeading({
  children,
  style,
  ...props
}: Omit<ResponsiveTextProps, 'size' | 'weight'>) {
  return (
    <ResponsiveText
      size="heading"
      weight="bold"
      style={[styles.heading, style]}
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

/**
 * Responsive title component (larger than heading)
 */
export function ResponsiveTitle({
  children,
  style,
  ...props
}: Omit<ResponsiveTextProps, 'size' | 'weight'>) {
  return (
    <ResponsiveText
      size="title"
      weight="bold"
      style={[styles.title, style]}
      {...props}
    >
      {children}
    </ResponsiveText>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 16,
  },
});