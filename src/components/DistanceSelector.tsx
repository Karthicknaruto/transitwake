import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SWIGGY_THEME } from '../theme/swiggyTheme';

interface DistanceSelectorProps {
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
}

export const DistanceSelector: React.FC<DistanceSelectorProps> = ({
  radiusKm,
  onRadiusChange,
}) => {
  const PRESET_DISTANCES = [
    { value: 2.0, label: '2.0 km', badge: 'Metro' },
    { value: 3.0, label: '3.0 km', badge: 'Bus' },
    { value: 4.0, label: '4.0 km', badge: 'Recommended' },
    { value: 5.0, label: '5.0 km', badge: 'Express' },
    { value: 8.0, label: '8.0 km', badge: 'Regional' },
  ];

  return (
    <View
      style={styles.card}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel="Alarm distance radius selector"
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.categoryLabel}>Alert distance</Text>
          <Text style={styles.mainTitle}>Wake-up radius</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceBadgeValue}>{radiusKm.toFixed(1)} km</Text>
          <Text style={styles.distanceBadgeSub}>radius</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Alarm triggers when your vehicle enters within{' '}
        <Text style={styles.boldKm}>{radiusKm.toFixed(1)} km</Text> of your destination stop.
      </Text>

      {/* Preset Radius Options */}
      <View style={styles.optionsContainer}>
        {PRESET_DISTANCES.map((preset) => {
          const isSelected = Math.abs(radiusKm - preset.value) < 0.1;
          return (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.presetPill,
                isSelected ? styles.presetPillSelected : styles.presetPillUnselected,
              ]}
              onPress={() => onRadiusChange(preset.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={`${preset.value} kilometers ${preset.badge}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                ]}
              >
                {preset.label}
              </Text>
              <Text
                style={[
                  styles.pillBadge,
                  isSelected ? styles.pillBadgeSelected : styles.pillBadgeUnselected,
                ]}
              >
                {preset.badge}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Buffer Guidance */}
      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          <Text style={styles.tipHighlight}>4.0 km</Text> provides ~5–8 minutes buffer on suburban trains and express routes.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SWIGGY_THEME.colors.surface,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
    ...SWIGGY_THEME.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleColumn: {
    flex: 1,
  },
  categoryLabel: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  mainTitle: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  distanceBadge: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
  },
  distanceBadgeValue: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  distanceBadgeSub: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 9.5,
    fontWeight: '500',
  },
  subtitle: {
    color: SWIGGY_THEME.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  boldKm: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetPill: {
    flex: 1,
    minWidth: '28%',
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  presetPillSelected: {
    backgroundColor: SWIGGY_THEME.colors.primaryLight,
    borderColor: SWIGGY_THEME.colors.primary,
  },
  presetPillUnselected: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    borderColor: SWIGGY_THEME.colors.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
    fontVariant: ['tabular-nums'],
  },
  pillTextSelected: {
    color: SWIGGY_THEME.colors.primaryDark,
  },
  pillTextUnselected: {
    color: SWIGGY_THEME.colors.textPrimary,
  },
  pillBadge: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  pillBadgeSelected: {
    color: SWIGGY_THEME.colors.primaryDark,
  },
  pillBadgeUnselected: {
    color: SWIGGY_THEME.colors.textMuted,
  },
  tipCard: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
  },
  tipText: {
    color: SWIGGY_THEME.colors.textSecondary,
    fontSize: 11.5,
    lineHeight: 16,
  },
  tipHighlight: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontWeight: '600',
  },
});
