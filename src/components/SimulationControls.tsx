import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SWIGGY_THEME } from '../theme/swiggyTheme';

interface SimulationControlsProps {
  isSimulating: boolean;
  distanceKm: number | null;
  onStartSimulation: () => void;
  onInstantTrigger: () => void;
  onStopSimulation: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulating,
  distanceKm,
  onStartSimulation,
  onInstantTrigger,
  onStopSimulation,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.subHeader}>Test environment</Text>
          <Text style={styles.title}>Commute simulation</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            isSimulating ? styles.badgeActive : styles.badgeIdle,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isSimulating ? styles.badgeTextActive : styles.badgeTextIdle,
            ]}
          >
            {isSimulating ? 'Active' : 'Idle'}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        Simulates vehicle movement toward the destination stop to verify alarm geofencing and audio alerts.
      </Text>

      <View style={styles.buttonRow}>
        {!isSimulating ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={onStartSimulation}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Start 8.5 kilometer commute simulation"
              accessibilityHint="Simulates approaching the destination stop from 8.5 km away"
            >
              <Text style={styles.btnPrimaryText}>Simulate approach (8.5 km)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onInstantTrigger}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Jump to 3.8 km to test alarm immediately"
              accessibilityHint="Places virtual commuter inside the 4 km threshold"
            >
              <Text style={styles.btnSecondaryText}>Jump to 3.8 km</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.btnStop]}
            onPress={onStopSimulation}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Stop commute simulation"
            accessibilityHint="Halts simulated vehicle and resets tracking"
          >
            <Text style={styles.btnStopText}>Stop simulation</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SWIGGY_THEME.colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
    marginVertical: 8,
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
  subHeader: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  badgeIdle: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    borderColor: SWIGGY_THEME.colors.border,
  },
  badgeActive: {
    backgroundColor: SWIGGY_THEME.colors.greenLight,
    borderColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  badgeTextIdle: {
    color: SWIGGY_THEME.colors.textMuted,
  },
  badgeTextActive: {
    color: SWIGGY_THEME.colors.green,
  },
  description: {
    color: SWIGGY_THEME.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
  },
  btnPrimaryText: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: SWIGGY_THEME.colors.primaryLight,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.primaryBorder,
  },
  btnSecondaryText: {
    color: SWIGGY_THEME.colors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  btnStop: {
    backgroundColor: SWIGGY_THEME.colors.redLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnStopText: {
    color: SWIGGY_THEME.colors.red,
    fontSize: 12.5,
    fontWeight: '600',
  },
});
