import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { formatDistance } from '../utils/geo';

interface FloatingTransitHudProps {
  destinationName: string;
  distanceKm: number | null;
  speedKmh: number | null;
  etaMinutes: number | null;
  radiusKm: number;
  isAlarmTriggered: boolean;
  onDismissAlarm: () => void;
  onSnoozeAlarm: () => void;
  onCloseHud: () => void;
}

export const FloatingTransitHud: React.FC<FloatingTransitHudProps> = ({
  destinationName,
  distanceKm,
  speedKmh,
  etaMinutes,
  radiusKm,
  isAlarmTriggered,
  onDismissAlarm,
  onSnoozeAlarm,
  onCloseHud,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: 16, y: 80 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4;
      },
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.hudContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {!isExpanded ? (
        /* Collapsed Mini Pill */
        <TouchableOpacity
          style={[styles.pillCard, isAlarmTriggered && styles.pillAlarmActive]}
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Transit overlay: ${formatDistance(distanceKm)}. Tap to expand.`}
        >
          <View style={[styles.pulseDot, isAlarmTriggered && styles.pulseDotAlarm]} />
          <Text style={styles.pillDistanceText}>
            {formatDistance(distanceKm)}
          </Text>
          <View style={styles.pillDivider} />
          <Text style={styles.pillEtaText}>
            {etaMinutes !== null ? `${etaMinutes}m` : `${Math.round(speedKmh || 0)}km/h`}
          </Text>
        </TouchableOpacity>
      ) : (
        /* Expanded Instrument Card */
        <View style={styles.expandedCard}>
          <View style={styles.expandedHeader}>
            <View style={styles.titleRow}>
              <View style={[styles.pulseDot, isAlarmTriggered && styles.pulseDotAlarm]} />
              <Text style={styles.expandedTitle} numberOfLines={1}>
                {destinationName || 'Destination stop'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsExpanded(false)}
              style={styles.collapseBtn}
              accessibilityRole="button"
              accessibilityLabel="Collapse transit HUD"
            >
              <Text style={styles.collapseBtnText}>–</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>
                {formatDistance(distanceKm)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>ETA</Text>
              <Text style={styles.metricValue}>
                {etaMinutes !== null ? `~${etaMinutes} min` : 'Calculating'}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Wake radius</Text>
              <Text style={styles.metricValue}>{radiusKm.toFixed(1)} km</Text>
            </View>
          </View>

          {isAlarmTriggered && (
            <View style={styles.alarmActionRow}>
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={onDismissAlarm}
                accessibilityRole="button"
                accessibilityLabel="Dismiss wake-up alarm"
              >
                <Text style={styles.dismissBtnText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.snoozeBtn}
                onPress={onSnoozeAlarm}
                accessibilityRole="button"
                accessibilityLabel="Snooze wake-up alarm for 1 minute"
              >
                <Text style={styles.snoozeBtnText}>Snooze</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeOverlayBtn}
            onPress={onCloseHud}
            accessibilityRole="button"
            accessibilityLabel="Close overlay HUD"
          >
            <Text style={styles.closeOverlayText}>Hide floating widget</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    elevation: 20,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pillAlarmActive: {
    backgroundColor: '#991B1B',
    borderColor: '#DC2626',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  pulseDotAlarm: {
    backgroundColor: '#F87171',
  },
  pillDistanceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pillDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  pillEtaText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  expandedCard: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  expandedTitle: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '600',
  },
  collapseBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  alarmActionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  dismissBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  snoozeBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  snoozeBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
  },
  closeOverlayBtn: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  closeOverlayText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
});
