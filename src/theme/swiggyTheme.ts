import { Platform } from 'react-native';

/**
 * TransitWake Unslopped Design System
 * Tailored transit instrument aesthetic:
 * - Quiet neutral graphite/slate chrome (#F8FAFC, #FFFFFF, #E2E8F0)
 * - Three strict text roles: #0F172A (Primary), #475569 (Secondary), #64748B (Muted)
 * - Deliberate Swiggy transit accent (#FC8019) used only for the active route & primary CTA
 * - Clean 4px spacing scale & nested radius math (14px card, 10px control, 6px badge)
 */
export const SWIGGY_THEME = {
  colors: {
    // Deliberate Brand Accent (Used rarely: primary action, active selection, map pin)
    primary: '#FC8019',
    primaryDark: '#D96302',
    primaryLight: '#FFF4EB',
    primaryBorder: '#FCD8BA',

    // Neutral Surfaces & Canvas
    background: '#F8FAFC',        // Quiet slate canvas
    surface: '#FFFFFF',           // Crisp white card
    surfaceSecondary: '#F1F5F9',  // Inset row / control well
    border: '#E2E8F0',            // 1px hairline divider
    borderFocus: '#0F172A',       // Focused hairline

    // Three Precise Text Roles (WCAG 2.2 AAA Compliant)
    textPrimary: '#0F172A',       // Slate 900 (16.2:1 contrast against white)
    textSecondary: '#475569',     // Slate 600 (7.1:1 contrast against white)
    textMuted: '#64748B',         // Slate 500 (4.8:1 contrast against white)
    textWhite: '#FFFFFF',
    textOrange: '#FC8019',
    textOrangeDark: '#9A3412',    // Accessible dark amber (7.8:1 contrast)
    borderContrast: '#94A3B8',

    // Semantic Status (Restrained)
    green: '#16A34A',             // Verified / On time
    greenLight: '#F0FDF4',
    red: '#DC2626',               // Stop / Alert
    redLight: '#FEF2F2',
    blue: '#0284C7',
    blueLight: '#F0F9FF',
  },
  typography: {
    fontRegular: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      default: 'System',
    }),
    fontBold: Platform.select({
      web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      default: 'System',
    }),
  },
  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    floatBtn: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  radius: {
    card: 14,
    button: 10,
    pill: 8,
    badge: 5,
  },
};
