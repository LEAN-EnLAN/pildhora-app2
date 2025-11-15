/**
 * Design System Tokens
 * 
 * Centralized design tokens for consistent styling across the application.
 * Includes color palette, spacing, typography, border radius, and shadow definitions.
 */

/**
 * Color Palette
 * Provides primary, semantic, neutral, and surface colors
 */
export const colors = {
  // Primary palette
  primary: {
    50: '#E6F0FF',
    100: '#CCE1FF',
    500: '#007AFF',  // Main primary
    600: '#0066CC',
    700: '#0052A3',
  },
  
  // Semantic colors
  success: '#34C759',
  warning: {
    50: '#FFF7ED',
    200: '#FED7AA',
    500: '#FF9500',
  },
  error: {
    50: '#FEF2F2',
    500: '#FF3B30',
  },
  info: '#5856D6',
  
  // Neutral palette
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Surface colors
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
};

/**
 * Spacing Scale
 * Consistent spacing values for margins, padding, and gaps
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

/**
 * Typography System
 * Font sizes, weights, and line heights
 */
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Border Radius Scale
 * Consistent border radius values for rounded corners
 */
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

/**
 * Shadow Definitions
 * Elevation shadows for cards and elevated surfaces
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Type Definitions
 */
export type ColorPalette = typeof colors;
export type SpacingScale = typeof spacing;
export type TypographySystem = typeof typography;
export type BorderRadiusScale = typeof borderRadius;
export type ShadowDefinitions = typeof shadows;
