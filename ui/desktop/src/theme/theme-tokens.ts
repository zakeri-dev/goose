/**
 * Theme tokens — the single source of truth for all MCP semantic token values.
 *
 * Every key in McpUiStyleVariableKey must be present in both lightTokens and
 * darkTokens. The TypeScript compiler enforces this: if the SDK adds a new key,
 * the build breaks until both maps are updated.
 *
 * Values are applied to :root via style.setProperty() before first paint
 * (see renderer.tsx). main.css only registers the variable names for Tailwind
 * class generation — it does NOT define values.
 *
 * These tokens serve two purposes:
 *  1. Goose desktop — applied to :root per resolved theme.
 *  2. MCP apps — encoded as light-dark() in hostContext.styles.variables.
 */
import type {
  McpUiHostStyles,
  McpUiStyleVariableKey,
  McpUiStyles,
} from '@modelcontextprotocol/ext-apps/app-bridge';

type ThemeTokens = Record<McpUiStyleVariableKey, string>;

// Subset of keys that are the same across both themes.
type BaseTokenKey = Extract<
  McpUiStyleVariableKey,
  `--font-${string}` | `--border-radius-${string}` | `--border-width-${string}`
>;

type ColorTokenKey = Exclude<McpUiStyleVariableKey, BaseTokenKey>;

// ---------------------------------------------------------------------------
// Base tokens — shared across light and dark themes
// ---------------------------------------------------------------------------
const baseTokens: Pick<ThemeTokens, BaseTokenKey> = {
  // Typography — families
  '--font-sans': "'Vazirmatn Variable', 'Cash Sans', sans-serif",
  '--font-mono': 'monospace',

  // Typography — weights
  '--font-weight-normal': '400',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--font-weight-bold': '700',

  // Typography — text sizes
  '--font-text-xs-size': '0.75rem',
  '--font-text-sm-size': '0.875rem',
  '--font-text-md-size': '1rem',
  '--font-text-lg-size': '1.125rem',

  // Typography — heading sizes
  '--font-heading-xs-size': '1rem',
  '--font-heading-sm-size': '1.125rem',
  '--font-heading-md-size': '1.25rem',
  '--font-heading-lg-size': '1.5rem',
  '--font-heading-xl-size': '1.875rem',
  '--font-heading-2xl-size': '2.25rem',
  '--font-heading-3xl-size': '3rem',

  // Typography — text line heights
  '--font-text-xs-line-height': '1rem',
  '--font-text-sm-line-height': '1.25rem',
  '--font-text-md-line-height': '1.5rem',
  '--font-text-lg-line-height': '1.75rem',

  // Typography — heading line heights
  '--font-heading-xs-line-height': '1.5rem',
  '--font-heading-sm-line-height': '1.75rem',
  '--font-heading-md-line-height': '1.75rem',
  '--font-heading-lg-line-height': '2rem',
  '--font-heading-xl-line-height': '2.25rem',
  '--font-heading-2xl-line-height': '2.5rem',
  '--font-heading-3xl-line-height': '3.5rem',

  // Border radius (softened for a premium SOHA feel)
  '--border-radius-xs': '3px',
  '--border-radius-sm': '6px',
  '--border-radius-md': '10px',
  '--border-radius-lg': '14px',
  '--border-radius-xl': '20px',
  '--border-radius-full': '9999px',

  // Border width
  '--border-width-regular': '1px',
};

// Theme-specific color/shadow tokens only.
type ColorTokens = Pick<ThemeTokens, ColorTokenKey>;

// ---------------------------------------------------------------------------
// Light theme — colors & shadows
// ---------------------------------------------------------------------------
const lightColorTokens: ColorTokens = {
  // Backgrounds — clean white with a cool, blue-tinted neutral
  '--color-background-primary': '#ffffff',
  '--color-background-secondary': '#f3f6fc',
  '--color-background-tertiary': '#e6ecf8',
  '--color-background-inverse': '#14213d', // deep royal navy (primary buttons, user bubble)
  '--color-background-ghost': 'transparent',
  '--color-background-info': '#2563eb', // royal blue accent
  '--color-background-danger': '#ef4444',
  '--color-background-success': '#16a34a',
  '--color-background-warning': '#d99a2b', // SOHA gold
  '--color-background-disabled': '#e6ecf8',

  // Text
  '--color-text-primary': '#16213a', // deep navy ink
  '--color-text-secondary': '#5b6b88',
  '--color-text-tertiary': '#97a4bd',
  '--color-text-inverse': '#ffffff',
  '--color-text-ghost': '#5b6b88',
  '--color-text-info': '#2563eb',
  '--color-text-danger': '#dc2626',
  '--color-text-success': '#16a34a',
  '--color-text-warning': '#b07d18', // gold (readable on light)
  '--color-text-disabled': '#aab4c8',

  // Borders
  '--color-border-primary': '#e6ecf8',
  '--color-border-secondary': '#dde5f3',
  '--color-border-tertiary': '#cdd8ec',
  '--color-border-inverse': '#14213d',
  '--color-border-ghost': 'transparent',
  '--color-border-info': '#2563eb',
  '--color-border-danger': '#ef4444',
  '--color-border-success': '#16a34a',
  '--color-border-warning': '#d99a2b',
  '--color-border-disabled': '#e6ecf8',

  // Rings
  '--color-ring-primary': '#cdd8ec',
  '--color-ring-secondary': '#cdd8ec',
  '--color-ring-inverse': '#ffffff',
  '--color-ring-info': '#2563eb',
  '--color-ring-danger': '#ef4444',
  '--color-ring-success': '#16a34a',
  '--color-ring-warning': '#d99a2b',

  // Shadows — soft, cool-tinted depth
  '--shadow-hairline': '0 0 0 1px rgba(20, 33, 61, 0.06)',
  '--shadow-sm': '0 1px 2px 0 rgba(20, 33, 61, 0.08)',
  '--shadow-md': '0 4px 12px -2px rgba(20, 33, 61, 0.12), 0 2px 4px -2px rgba(20, 33, 61, 0.08)',
  '--shadow-lg': '0 12px 28px -6px rgba(20, 33, 61, 0.18), 0 4px 8px -4px rgba(20, 33, 61, 0.1)',
};

