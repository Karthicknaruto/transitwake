import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { subscriptionService } from '../services/subscriptionService';
import { PrimeSubscriptionState } from '../types/subscription';

interface PrimeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrimeModal: React.FC<PrimeModalProps> = ({ visible, onClose }) => {
  const [state, setState] = useState<PrimeSubscriptionState>(() => subscriptionService.getState());
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    return subscriptionService.subscribe((updated) => {
      setState(updated);
    });
  }, []);

  useEffect(() => {
    if (visible) {
      setFeedbackMessage(null);
      setState(subscriptionService.getState());
    }
  }, [visible]);

  const isAdFree = subscriptionService.isAdFree();
  const isGracePeriod = state.status === 'cancelled_grace_period';

  const formatDate = (epochMs: number | null) => {
    if (!epochMs) return '';
    const date = new Date(epochMs);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePurchase = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await subscriptionService.purchasePrime();
      if (res.success) {
        setFeedbackMessage('TransitWake Prime activated. All ads are now removed.');
      } else {
        setFeedbackMessage('Unable to complete purchase. Please try again.');
      }
    } catch {
      setFeedbackMessage('Payment could not be processed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const success = await subscriptionService.cancelSubscription();
      if (success) {
        setFeedbackMessage(
          `Subscription cancelled. You retain ad-free access until ${formatDate(state.expiresAt)}.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await subscriptionService.restorePurchases();
      if (res.success) {
        setFeedbackMessage('Active Prime subscription restored.');
      } else {
        setFeedbackMessage('No active subscription found to restore.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={styles.container}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel="TransitWake Prime subscription modal"
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>TransitWake Prime</Text>
              <Text style={styles.subtitle}>Ad-free transit experience</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close Prime modal"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Price Hero */}
            <View style={styles.priceHero}>
              <Text style={styles.priceHeroAmount}>₹26</Text>
              <Text style={styles.priceHeroInterval}>per month</Text>
            </View>

            {/* Status notice if already active */}
            {isAdFree && (
              <View
                style={[
                  styles.statusCard,
                  isGracePeriod ? styles.statusCardGrace : styles.statusCardActive,
                ]}
              >
                <View style={styles.statusDot} />
                <Text style={styles.statusCardText}>
                  {isGracePeriod
                    ? `Cancelled. Ad-free benefits remain active until ${formatDate(state.expiresAt)}.`
                    : `Active subscription. Next renewal date is ${formatDate(state.expiresAt)}.`}
                </Text>
              </View>
            )}

            {feedbackMessage && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackText}>{feedbackMessage}</Text>
              </View>
            )}

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.checkCircle}>
                  <View style={styles.checkInner} />
                </View>
                <View style={styles.featureTextColumn}>
                  <Text style={styles.featureTitle}>Zero banner advertisements</Text>
                  <Text style={styles.featureDescription}>
                    Removes the persistent sponsored banner from all navigation screens.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkCircle}>
                  <View style={styles.checkInner} />
                </View>
                <View style={styles.featureTextColumn}>
                  <Text style={styles.featureTitle}>Zero route-start interstitial popups</Text>
                  <Text style={styles.featureDescription}>
                    Start tracking and simulation instantly with zero ad interruption.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkCircle}>
                  <View style={styles.checkInner} />
                </View>
                <View style={styles.featureTextColumn}>
                  <Text style={styles.featureTitle}>14-day statutory refund guarantee</Text>
                  <Text style={styles.featureDescription}>
                    Honored via Apple App Store, Google Play Store, or direct support.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkCircle}>
                  <View style={styles.checkInner} />
                </View>
                <View style={styles.featureTextColumn}>
                  <Text style={styles.featureTitle}>Cancel anytime with one tap</Text>
                  <Text style={styles.featureDescription}>
                    No dark patterns or cancellation hurdles. Retain paid days until billing ends.
                  </Text>
                </View>
              </View>
            </View>

            {/* Regulatory Disclosures Box (Store compliance Point 3 & 10) */}
            <View style={styles.disclosureBox}>
              <Text style={styles.disclosureTitle}>Billing transparency and fair terms</Text>
              <Text style={styles.disclosureText}>
                TransitWake core features (station search, geofence alarms, and navigation) remain 100% free forever. Prime is an optional ad removal upgrade billed at ₹26 per month (taxes included). Subscriptions renew automatically every 30 days unless cancelled at least 24 hours prior to the renewal date.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FC8019" />
                </View>
              ) : !isAdFree || isGracePeriod ? (
                <>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePurchase}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Subscribe to TransitWake Prime for 26 rupees per month"
                  >
                    <Text style={styles.primaryButtonText}>
                      {isGracePeriod ? 'Renew subscription (₹26/month)' : 'Subscribe for ₹26/month'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleRestore}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Restore previous subscription purchase"
                  >
                    <Text style={styles.secondaryButtonText}>Restore purchase</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel subscription auto-renewal"
                >
                  <Text style={styles.cancelButtonText}>Cancel subscription</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  priceHero: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 16,
  },
  priceHeroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#9A3412',
  },
  priceHeroInterval: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C2410C',
    marginTop: 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusCardGrace: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 10,
  },
  statusCardText: {
    fontSize: 12.5,
    color: '#1E293B',
    flex: 1,
    lineHeight: 17,
  },
  feedbackBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  feedbackText: {
    fontSize: 12,
    color: '#0F172A',
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkInner: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#FC8019',
  },
  featureTextColumn: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  disclosureBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 18,
  },
  disclosureTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  disclosureText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  actionsContainer: {
    paddingBottom: 8,
  },
  loadingContainer: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FC8019',
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '600',
  },
});
