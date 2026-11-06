import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { alarmManager } from '../services/alarmManager';
import { adService } from '../services/adService';
import { formatDistance } from '../utils/geo';
import { SWIGGY_THEME } from '../theme/swiggyTheme';

interface AlarmTriggerModalProps {
  visible: boolean;
  destinationName: string;
  distanceKm: number;
  radiusKm: number;
  onDismiss: () => void;
  onSnooze: () => void;
}

export const AlarmTriggerModal: React.FC<AlarmTriggerModalProps> = ({
  visible,
  destinationName,
  distanceKm,
  radiusKm,
  onDismiss,
  onSnooze,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Start audio siren & haptic vibration once upon opening
      alarmManager.startAlarm(destinationName, distanceKm);

      // Continuous pulsing animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => {
        pulseLoop.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [visible]); // Decoupled from distanceKm so GPS movement ticks do not restart siren loop

  // Web Escape key listener for fast dismissal
  useEffect(() => {
    if (!visible) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleDismiss();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible]);

  const handleDismiss = () => {
    alarmManager.stopAlarm(false);
    onDismiss();

    // Safely trigger post-trip interstitial popup ad after user is safely awake
    setTimeout(() => {
      adService.triggerInterstitial();
    }, 600);
  };

  const handleSnooze = () => {
    alarmManager.stopAlarm(true);
    onSnooze();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      accessibilityViewIsModal={true}
    >
      <View
        style={styles.container}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`Destination alert for ${destinationName}. Within ${radiusKm.toFixed(1)} kilometers.`}
      >
        {/* Pulsing Beacon Ring */}
        <Animated.View
          style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}
          accessible={false}
          importantForAccessibility="no"
        >
          <View style={styles.beaconCore} />
        </Animated.View>

        <Text style={styles.urgentTitle}>Approaching destination</Text>
        <Text style={styles.urgentSubtitle}>
          Within {radiusKm.toFixed(1)} km of your stop
        </Text>

        {/* Info Card */}
        <View style={styles.stopCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.stopLabel}>Destination</Text>
            <View style={styles.nearBadge}>
              <Text style={styles.nearBadgeText}>Active alarm</Text>
            </View>
          </View>

          <Text style={styles.stopName} numberOfLines={2}>
            {destinationName}
          </Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{formatDistance(distanceKm)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Radius</Text>
              <Text style={styles.statValue}>{radiusKm.toFixed(1)} km</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={styles.statStatus}>Sounding</Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Dismiss destination alarm"
            accessibilityHint="Silences siren and stops vibration immediately"
          >
            <Text style={styles.dismissText}>Dismiss alarm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.snoozeButton}
            onPress={handleSnooze}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Snooze alarm for 1 minute"
          >
            <Text style={styles.snoozeText}>Snooze 1 minute</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Cockpit Deep Slate Night HUD
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  beaconCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
  },
  urgentTitle: {
    color: '#FEF08A',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 4,
  },
  urgentSubtitle: {
    color: '#94A3B8',
    fontSize: 13.5,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
  },
  stopCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  nearBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  nearBadgeText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '500',
  },
  stopName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statStatus: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  dismissButton: {
    backgroundColor: '#DC2626',
    minHeight: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  snoozeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  snoozeText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
  },
});