// ---------------------------------------------------------------------------
// Dark theme — colors & shadows
// ---------------------------------------------------------------------------
const darkColorTokens: ColorTokens = {
  // Backgrounds — deep royal navy
  '--color-background-primary': '#0e1626',
  '--color-background-secondary': '#16213a',
  '--color-background-tertiary': '#1f2c49',
  '--color-background-inverse': '#eef2fb',
  '--color-background-ghost': 'transparent',
  '--color-background-info': '#4f80ff', // bright royal blue
  '--color-background-danger': '#ff6b6b',
  '--color-background-success': '#7fd07a',
  '--color-background-warning': '#f0b429', // SOHA gold
  '--color-background-disabled': '#1f2c49',

  // Text
  '--color-text-primary': '#eef2fb',
  '--color-text-secondary': '#9fb0cc',
  '--color-text-tertiary': '#6b7d9e',
  '--color-text-inverse': '#0e1626',
  '--color-text-ghost': '#9fb0cc',
  '--color-text-info': '#6f9bff',
  '--color-text-danger': '#ff6b6b',
  '--color-text-success': '#8fd98a',
  '--color-text-warning': '#f0b429', // gold
  '--color-text-disabled': '#4a5a78',

  // Borders
  '--color-border-primary': '#243352',
  '--color-border-secondary': '#2e3f63',
  '--color-border-tertiary': '#1f2c49',
  '--color-border-inverse': '#eef2fb',
  '--color-border-ghost': 'transparent',
  '--color-border-info': '#4f80ff',
  '--color-border-danger': '#ff6b6b',
  '--color-border-success': '#7fd07a',
  '--color-border-warning': '#f0b429',
  '--color-border-disabled': '#243352',

  // Rings
  '--color-ring-primary': '#2e3f63',
  '--color-ring-secondary': '#1f2c49',
  '--color-ring-inverse': '#0e1626',
  '--color-ring-info': '#4f80ff',
  '--color-ring-danger': '#ff6b6b',
  '--color-ring-success': '#7fd07a',
  '--color-ring-warning': '#f0b429',

  // Shadows (deep for dark navy)
  '--shadow-hairline': '0 0 0 1px rgba(0, 0, 0, 0.4)',
  '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
  '--shadow-md': '0 4px 14px -2px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  '--shadow-lg': '0 14px 32px -6px rgba(0, 0, 0, 0.6), 0 4px 8px -4px rgba(0, 0, 0, 0.45)',
};

// ---------------------------------------------------------------------------
// Merged token maps — used by applyThemeTokens() and buildMcpHostStyles()
// ---------------------------------------------------------------------------
export const lightTokens: ThemeTokens = { ...baseTokens, ...lightColorTokens };
export const darkTokens: ThemeTokens = { ...baseTokens, ...darkColorTokens };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// @font-face rules passed to MCP apps so sandboxed iframes can load host fonts.
const HOST_FONT_CSS = `
@font-face {
  font-family: 'Cash Sans';
  src: url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff2/CashSans-Light.woff2) format('woff2'),
       url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff/CashSans-Light.woff) format('woff');
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: 'Cash Sans';
  src: url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff2/CashSans-Regular.woff2) format('woff2'),
       url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff/CashSans-Regular.woff) format('woff');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Cash Sans';
  src: url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff2/CashSans-Medium.woff2) format('woff2'),
       url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff/CashSans-Medium.woff) format('woff');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'Cash Sans';
  src: url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff2/CashSans-Bold.woff2) format('woff2'),
       url(https://cash-f.squarecdn.com/static/fonts/cashsans/woff/CashSans-Bold.woff) format('woff');
  font-weight: 700;
  font-style: normal;
}
`.trim();

/**
 * Build the McpUiHostStyles object for MCP apps.
 * Color keys use light-dark() so a single payload works for both themes.
 * Non-color keys (fonts, radii, shadows) use plain values from baseTokens
 * (or light as the default when values differ, e.g. shadows).
 * css.fonts provides @font-face rules so sandboxed apps can load host fonts.
 */
export function buildMcpHostStyles(): McpUiHostStyles {
  const variables: McpUiStyles = {} as McpUiStyles;
  for (const key of Object.keys(lightTokens) as McpUiStyleVariableKey[]) {
    const light = lightTokens[key];
    const dark = darkTokens[key];
    if (key.startsWith('--color-')) {
      variables[key] = `light-dark(${light}, ${dark})`;
    } else {
      variables[key] = light;
    }
  }
  return { variables, css: { fonts: HOST_FONT_CSS } };
}

/**
 * Resolve the current theme from localStorage / system preference.
 */
export function getResolvedTheme(): 'light' | 'dark' {
  const useSystem = localStorage.getItem('use_system_theme') !== 'false';
  if (useSystem) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Apply theme tokens to the document root as CSS custom properties.
 * When called without an argument, resolves the theme from localStorage.
 */
export function applyThemeTokens(theme?: 'light' | 'dark'): void {
  const resolved = theme ?? getResolvedTheme();
  const tokens = resolved === 'dark' ? darkTokens : lightTokens;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
}
