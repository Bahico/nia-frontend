import { Dimensions } from 'react-native';

/**
 * Responsive Breakpoints
 * All code must be responsive across these device sizes
 */
export const BREAKPOINTS = {
  // Mobile: 0 - 767px
  mobile: 0,
  // Tablet: 768px - 1023px
  tablet: 768,
  // Desktop/Web: 1024px+
  desktop: 1024,
  // Large Desktop: 1440px+
  largeDesktop: 1440,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Get current screen width
 */
export const getScreenWidth = (): number => {
  return Dimensions.get('window').width;
};

/**
 * Get current screen height
 */
export const getScreenHeight = (): number => {
  return Dimensions.get('window').height;
};

/**
 * Check if current screen is mobile
 */
export const isMobile = (): boolean => {
  const width = getScreenWidth();
  return width < BREAKPOINTS.tablet;
};

/**
 * Check if current screen is tablet
 */
export const isTablet = (): boolean => {
  const width = getScreenWidth();
  return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
};

/**
 * Check if current screen is desktop
 */
export const isDesktop = (): boolean => {
  const width = getScreenWidth();
  return width >= BREAKPOINTS.desktop;
};

/**
 * Check if current screen is large desktop
 */
export const isLargeDesktop = (): boolean => {
  const width = getScreenWidth();
  return width >= BREAKPOINTS.largeDesktop;
};

/**
 * Get current breakpoint key
 */
export const getCurrentBreakpoint = (): BreakpointKey => {
  const width = getScreenWidth();
  if (width >= BREAKPOINTS.largeDesktop) return 'largeDesktop';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
};

/**
 * Responsive spacing scale
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Responsive font sizes
 */
export const FONT_SIZES = {
  mobile: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    heading: 28,
    title: 32,
  },
  tablet: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    heading: 32,
    title: 40,
  },
  desktop: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    heading: 40,
    title: 48,
  },
} as const;

/**
 * Container max widths for each breakpoint
 */
export const CONTAINER_MAX_WIDTH = {
  mobile: '100%',
  tablet: 720,
  desktop: 960,
  largeDesktop: 1200,
} as const;

/**
 * Responsive padding values
 */
export const CONTAINER_PADDING = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
  largeDesktop: 48,
} as const;

/**
 * Grid columns for each breakpoint
 */
export const GRID_COLUMNS = {
  mobile: 4,
  tablet: 8,
  desktop: 12,
  largeDesktop: 12,
} as const;

/**
 * Grid gutter (gap) for each breakpoint
 */
export const GRID_GUTTER = {
  mobile: 6,
  tablet: 20,
  desktop: 24,
  largeDesktop: 32,
} as const;
