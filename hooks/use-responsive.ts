import { useState, useEffect, useCallback } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  BREAKPOINTS,
  BreakpointKey,
  FONT_SIZES,
  CONTAINER_PADDING,
  CONTAINER_MAX_WIDTH,
  GRID_COLUMNS,
  GRID_GUTTER,
  getCurrentBreakpoint,
} from '@/constants/breakpoints';

type ResponsiveValue<T> = {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  largeDesktop?: T;
};

interface ResponsiveInfo {
  width: number;
  height: number;
  breakpoint: BreakpointKey;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

/**
 * Hook to get current responsive information
 * Updates automatically when screen dimensions change
 */
export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }: { window: ScaledSize }) => {
        setDimensions(window);
      }
    );

    return () => subscription?.remove();
  }, []);

  const breakpoint = getCurrentBreakpoint();

  return {
    width: dimensions.width,
    height: dimensions.height,
    breakpoint,
    isMobile: dimensions.width < BREAKPOINTS.tablet,
    isTablet: dimensions.width >= BREAKPOINTS.tablet && dimensions.width < BREAKPOINTS.desktop,
    isDesktop: dimensions.width >= BREAKPOINTS.desktop,
    isLargeDesktop: dimensions.width >= BREAKPOINTS.largeDesktop,
  };
}

/**
 * Hook to get a responsive value based on current breakpoint
 * Falls back to smaller breakpoint values if not defined
 *
 * @example
 * const padding = useResponsiveValue({ mobile: 16, tablet: 24, desktop: 32 });
 */
export function useResponsiveValue<T>(values: ResponsiveValue<T>): T | undefined {
  const { breakpoint } = useResponsive();

  const getValue = useCallback((): T | undefined => {
    // Priority order based on current breakpoint with fallback
    switch (breakpoint) {
      case 'largeDesktop':
        return values.largeDesktop ?? values.desktop ?? values.tablet ?? values.mobile;
      case 'desktop':
        return values.desktop ?? values.tablet ?? values.mobile;
      case 'tablet':
        return values.tablet ?? values.mobile;
      case 'mobile':
      default:
        return values.mobile;
    }
  }, [breakpoint, values]);

  return getValue();
}

/**
 * Hook to get responsive font size based on current breakpoint
 *
 * @example
 * const fontSize = useResponsiveFontSize('lg'); // Returns 16 on mobile, 18 on tablet, 20 on desktop
 */
export function useResponsiveFontSize(
  size: keyof typeof FONT_SIZES.mobile
): number {
  const { breakpoint } = useResponsive();

  switch (breakpoint) {
    case 'largeDesktop':
    case 'desktop':
      return FONT_SIZES.desktop[size];
    case 'tablet':
      return FONT_SIZES.tablet[size];
    case 'mobile':
    default:
      return FONT_SIZES.mobile[size];
  }
}

/**
 * Hook to get container padding based on current breakpoint
 */
export function useContainerPadding(): number {
  const { breakpoint } = useResponsive();

  switch (breakpoint) {
    case 'largeDesktop':
      return CONTAINER_PADDING.largeDesktop;
    case 'desktop':
      return CONTAINER_PADDING.desktop;
    case 'tablet':
      return CONTAINER_PADDING.tablet;
    case 'mobile':
    default:
      return CONTAINER_PADDING.mobile;
  }
}

/**
 * Hook to get container max width based on current breakpoint
 */
export function useContainerMaxWidth(): string | number {
  const { breakpoint } = useResponsive();

  switch (breakpoint) {
    case 'largeDesktop':
      return CONTAINER_MAX_WIDTH.largeDesktop;
    case 'desktop':
      return CONTAINER_MAX_WIDTH.desktop;
    case 'tablet':
      return CONTAINER_MAX_WIDTH.tablet;
    case 'mobile':
    default:
      return CONTAINER_MAX_WIDTH.mobile;
  }
}

/**
 * Hook to get grid columns based on current breakpoint
 */
export function useGridColumns(): number {
  const { breakpoint } = useResponsive();

  switch (breakpoint) {
    case 'largeDesktop':
      return GRID_COLUMNS.largeDesktop;
    case 'desktop':
      return GRID_COLUMNS.desktop;
    case 'tablet':
      return GRID_COLUMNS.tablet;
    case 'mobile':
    default:
      return GRID_COLUMNS.mobile;
  }
}

/**
 * Hook to get grid gutter based on current breakpoint
 */
export function useGridGutter(): number {
  const { breakpoint } = useResponsive();

  switch (breakpoint) {
    case 'largeDesktop':
      return GRID_GUTTER.largeDesktop;
    case 'desktop':
      return GRID_GUTTER.desktop;
    case 'tablet':
      return GRID_GUTTER.tablet;
    case 'mobile':
    default:
      return GRID_GUTTER.mobile;
  }
}

/**
 * Utility to create responsive styles object
 * Use this inside StyleSheet.create() for static responsive values
 *
 * @example
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: responsiveStyle({ mobile: 16, tablet: 24, desktop: 32 }),
 *   }
 * });
 */
export function responsiveStyle<T>(values: ResponsiveValue<T>): T | undefined {
  const breakpoint = getCurrentBreakpoint();

  switch (breakpoint) {
    case 'largeDesktop':
      return values.largeDesktop ?? values.desktop ?? values.tablet ?? values.mobile;
    case 'desktop':
      return values.desktop ?? values.tablet ?? values.mobile;
    case 'tablet':
      return values.tablet ?? values.mobile;
    case 'mobile':
    default:
      return values.mobile;
  }
}

/**
 * Scale a value proportionally based on screen width
 * Base width is 375 (iPhone standard)
 *
 * @example
 * const scaledPadding = scaleWidth(16); // Scales 16 proportionally to screen width
 */
export function scaleWidth(size: number, baseWidth: number = 375): number {
  const { width } = Dimensions.get('window');
  return (width / baseWidth) * size;
}

/**
 * Scale a value proportionally based on screen height
 * Base height is 812 (iPhone X standard)
 *
 * @example
 * const scaledHeight = scaleHeight(100); // Scales 100 proportionally to screen height
 */
export function scaleHeight(size: number, baseHeight: number = 812): number {
  const { height } = Dimensions.get('window');
  return (height / baseHeight) * size;
}

/**
 * Moderately scale a value (less aggressive than scaleWidth)
 * Useful for font sizes and small elements
 *
 * @example
 * const fontSize = moderateScale(14); // Moderately scales font size
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  const { width } = Dimensions.get('window');
  const baseWidth = 375;
  return size + (scaleWidth(size, baseWidth) - size) * factor;
}