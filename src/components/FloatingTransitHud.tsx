import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Linking,
} from 'react-native';
import { formatDistance } from '../utils/geo';
import { generateWhatsAppEtaUrl } from '../utils/routeSync';

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

  const handleShareWhatsApp = () => {
    const url = generateWhatsAppEtaUrl({
      destinationName,
      distanceKm,
      etaMinutes,
      speedKmh,
      radiusKm,
    });
    Linking.openURL(url).catch(() => {});
  };

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

          {/* 1-Tap WhatsApp Live ETA Share */}
          <TouchableOpacity
            style={styles.whatsAppShareBtn}
            onPress={handleShareWhatsApp}
            accessibilityRole="button"
            accessibilityLabel="Share live arrival status on WhatsApp"
          >
            <View style={styles.whatsAppDot} />
            <Text style={styles.whatsAppBtnText}>Share live ETA on WhatsApp</Text>
          </TouchableOpacity>

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
    color: '#FC8019',
    fontSize: 12,
    fontWeight: '700',
  },
  expandedCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    width: 280,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  expandedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  collapseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  whatsAppShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  whatsAppDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  whatsAppBtnText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
  },
  alarmActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dismissBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  snoozeBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  snoozeBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  closeOverlayBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeOverlayText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
});
