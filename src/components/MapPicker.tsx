import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Coordinates } from '../types';
import { formatDistance, haversineDistance } from '../utils/geo';
import { LiveStreetTilesMap } from './LiveStreetTilesMap';
import { SWIGGY_THEME } from '../theme/swiggyTheme';

interface MapPickerProps {
  currentLocation: Coordinates | null;
  destination: Coordinates | null;
  destinationName: string;
  radiusKm: number;
  onSelectCoordinate: (coord: Coordinates) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  currentLocation,
  destination,
  destinationName,
  radiusKm,
  onSelectCoordinate,
}) => {
  const PRESET_STOPS = [
    { name: 'Grand Central', lat: 40.7527, lon: -73.9772 },
    { name: 'Airport T1', lat: 40.6413, lon: -73.7781 },
    { name: 'University Campus', lat: 40.7295, lon: -73.9965 },
    { name: 'Downtown Hub', lat: 40.7128, lon: -74.006 },
  ];

  const distance =
    currentLocation && destination
      ? haversineDistance(currentLocation, destination)
      : null;

  return (
    <View style={styles.card}>
      {/* Tracking Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTextCol}>
            <View style={styles.labelRow}>
              <Text style={styles.deliveryTag}>Destination stop</Text>
              <View style={styles.liveTagBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>Live GPS</Text>
              </View>
            </View>
            <Text style={styles.destName} numberOfLines={1}>
              {destinationName || 'Tap anywhere on the map to set stop'}
            </Text>
            {destination && (
              <Text style={styles.coordText}>
                {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)} • {radiusKm.toFixed(1)} km alert circle
              </Text>
            )}
          </View>
        </View>

        {distance !== null && (
          <View style={styles.distBadge}>
            <Text style={styles.distValue}>{formatDistance(distance)}</Text>
            <Text style={styles.distLabel}>away</Text>
          </View>
        )}
      </View>

      {/* Street Tiles Map */}
      <LiveStreetTilesMap
        currentLocation={currentLocation}
        destination={destination}
        destinationName={destinationName}
        radiusKm={radiusKm}
        onSelectCoordinate={onSelectCoordinate}
      />

      {/* Quick Stop Presets */}
      <View style={styles.presetsContainer}>
        <Text style={styles.quickSelectLabel}>Quick stops</Text>
        <View style={styles.presetsRow}>
          {PRESET_STOPS.map((stop) => {
            const isSelected =
              destination &&
              Math.abs(destination.latitude - stop.lat) < 0.001 &&
              Math.abs(destination.longitude - stop.lon) < 0.001;
            return (
              <TouchableOpacity
                key={stop.name}
                style={[
                  styles.stopChip,
                  isSelected ? styles.stopChipSelected : styles.stopChipUnselected,
                ]}
                onPress={() =>
                  onSelectCoordinate({
                    latitude: stop.lat,
                    longitude: stop.lon,
                  })
                }
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Set destination to ${stop.name}`}
              >
                <View style={[styles.chipDot, isSelected && styles.chipDotSelected]} />
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                  ]}
                >
                  {stop.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SWIGGY_THEME.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
    overflow: 'hidden',
    marginVertical: 8,
    ...SWIGGY_THEME.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: SWIGGY_THEME.colors.border,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  headerTextCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  deliveryTag: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  liveTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  liveTagText: {
    color: '#15803D',
    fontSize: 9.5,
    fontWeight: '600',
  },
  destName: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '600',
  },
  coordText: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  distBadge: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
  },
  distValue: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  distLabel: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 9.5,
    fontWeight: '500',
  },
  presetsContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: SWIGGY_THEME.colors.border,
  },
  quickSelectLabel: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 10.5,
    fontWeight: '500',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  stopChipSelected: {
    backgroundColor: SWIGGY_THEME.colors.primaryLight,
    borderColor: SWIGGY_THEME.colors.primary,
  },
  stopChipUnselected: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    borderColor: SWIGGY_THEME.colors.border,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  chipDotSelected: {
    backgroundColor: SWIGGY_THEME.colors.primary,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: SWIGGY_THEME.colors.primaryDark,
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: SWIGGY_THEME.colors.textPrimary,
  },
});
