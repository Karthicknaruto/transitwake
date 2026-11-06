import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CommutePreset } from '../types/routes';
import { routeManager } from '../services/routeManager';

interface RouteFlipBarProps {
  onRouteSelected: (preset: CommutePreset) => void;
}

export const RouteFlipBar: React.FC<RouteFlipBarProps> = ({ onRouteSelected }) => {
  const activePreset = routeManager.getActivePreset();

  if (!activePreset) return null;

  const handleFlip = () => {
    const flipped = routeManager.flipCurrentRoute();
    onRouteSelected(flipped);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={styles.presetBadge}>
            <Text style={styles.presetBadgeText}>{activePreset.name}</Text>
          </View>
          <Text style={styles.directionText}>
            {activePreset.direction === 'OUTBOUND' ? 'Outbound commute' : 'Return commute'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.flipButton}
          onPress={handleFlip}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Swap origin and destination commute stops"
        >
          <Text style={styles.flipIcon}>⇄</Text>
          <Text style={styles.flipButtonText}>Reverse</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stopsRow}>
        <View style={styles.stopCol}>
          <Text style={styles.stopLabel}>From</Text>
          <Text style={styles.stopName} numberOfLines={1}>
            {activePreset.originName}
          </Text>
        </View>

        <View style={styles.arrowCol}>
          <Text style={styles.arrowGlyph}>→</Text>
        </View>

        <View style={styles.stopCol}>
          <Text style={styles.stopLabel}>To (Alarm target)</Text>
          <Text style={styles.stopNameTarget} numberOfLines={1}>
            {activePreset.destinationName}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetBadgeText: {
    color: '#0F172A',
    fontSize: 10.5,
    fontWeight: '600',
  },
  directionText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  flipIcon: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  flipButtonText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
  },
  stopsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stopCol: {
    flex: 1,
  },
  arrowCol: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlyph: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  stopLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '500',
    marginBottom: 1,
  },
  stopName: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  stopNameTarget: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
});
