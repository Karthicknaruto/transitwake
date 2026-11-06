import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PowerTierLevel } from '../types/power';
import { powerManager } from '../services/powerManager';

interface PowerSaverIndicatorProps {
  currentTier: PowerTierLevel;
  savingsPercentage: number;
  onToggleOverride: () => void;
  manualOverride: boolean;
}

export const PowerSaverIndicator: React.FC<PowerSaverIndicatorProps> = ({
  currentTier,
  savingsPercentage,
  onToggleOverride,
  manualOverride,
}) => {
  const getTierLabel = () => {
    if (manualOverride) return 'Continuous 1s (Forced)';
    switch (currentTier) {
      case 'CRUISING':
        return 'Cruising tier (30s poll)';
      case 'APPROACHING':
        return 'Approaching tier (10s poll)';
      case 'ARRIVAL':
      default:
        return 'Arrival tier (1s poll)';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.indicatorDot} />
        <View>
          <Text style={styles.tierTitle}>{getTierLabel()}</Text>
          <Text style={styles.savingsSub}>
            {manualOverride
              ? 'Maximum precision GPS'
              : savingsPercentage > 0
              ? `Dynamic throttle • ~${savingsPercentage}% battery saved`
              : 'Active high-precision geofence'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.toggleBtn, manualOverride && styles.toggleBtnActive]}
        onPress={onToggleOverride}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Toggle GPS battery saver mode"
      >
        <Text style={[styles.toggleBtnText, manualOverride && styles.toggleBtnTextActive]}>
          {manualOverride ? 'High precision' : 'Smart power'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803D',
    marginRight: 8,
  },
  tierTitle: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
  },
  savingsSub: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 1,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  toggleBtnText: {
    color: '#475569',
    fontSize: 10.5,
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
});
