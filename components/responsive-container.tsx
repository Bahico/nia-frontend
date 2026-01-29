import { View, StyleSheet, ViewProps } from 'react-native';
import { useContainerMaxWidth, useContainerPadding } from '@/hooks/use-responsive';

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  /** Center the container horizontally (useful for web) */
  centered?: boolean;
  /** Disable horizontal padding */
  noPadding?: boolean;
  /** Full width regardless of breakpoint */
  fullWidth?: boolean;
}

/**
 * A container component that automatically adjusts its max-width and padding
 * based on the current screen breakpoint.
 *
 * @example
 * <ResponsiveContainer>
 *   <Text>This content is contained with responsive width</Text>
 * </ResponsiveContainer>
 */
export function ResponsiveContainer({
  children,
  centered = true,
  noPadding = false,
  fullWidth = false,
  style,
  ...props
}: ResponsiveContainerProps) {
  const maxWidth = useContainerMaxWidth();
  const padding = useContainerPadding();

  return (
    <View
      style={[
        styles.container,
          // @ts-ignore
        !fullWidth && { maxWidth },
        centered && styles.centered,
        !noPadding && { paddingHorizontal: padding },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  centered: {
    alignSelf: 'center',
  },
});