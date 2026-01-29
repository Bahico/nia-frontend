import { View, StyleSheet, ViewProps } from 'react-native';
import { useGridGutter, useResponsive } from '@/hooks/use-responsive';

interface ResponsiveGridProps extends ViewProps {
  children: React.ReactNode;
  /** Number of columns on mobile (default: 1) */
  mobileColumns?: number;
  /** Number of columns on tablet (default: 2) */
  tabletColumns?: number;
  /** Number of columns on desktop (default: 3) */
  desktopColumns?: number;
  /** Number of columns on large desktop (default: 4) */
  largeDesktopColumns?: number;
}

/**
 * A responsive grid component that adjusts columns based on breakpoint.
 *
 * @example
 * <ResponsiveGrid mobileColumns={1} tabletColumns={2} desktopColumns={3}>
 *   <GridItem />
 *   <GridItem />
 *   <GridItem />
 * </ResponsiveGrid>
 */
export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  largeDesktopColumns = 4,
  style,
  ...props
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  const gutter = useGridGutter();

  const getColumns = (): number => {
    if (isLargeDesktop) return largeDesktopColumns;
    if (isDesktop) return desktopColumns;
    if (isTablet) return tabletColumns;
    return mobileColumns;
  };

  const columns = getColumns();

  return (
    <View
      style={[
        styles.grid,
        { gap: gutter },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

interface GridItemProps extends ViewProps {
  children: React.ReactNode;
  /** Span multiple columns */
  span?: number;
}

/**
 * Grid item component to be used inside ResponsiveGrid
 *
 * @example
 * <ResponsiveGrid>
 *   <GridItem><Card /></GridItem>
 *   <GridItem span={2}><WideCard /></GridItem>
 * </ResponsiveGrid>
 */
export function GridItem({
  children,
  span = 1,
  style,
  ...props
}: GridItemProps) {
  return (
    <View
      style={[
        styles.gridItem,
        { flex: span },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    minWidth: 0,
  },
});