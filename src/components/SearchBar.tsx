import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { searchPlaces, SearchResult } from '../services/nominatim';
import { SWIGGY_THEME } from '../theme/swiggyTheme';
import { decodeRouteFromSync, RouteSyncPayload } from '../utils/routeSync';

interface SearchBarProps {
  onSelectPlace: (result: SearchResult) => void;
  onSyncRoute?: (payload: RouteSyncPayload) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectPlace,
  onSyncRoute,
  placeholder = 'Search station or stop...',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [syncTokenInput, setSyncTokenInput] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const lastRequestIdRef = React.useRef(0);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const currentRequestId = ++lastRequestIdRef.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchPlaces(query);
      if (currentRequestId === lastRequestIdRef.current) {
        setResults(res);
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setQuery(item.name);
    setResults([]);
    setIsFocused(false);
    onSelectPlace(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleImportSync = () => {
    setSyncError(null);
    if (!syncTokenInput.trim()) return;

    const payload = decodeRouteFromSync(syncTokenInput);
    if (payload) {
      if (onSyncRoute) {
        onSyncRoute(payload);
      } else {
        onSelectPlace({
          placeId: `sync_${Date.now()}`,
          name: payload.destinationName,
          displayName: payload.destinationName,
          latitude: payload.destination.latitude,
          longitude: payload.destination.longitude,
          type: 'transit_station',
        });
      }
      setQuery(payload.destinationName);
      setSyncModalVisible(false);
      setSyncTokenInput('');
    } else {
      setSyncError('Invalid route code or token. Please check the desktop link.');
    }
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="search"
      accessibilityLabel="Destination stop search"
    >
      <View style={styles.topLabelRow}>
        <Text style={styles.topLabelTitle}>Destination station</Text>
        <TouchableOpacity
          style={styles.desktopSyncBtn}
          onPress={() => setSyncModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Sync route from desktop"
        >
          <Text style={styles.desktopSyncBtnText}>Sync from desktop</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.inputRow, isFocused && styles.inputFocused]}>
        <Text style={styles.searchIcon} importantForAccessibility="no">⌕</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search destination or transit stop"
          accessibilityHint="Type a station or location name. Results appear below."
        />
        {loading && <ActivityIndicator size="small" color={SWIGGY_THEME.colors.primary} style={styles.spinner} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search query"
          >
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {isFocused && results.length > 0 && (
        <View style={styles.dropdown} accessibilityRole="list" accessibilityLabel="Search results">
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownHeaderText}>Suggested stations</Text>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.displayName}`}
                accessibilityHint="Double tap to set this stop as your destination"
              >
                <View style={styles.pinCircle}>
                  <View style={styles.stationDot} />
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.displayName}
                  </Text>
                </View>
                <View style={styles.selectBadge}>
                  <Text style={styles.selectBadgeText}>Select</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Desktop Route Sync Modal */}
      <Modal
        visible={syncModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSyncModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Desktop route sync</Text>
            <Text style={styles.modalSubtitle}>
              Paste a route code or link generated from your office desktop to beam your journey instantly without logging in.
            </Text>

            <TextInput
              style={styles.syncInput}
              placeholder="Paste sync code or URL (e.g. #sync=...)"
              placeholderTextColor="#94A3B8"
              value={syncTokenInput}
              onChangeText={setSyncTokenInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {syncError && (
              <Text style={styles.errorText}>{syncError}</Text>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setSyncModalVisible(false);
                  setSyncError(null);
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleImportSync}
              >
                <Text style={styles.modalConfirmBtnText}>Import route</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
    marginBottom: 8,
  },
  topLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  topLabelTitle: {
    color: SWIGGY_THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  desktopSyncBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  desktopSyncBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SWIGGY_THEME.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
    ...SWIGGY_THEME.shadows.card,
  },
  inputFocused: {
    borderColor: SWIGGY_THEME.colors.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: SWIGGY_THEME.colors.textMuted,
  },
  input: {
    flex: 1,
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  spinner: {
    marginLeft: 6,
  },
  clearButton: {
    minWidth: 32,
    minHeight: 32,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: SWIGGY_THEME.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
    maxHeight: 240,
    ...SWIGGY_THEME.shadows.card,
    overflow: 'hidden',
  },
  dropdownHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SWIGGY_THEME.colors.border,
  },
  dropdownHeaderText: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SWIGGY_THEME.colors.border,
  },
  pinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SWIGGY_THEME.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SWIGGY_THEME.colors.primary,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '600',
  },
  resultAddress: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11.5,
    marginTop: 2,
  },
  selectBadge: {
    backgroundColor: SWIGGY_THEME.colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
  },
  selectBadgeText: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 400,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 14,
  },
  syncInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 11.5,
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
