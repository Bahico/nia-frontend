# Responsive Design Rules

**All code in this project MUST be responsive across mobile, tablet, and desktop/web.**

## Breakpoints

| Device       | Width Range     | Breakpoint Value |
|--------------|-----------------|------------------|
| Mobile       | 0 - 767px       | `0`              |
| Tablet       | 768px - 1023px  | `768`            |
| Desktop      | 1024px - 1439px | `1024`           |
| Large Desktop| 1440px+         | `1440`           |

## Required Imports

```typescript
// For responsive values in components
import { useResponsive, useResponsiveValue } from '@/hooks/use-responsive';

// For static breakpoint checks
import { BREAKPOINTS, isMobile, isTablet, isDesktop } from '@/constants/breakpoints';
```

## Rules

### 1. Never Use Fixed Widths for Containers
```typescript
// ❌ BAD
const styles = StyleSheet.create({
  container: { width: 400 }
});

// ✅ GOOD
const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 400 }
});
```

### 2. Always Use Responsive Values for Layout
```typescript
// ❌ BAD
<View style={{ padding: 32 }}>

// ✅ GOOD
const { isMobile, isTablet } = useResponsive();
const padding = isMobile ? 16 : isTablet ? 24 : 32;
<View style={{ padding }}>

// ✅ BETTER - Use hook
const padding = useResponsiveValue({ mobile: 16, tablet: 24, desktop: 32 });
```

### 3. Use Responsive Font Sizes
```typescript
// ❌ BAD
<Text style={{ fontSize: 24 }}>Title</Text>

// ✅ GOOD
import { useResponsiveFontSize } from '@/hooks/use-responsive';
const fontSize = useResponsiveFontSize('xl');
<Text style={{ fontSize }}>Title</Text>

// ✅ BETTER - Use ResponsiveText component
import { ResponsiveText } from '@/components/responsive-text';
<ResponsiveText size="xl">Title</ResponsiveText>
```

### 4. Use Flex Layout for Responsive Grids
```typescript
// ❌ BAD - Fixed columns
<View style={{ flexDirection: 'row' }}>
  <View style={{ width: '33%' }} />
  <View style={{ width: '33%' }} />
  <View style={{ width: '33%' }} />
</View>

// ✅ GOOD - Responsive columns
import { ResponsiveGrid, GridItem } from '@/components/responsive-grid';
<ResponsiveGrid mobileColumns={1} tabletColumns={2} desktopColumns={3}>
  <GridItem><Card /></GridItem>
  <GridItem><Card /></GridItem>
  <GridItem><Card /></GridItem>
</ResponsiveGrid>
```

### 5. Use ResponsiveContainer for Page Content
```typescript
// ❌ BAD
<View style={{ paddingHorizontal: 16 }}>
  {/* Content */}
</View>

// ✅ GOOD
import { ResponsiveContainer } from '@/components/responsive-container';
<ResponsiveContainer>
  {/* Content automatically gets responsive padding and max-width */}
</ResponsiveContainer>
```

### 6. Handle Touch Targets for Different Devices
```typescript
// Minimum touch targets:
// - Mobile: 44x44 points (Apple HIG)
// - Tablet: 44x44 points
// - Desktop: Can be smaller, but provide hover states

const { isMobile, isTablet } = useResponsive();
const buttonHeight = isMobile || isTablet ? 44 : 36;
```

### 7. Adjust Layout Direction Based on Screen
```typescript
const { isMobile } = useResponsive();

<View style={{
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? 16 : 24,
}}>
  <Sidebar />
  <Content />
</View>
```

### 8. Images Must Be Responsive
```typescript
// ❌ BAD
<Image source={src} style={{ width: 300, height: 200 }} />

// ✅ GOOD
<Image
  source={src}
  style={{ width: '100%', aspectRatio: 16/9 }}
  resizeMode="cover"
/>
```

### 9. Hide/Show Elements Based on Breakpoint
```typescript
const { isMobile, isDesktop } = useResponsive();

return (
  <>
    {isMobile && <MobileNav />}
    {isDesktop && <DesktopNav />}
  </>
);
```

### 10. Use Percentage-Based Spacing Where Appropriate
```typescript
// For responsive margins/gaps that scale with viewport
<View style={{ marginHorizontal: '5%' }} />
```

## Font Size Scale

| Key     | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| xs      | 10     | 11     | 12      |
| sm      | 12     | 13     | 14      |
| md      | 14     | 15     | 16      |
| lg      | 16     | 18     | 20      |
| xl      | 20     | 22     | 24      |
| xxl     | 24     | 28     | 32      |
| heading | 28     | 32     | 40      |
| title   | 32     | 40     | 48      |

## Spacing Scale

Use consistent spacing values:

| Key | Value |
|-----|-------|
| xs  | 4     |
| sm  | 8     |
| md  | 16    |
| lg  | 24    |
| xl  | 32    |
| xxl | 48    |

## Container Padding by Breakpoint

| Breakpoint    | Padding |
|---------------|---------|
| Mobile        | 16px    |
| Tablet        | 24px    |
| Desktop       | 32px    |
| Large Desktop | 48px    |

## Container Max Width by Breakpoint

| Breakpoint    | Max Width |
|---------------|-----------|
| Mobile        | 100%      |
| Tablet        | 720px     |
| Desktop       | 960px     |
| Large Desktop | 1200px    |

## Testing Requirements

Before submitting code, test on:

1. **Mobile**: iPhone SE (375px) and iPhone Pro Max (430px)
2. **Tablet**: iPad (768px) and iPad Pro (1024px)
3. **Desktop**: 1280px and 1920px widths

## Quick Reference

```typescript
// Check current breakpoint
const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();

// Get responsive value with fallback
const value = useResponsiveValue({
  mobile: 'small',
  tablet: 'medium',
  desktop: 'large'
});

// Get responsive font size
const fontSize = useResponsiveFontSize('lg');

// Get container values
const padding = useContainerPadding();
const maxWidth = useContainerMaxWidth();

// Get grid values
const columns = useGridColumns();
const gutter = useGridGutter();

// Scale utilities
import { scaleWidth, scaleHeight, moderateScale } from '@/hooks/use-responsive';
const scaled = moderateScale(16); // Moderate scaling for fonts
```