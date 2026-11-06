import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { adService } from '../services/adService';
import { AD_CONFIG } from '../config/admob';

interface InterstitialAdModalProps {
  // Optional custom trigger hook
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = () => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [onDismissCallback, setOnDismissCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Register this modal with the centralized adService
    adService.registerInterstitialHandler((callback) => {
      setOnDismissCallback(() => callback);
      setCountdown(5);
      setCanSkip(false);
      setVisible(true);
    });

    return () => {
      adService.unregisterInterstitialHandler();
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (visible && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (visible && countdown === 0) {
      setCanSkip(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, countdown]);

  const handleClose = () => {
    setVisible(false);
    if (onDismissCallback) {
      onDismissCallback();
      setOnDismissCallback(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>Sponsored promotion</Text>
            </View>

            {canSkip ? (
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Skip advertisement"
              >
                <Text style={styles.closeButtonText}>Skip ad</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>Skip in {countdown}s</Text>
              </View>
            )}
          </View>

          {/* Ad Creative Body */}
          <View style={styles.creative}>
            <View style={styles.iconCircle}>
              <View style={styles.innerDot} />
            </View>

            <Text style={styles.title}>Travel accommodations and station services</Text>
            <Text style={styles.description}>
              Explore verified luggage storage, hotels, and transit amenities near major railway and metro hubs.
            </Text>

            {/* Regulatory: honest sponsorship disclosure */}
            <View style={styles.verifiedRow}>
              <Text style={styles.verifiedBadge}>AdMob verified</Text>
              <Text style={styles.verifiedSub}>Non-personalized • Supports free app</Text>
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="View sponsored transit services"
            >
              <Text style={styles.ctaText}>View transit offers</Text>
            </TouchableOpacity>
          </View>

          {/* Footer with AdMob Test Unit Info */}
          <View style={styles.footer}>
            <Text style={styles.unitText}>
              Ad unit: {AD_CONFIG.interstitialAdUnitId}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: Math.min(width - 32, 420),
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  adBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adBadgeText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  timerBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  creative: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  innerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FC8019',
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    color: '#475569',
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  verifiedBadge: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
  },
  verifiedSub: {
    color: '#64748B',
    fontSize: 11,
  },
  ctaButton: {
    backgroundColor: '#FC8019',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  unitText: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
});
