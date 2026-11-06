import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { AD_CONFIG } from '../config/admob';
import { SWIGGY_THEME } from '../theme/swiggyTheme';
import { subscriptionService } from '../services/subscriptionService';

interface BannerAdProps {
  onAdClicked?: () => void;
}

export const BannerAdComponent: React.FC<BannerAdProps> = ({ onAdClicked }) => {
  const [adDismissed, setAdDismissed] = useState(false);
  const [isAdFree, setIsAdFree] = useState<boolean>(() => subscriptionService.isAdFree());

  useEffect(() => {
    return subscriptionService.subscribe(() => {
      setIsAdFree(subscriptionService.isAdFree());
    });
  }, []);

  if (isAdFree || adDismissed) {
    return null;
  }

  const handleAdPress = () => {
    if (onAdClicked) onAdClicked();
    if (Platform.OS === 'web') {
      window.open('https://google.com', '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL('https://google.com').catch(() => {});
    }
  };

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="region"
      accessibilityLabel="Sponsored message"
    >
      <View style={styles.adBadgeContainer}>
        <Text style={styles.adBadgeText}>Sponsored</Text>
      </View>

      <TouchableOpacity
        style={styles.adContent}
        onPress={handleAdPress}
        activeOpacity={0.85}
        accessibilityRole="link"
        accessibilityLabel="Sponsored: Commuter audio gear. Tap to explore."
      >
        <View style={styles.iconCircle}>
          <View style={styles.innerDot} />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.adTitle} numberOfLines={1}>
            Commuter audio accessories
          </Text>
          <Text style={styles.adSubtitle} numberOfLines={1}>
            Noise-isolating earphones suited for subway and train commutes.
          </Text>
        </View>

        <View style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Explore</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          AdMob test unit: {AD_CONFIG.bannerAdUnitId.slice(0, 16)}...
        </Text>
        <TouchableOpacity
          onPress={() => setAdDismissed(true)}
          accessibilityRole="button"
          accessibilityLabel="Hide sponsored banner"
        >
          <Text style={styles.closeText}>Hide</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    width: '100%',
  },
  adBadgeContainer: {
    position: 'absolute',
    top: 6,
    left: 14,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adBadgeText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FC8019',
  },
  textColumn: {
    flex: 1,
    marginRight: 8,
  },
  adTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  adSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 2,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
  closeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
});
