import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CommutePreset, TransferInterchange } from '../types/routes';
import { routeManager } from '../services/routeManager';
import { subscriptionService } from '../services/subscriptionService';

interface RouteFlipBarProps {
  onRouteSelected: (preset: CommutePreset) => void;
  onOpenPrime?: () => void;
}

export const RouteFlipBar: React.FC<RouteFlipBarProps> = ({ onRouteSelected, onOpenPrime }) => {
  const activePreset = routeManager.getActivePreset();

  if (!activePreset) return null;

  const transferEnabled = !!activePreset.transfer;

  const handleFlip = () => {
    const flipped = routeManager.flipCurrentRoute();
    onRouteSelected(flipped);
  };

  const handleToggleTransfer = () => {
    const isPrime = subscriptionService.isAdFree();
    if (!isPrime && !transferEnabled) {
      if (onOpenPrime) {
        onOpenPrime();
      }
      return;
    }

    if (transferEnabled) {
      const updated = routeManager.setTransferInterchange(activePreset.id, undefined);
      if (updated) onRouteSelected(updated);
    } else {
      const defaultTransfer: TransferInterchange = {
        name: activePreset.direction === 'OUTBOUND' ? 'Central Interchange' : 'City Junction',
        coords: {
          latitude: (activePreset.originCoords.latitude + activePreset.destinationCoords.latitude) / 2,
          longitude: (activePreset.originCoords.longitude + activePreset.destinationCoords.longitude) / 2,
        },
        wakeRadiusKm: 2.0,
      };
      const updated = routeManager.setTransferInterchange(activePreset.id, defaultTransfer);
      if (updated) onRouteSelected(updated);
    }
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

      {/* Sequential Route Display */}
      <View style={styles.stopsRow}>
        <View style={styles.stopCol}>
          <Text style={styles.stopLabel}>Origin</Text>
          <Text style={styles.stopName} numberOfLines={1}>
            {activePreset.originName}
          </Text>
        </View>

        {activePreset.transfer && (
          <>
            <View style={styles.arrowCol}>
              <Text style={styles.arrowGlyph}>→</Text>
            </View>
            <View style={styles.stopCol}>
              <View style={styles.transferLabelRow}>
                <Text style={styles.stopLabel}>Transfer hub</Text>
                <View style={styles.transferPrimeTag}>
                  <Text style={styles.transferPrimeTagText}>2 km</Text>
                </View>
              </View>
              <Text style={styles.transferStopName} numberOfLines={1}>
                {activePreset.transfer.name}
              </Text>
            </View>
          </>
        )}

        <View style={styles.arrowCol}>
          <Text style={styles.arrowGlyph}>→</Text>
        </View>

        <View style={styles.stopCol}>
          <Text style={styles.stopLabel}>Final stop</Text>
          <Text style={styles.stopNameTarget} numberOfLines={1}>
            {activePreset.destinationName}
          </Text>
        </View>
      </View>

      {/* Multi-Leg Transfer Station Toggle */}
      <View style={styles.transferToggleRow}>
        <TouchableOpacity
          style={[styles.transferBtn, activePreset.transfer && styles.transferBtnActive]}
          onPress={handleToggleTransfer}
          accessibilityRole="button"
          accessibilityLabel="Toggle intermediate interchange transfer alarm"
        >
          <View style={[styles.transferDot, activePreset.transfer && styles.transferDotActive]} />
          <Text style={[styles.transferBtnText, activePreset.transfer && styles.transferBtnTextActive]}>
            {activePreset.transfer
              ? `Interchange alarm: ${activePreset.transfer.name} (2.0 km)`
              : 'Add transfer interchange stop (Prime)'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  stopCol: {
    flex: 1,
  },
  arrowCol: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlyph: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  stopLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '500',
    marginBottom: 1,
  },
  transferLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transferPrimeTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  transferPrimeTagText: {
    color: '#B45309',
    fontSize: 8.5,
    fontWeight: '700',
  },
  stopName: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '500',
  },
  transferStopName: {
    color: '#B45309',
    fontSize: 11.5,
    fontWeight: '600',
  },
  stopNameTarget: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '600',
  },
  transferToggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transferBtnActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  transferDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  transferDotActive: {
    backgroundColor: '#F59E0B',
  },
  transferBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  transferBtnTextActive: {
    color: '#92400E',
    fontWeight: '600',
  },
});
