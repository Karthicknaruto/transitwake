import { Platform } from 'react-native';

/**
 * Cockpit Instrument Design System
 * Inspired by aerospace avionics, modern railway locomotive consoles, and tactical HUDs.
 */
export const COCKPIT_THEME = {
  colors: {
    // Canvas & Panels
    background: '#050811',         // Deep Cockpit Obsidian
    panel: '#0B1324',              // Avionics Sub-Panel
    panelBorder: '#1E2D4A',        // Precision Instrument Bezel
    panelBorderActive: '#F59E0B',  // Master Armed Gold
    surfaceDark: '#03060C',        // Recessed Well / Inset

    // HUD Luminous Indicators
    amber: '#F59E0B',              // Master Arm / Radar Amber
    amberLight: '#FDE68A',         // High-Contrast Amber Text
    amberMuted: 'rgba(245, 158, 11, 0.15)',
    emerald: '#10B981',            // GPS Lock / Systems Green
    emeraldLight: '#6EE7B7',       // Active Status Text
    emeraldMuted: 'rgba(16, 185, 129, 0.15)',
    cyan: '#06B6D4',               // Velocity / Nav Vector Cyan
    cyanLight: '#A5F3FC',
    red: '#EF4444',                // Master Caution / 4 km Alarm
    redDark: '#7F1D1D',

    // Typography
    textPrimary: '#FFFFFF',        // Ultra-High Contrast Headings (19.8:1)
    textSecondary: '#E2E8F0',      // Standard Readout Text (15.2:1)
    textMuted: '#94A3B8',          // Technical Telemetry Subtext (7.6:1)
    textAmber: '#FBBF24',          // Primary Metric Highlight
  },
  typography: {
    fontMono: Platform.select({
      web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      default: 'monospace',
    }),
  },
  borders: {
    radius: 12,
    width: 1,
  },
};
