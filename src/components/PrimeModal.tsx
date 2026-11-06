import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import { subscriptionService } from '../services/subscriptionService';
import { PrimeSubscriptionState, StudentReferralState } from '../types/subscription';

interface PrimeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrimeModal: React.FC<PrimeModalProps> = ({ visible, onClose }) => {
  const [state, setState] = useState<PrimeSubscriptionState>(() => subscriptionService.getState());
  const [referralState, setReferralState] = useState<StudentReferralState>(() => subscriptionService.getReferralState());
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState<string>('');

  useEffect(() => {
    return subscriptionService.subscribe((updated) => {
      setState(updated);
      setReferralState(subscriptionService.getReferralState());
    });
  }, []);

  useEffect(() => {
    if (visible) {
      setFeedbackMessage(null);
      setState(subscriptionService.getState());
      setReferralState(subscriptionService.getReferralState());
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
    } catch {
      setFeedbackMessage('Failed to cancel subscription. Please check your connection and try again.');
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
    } catch {
      setFeedbackMessage('Failed to restore purchases. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareReferral = () => {
    const text = `Hey, use TransitWake for your train commute. Set alarms that wake you before your stop: https://transitwake.app/invite?code=${referralState.myReferralCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleRedeemCode = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    try {
      const res = await subscriptionService.redeemReferralCode(inputCode);
      setFeedbackMessage(res.message);
      if (res.success) {
        setInputCode('');
        setReferralState(subscriptionService.getReferralState());
      }
    } catch {
      setFeedbackMessage('Failed to redeem invite code. Please try again.');
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
              <Text style={styles.subtitle}>The commuter sleep sanctuary</Text>
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
                  <Text style={styles.featureTitle}>Multi-leg interchange transfer alarms</Text>
                  <Text style={styles.featureDescription}>
                    Wakes you 2 km before your intermediate junction, then auto-arms for your final stop.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkCircle}>
                  <View style={styles.checkInner} />
                </View>
                <View style={styles.featureTextColumn}>
                  <Text style={styles.featureTitle}>1-tap WhatsApp live arrival sharing</Text>
                  <Text style={styles.featureDescription}>
                    Send real-time read-only route updates to your family so they know you are safe.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkCircle}>
                  <View style={styles.checkInner} />
                </View>
                <View style={styles.featureTextColumn}>
                  <Text style={styles.featureTitle}>Zero banner or popup advertisements</Text>
                  <Text style={styles.featureDescription}>
                    Clean, calm cockpit with zero ads during tracking or route activation.
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
                    Full refund honored with zero friction if you are dissatisfied for any reason.
                  </Text>
                </View>
              </View>
            </View>

            {/* Student & Campus Referral Pass Unlock */}
            <View style={styles.referralCard}>
              <View style={styles.referralHeader}>
                <Text style={styles.referralTag}>Student referral loop</Text>
                <Text style={styles.referralStatus}>
                  {referralState.semesterPassUnlocked
                    ? 'Unlocked (6 months free)'
                    : `${referralState.redeemedCount} of 2 invited`}
                </Text>
              </View>
              <Text style={styles.referralDescription}>
                Invite two commuting classmates to unlock 6 months of ad-free Prime without paying.
              </Text>
              
              <View style={styles.referralCodeBox}>
                <Text style={styles.codeLabel}>Your invite code:</Text>
                <Text style={styles.codeValue}>{referralState.myReferralCode}</Text>
                <TouchableOpacity
                  style={styles.shareCodeBtn}
                  onPress={handleShareReferral}
                  accessibilityRole="button"
                  accessibilityLabel="Share invite code on WhatsApp"
                >
                  <Text style={styles.shareCodeBtnText}>Share on WhatsApp</Text>
                </TouchableOpacity>
              </View>

              {!referralState.semesterPassUnlocked && (
                <View style={styles.redeemRow}>
                  <TextInput
                    style={styles.redeemInput}
                    placeholder="Enter classmate's code"
                    placeholderTextColor="#94A3B8"
                    value={inputCode}
                    onChangeText={setInputCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.redeemBtn}
                    onPress={handleRedeemCode}
                    accessibilityRole="button"
                    accessibilityLabel="Redeem invite code"
                  >
                    <Text style={styles.redeemBtnText}>Redeem</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Regulatory Disclosures Box (Store compliance Point 3 & 10) */}
            <View style={styles.disclosureBox}>
              <Text style={styles.disclosureTitle}>Billing transparency and fair terms</Text>
              <Text style={styles.disclosureText}>
                TransitWake core navigation remains free forever. Prime is an optional upgrade billed at ₹26 per month (taxes included). Subscriptions renew automatically every 30 days unless cancelled at least 24 hours prior to the renewal date.
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
  referralCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  referralTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  referralStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  referralDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  codeLabel: {
    fontSize: 11,
    color: '#64748B',
    marginRight: 6,
  },
  codeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  shareCodeBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shareCodeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  redeemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  redeemInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  redeemBtn: {
    backgroundColor: '#FC8019',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
