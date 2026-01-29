# Project Rules

This is an Expo + React Native project targeting iOS, Android, and Web platforms.

## Critical Rules

### All Code Must Be Responsive

**Every component and screen MUST work on mobile, tablet, and desktop.**

See `RESPONSIVE_RULES.md` for detailed guidelines.

### Breakpoints

- **Mobile**: 0 - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Required Practices

1. Use `useResponsive()` hook to get current breakpoint info
2. Use `useResponsiveValue()` for values that change per breakpoint
3. Use `ResponsiveContainer` for page-level content
4. Use `ResponsiveText` for text with auto-scaling fonts
5. Use `ResponsiveGrid` for multi-column layouts
6. Never use fixed widths on containers - use `maxWidth` instead
7. Always test on mobile, tablet, and desktop before committing

### File Structure

```
constants/
  breakpoints.ts     # Breakpoint values, spacing, font sizes
  theme.ts           # Theme colors

hooks/
  use-responsive.ts  # Responsive hooks
  use-theme-color.ts # Theme color hook
  use-color-scheme.ts # System color scheme

components/
  responsive-container.tsx  # Auto-padding/max-width container
  responsive-grid.tsx       # Responsive column grid
  responsive-text.tsx       # Auto-scaling text
```

### Import Aliases

Use `@/` prefix for imports:
```typescript
import { useResponsive } from '@/hooks/use-responsive';
import { BREAKPOINTS } from '@/constants/breakpoints';
```

### Styling

- Use React Native `StyleSheet.create()` for styles
- Use theme colors via `useThemeColor()` hook
- Support both light and dark mode

### Platform-Specific Code

Use `Platform.select()` for platform-specific values:
```typescript
import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: 'Inter, sans-serif',
});
```