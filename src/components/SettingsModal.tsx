import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { consentStore, UserConsentPreferences } from '../services/consentStore';
import { authService } from '../services/authService';
import { speechService } from '../services/speechService';
import { powerManager } from '../services/powerManager';
import { notificationService } from '../services/notificationService';
import { subscriptionService } from '../services/subscriptionService';
import { BUSINESS_DETAILS, PRICING_DISCLOSURE, LegalTabId } from '../config/legalData';
import { UserProfile } from '../types/auth';
import { PrimeCard } from './PrimeCard';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenLegal: (tab: LegalTabId) => void;
  floatingHudEnabled: boolean;
  onToggleFloatingHud: () => void;
  onOpenPrimeModal?: () => void;
}

export function SettingsModal({
  visible,
  onClose,
  onOpenLegal,
  floatingHudEnabled,
  onToggleFloatingHud,
  onOpenPrimeModal,
}: SettingsModalProps) {
  const [prefs, setPrefs] = useState<UserConsentPreferences>(consentStore.getPreferences());
  const [user, setUser] = useState<UserProfile>(authService.getCurrentUser());
  const [ttsMuted, setTtsMuted] = useState<boolean>(speechService.isMuted());
  const [powerSaverActive, setPowerSaverActive] = useState<boolean>(
    powerManager.getState().batterySaverActive
  );

  useEffect(() => {
    const unsubConsent = consentStore.subscribe((newPrefs) => setPrefs(newPrefs));
    const unsubAuth = authService.onAuthStateChanged((newUser) => setUser(newUser));
    return () => {
      unsubConsent();
      unsubAuth();
    };
  }, []);

  const handleToggle = (key: keyof UserConsentPreferences) => {
    consentStore.updatePreferences({ [key]: !prefs[key] });
  };

  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle();
      Alert.alert('Signed in', 'Your account is connected. Commute routes are now backed up.');
    } catch {
      Alert.alert('Sign in failed', 'Could not complete Google sign-in. Please try again.');
    }
  };

  const handleGoogleSignOut = async () => {
    await authService.signOut();
    Alert.alert('Signed out', 'Restored anonymous guest commuter mode.');
  };

  const handleToggleTts = () => {
    const next = !ttsMuted;
    speechService.setMuted(next);
    setTtsMuted(next);
  };

  const handleTogglePowerSaver = () => {
    const next = !powerSaverActive;
    powerManager.setBatterySaverActive(next);
    setPowerSaverActive(next);
  };

  const handleTestNotification = async () => {
    const granted = await notificationService.requestPermissions();
    if (!granted) {
      Alert.alert('Permission denied', 'Please allow notifications in your device settings.');
      return;
    }
    await notificationService.triggerArrivalAlert({
      destinationName: 'Test Station',
      distanceKm: 3.8,
      etaMinutes: 4,
      radiusKm: 4.0,
    });
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete all account & local data?',
      'Under GDPR Art. 17 & Apple Guideline 5.1.1, this will permanently wipe all account tokens, cloud route backups, saved stops, and consent records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently wipe all data',
          style: 'destructive',
          onPress: async () => {
            await authService.deleteAccountAndData();
            await subscriptionService.wipeData();
            consentStore.eraseAllDataAndReset();
            Alert.alert('Data erased', 'All account records and local storage have been wiped.');
            onClose();
          },
        },
      ]
    );
  };

  const isGoogle = !user.isGuest && user.provider === 'google';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subHeader}>Preferences</Text>
            <Text style={styles.headerTitle}>Settings and privacy</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close settings modal"
          >
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Account & Google Sign-in */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account and cloud synchronization</Text>
            <View style={styles.accountCard}>
              <View style={styles.accountHeaderRow}>
                {isGoogle && user.photoUrl ? (
                  <Image source={{ uri: user.photoUrl }} style={styles.accountAvatar} />
                ) : (
                  <View style={styles.accountAvatarFallback}>
                    <Text style={styles.accountAvatarText}>
                      {isGoogle ? (user.displayName[0] || 'U').toUpperCase() : 'G'}
                    </Text>
                  </View>
                )}

                <View style={styles.accountTextCol}>
                  <Text style={styles.accountName}>
                    {isGoogle ? user.displayName : 'Guest commuter mode'}
                  </Text>
                  <Text style={styles.accountEmail}>
                    {isGoogle ? user.email : 'No personal data or account required'}
                  </Text>
                </View>
              </View>

              {isGoogle ? (
                <View style={styles.accountActionsRow}>
                  <TouchableOpacity
                    style={styles.signOutBtn}
                    onPress={handleGoogleSignOut}
                    accessibilityRole="button"
                    accessibilityLabel="Sign out of Google account"
                  >
                    <Text style={styles.signOutBtnText}>Sign out</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.googleSignInBtn}
                  onPress={handleGoogleSignIn}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in with Google"
                >
                  <Text style={styles.googleGLogo}>G</Text>
                  <Text style={styles.googleSignInBtnText}>Sign in with Google</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* TransitWake Prime Micro-Subscription */}
          {onOpenPrimeModal && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TransitWake Prime</Text>
              <PrimeCard onOpenPrimeModal={onOpenPrimeModal} />
            </View>
          )}

          {/* Multitasking: Display Over Other Apps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display over other apps</Text>
            <Text style={styles.sectionDesc}>
              Keep a floating mini HUD visible while browsing other apps or reading during transit.
            </Text>

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Floating transit widget</Text>
                <Text style={styles.rowSub}>Draggable mini HUD showing distance countdown</Text>
              </View>
              <Switch
                value={floatingHudEnabled}
                onValueChange={onToggleFloatingHud}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle floating transit widget"
              />
            </View>
          </View>

          {/* Alarm, Notification & Audio Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alarm and notification controls</Text>

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Audio siren alert</Text>
                <Text style={styles.rowSub}>Plays loud synthesizer siren within 4.0 km</Text>
              </View>
              <Switch
                value={prefs.soundAlertsEnabled}
                onValueChange={() => handleToggle('soundAlertsEnabled')}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle audio siren alert"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Haptic vibration pulses</Text>
                <Text style={styles.rowSub}>Vibrates continuously until dismissed</Text>
              </View>
              <Switch
                value={prefs.vibrationAlertsEnabled}
                onValueChange={() => handleToggle('vibrationAlertsEnabled')}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle haptic vibration alert"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Foreground alert notifications</Text>
                <Text style={styles.rowSub}>High-priority heads-up alert when phone is locked</Text>
              </View>
              <Switch
                value={prefs.notificationsEnabled}
                onValueChange={() => handleToggle('notificationsEnabled')}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle foreground alert notifications"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Earphone voice announcements</Text>
                <Text style={styles.rowSub}>Spoken milestone callouts for headphone commuters</Text>
              </View>
              <Switch
                value={!ttsMuted}
                onValueChange={handleToggleTts}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle earphone voice announcements"
              />
            </View>

            <TouchableOpacity
              style={styles.testNotifBtn}
              onPress={handleTestNotification}
              accessibilityRole="button"
              accessibilityLabel="Send test arrival alert"
            >
              <Text style={styles.testNotifBtnText}>Send test arrival notification</Text>
            </TouchableOpacity>
          </View>

          {/* Smart Battery Saver */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Battery power management</Text>
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Smart GPS battery saver</Text>
                <Text style={styles.rowSub}>
                  Throttles GPS polling when far away (over 10 km @ 30s) saving up to 75% battery
                </Text>
              </View>
              <Switch
                value={powerSaverActive}
                onValueChange={handleTogglePowerSaver}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle smart GPS battery saver"
              />
            </View>
          </View>

          {/* Privacy & Advertising Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy and telemetry controls</Text>

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Non-personalized ads only</Text>
                <Text style={styles.rowSub}>Zero cross-app behavioral tracking or profiling</Text>
              </View>
              <Switch
                value={prefs.allowNonPersonalizedAds}
                onValueChange={() => handleToggle('allowNonPersonalizedAds')}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle non-personalized ads"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Anonymous crash diagnostics</Text>
                <Text style={styles.rowSub}>Zero GPS coordinates or personal identity shared</Text>
              </View>
              <Switch
                value={prefs.allowAnalyticsTelemetry}
                onValueChange={() => handleToggle('allowAnalyticsTelemetry')}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle anonymous crash diagnostics"
              />
            </View>
          </View>

          {/* Age Declaration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Age and regulatory eligibility</Text>
            <View style={styles.row}>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>User age 13 or older</Text>
                <Text style={styles.rowSub}>Compliant with COPPA (USA) and GDPR-K (EU)</Text>
              </View>
              <Switch
                value={prefs.isAboveAgeConsent}
                onValueChange={() => handleToggle('isAboveAgeConsent')}
                trackColor={{ false: '#E2E8F0', true: '#0F172A' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Confirm age 13 or older"
              />
            </View>
          </View>

          {/* Business Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operating entity</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{BUSINESS_DETAILS.entityName}</Text>
              <Text style={styles.infoText}>{BUSINESS_DETAILS.address}</Text>
              <Text style={styles.infoText}>Support: {BUSINESS_DETAILS.supportEmail}</Text>
              <Text style={styles.infoText}>Data Protection: {BUSINESS_DETAILS.dpoEmail}</Text>
              <Text style={styles.pricingBadge}>{PRICING_DISCLOSURE.summary}</Text>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Policies and disclosures</Text>

            <TouchableOpacity
              style={styles.complianceHeroBtn}
              onPress={() => {
                onClose();
                onOpenLegal('compliance');
              }}
              accessibilityRole="button"
              accessibilityLabel="View full 20-Point Store Compliance Audit"
            >
              <View style={styles.complianceHeroBadge}>
                <Text style={styles.complianceHeroBadgeText}>Verified</Text>
              </View>
              <View style={styles.complianceHeroTextCol}>
                <Text style={styles.complianceHeroTitle}>Store and GDPR compliance audit</Text>
                <Text style={styles.complianceHeroDesc}>Inspect all 20 verified compliance standards ›</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.linkGrid}>
              {[
                { tab: 'compliance', label: '20 Standards' },
                { tab: 'privacy', label: 'Privacy policy' },
                { tab: 'terms', label: 'Terms of service' },
                { tab: 'pricing', label: 'Free and refund' },
                { tab: 'cookies', label: 'Cookie policy' },
                { tab: 'sdks', label: 'SDK audit' },
                { tab: 'licenses', label: 'Open source' },
                { tab: 'email', label: 'Unsubscribe' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.tab}
                  style={styles.legalLinkBtn}
                  onPress={() => {
                    onClose();
                    onOpenLegal(item.tab as LegalTabId);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Read ${item.label}`}
                >
                  <Text style={styles.legalLinkText}>{item.label} ›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 1-Tap Account & Data Deletion */}
          <View style={[styles.section, styles.dangerSection]}>
            <Text style={styles.dangerTitle}>Account & data deletion</Text>
            <Text style={styles.dangerDesc}>
              Permanently purges Google account link, cloud route backups, saved stops, and consent tokens. Compliant with GDPR Art. 17 & Apple Guideline 5.1.1(v).
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteAllData}
              accessibilityRole="button"
              accessibilityLabel="Permanently wipe all data and reset app"
            >
              <Text style={styles.deleteBtnText}>Delete account and wipe all data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  subHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDesc: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: '#E2E8F0',
  },
  accountAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  accountAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  accountTextCol: {
    flex: 1,
  },
  accountName: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  accountEmail: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  googleSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  googleGLogo: {
    color: '#4285F4',
    fontSize: 15,
    fontWeight: '700',
  },
  googleSignInBtnText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '600',
  },
  accountActionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  signOutBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  signOutBtnText: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowTextCol: {
    flex: 1,
    marginRight: 10,
  },
  rowLabel: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  rowSub: {
    color: '#64748B',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  testNotifBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testNotifBtnText: {
    color: '#0F172A',
    fontSize: 11.5,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: '#475569',
    fontSize: 11.5,
    marginBottom: 3,
  },
  pricingBadge: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  complianceHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 10,
  },
  complianceHeroBadge: {
    backgroundColor: '#15803D',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },
  complianceHeroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '600',
  },
  complianceHeroTextCol: {
    flex: 1,
  },
  complianceHeroTitle: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '600',
  },
  complianceHeroDesc: {
    color: '#15803D',
    fontSize: 11,
  },
  linkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legalLinkBtn: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legalLinkText: {
    color: '#475569',
    fontSize: 11.5,
    fontWeight: '500',
  },
  dangerSection: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF7F7',
  },
  dangerTitle: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dangerDesc: {
    color: '#991B1B',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
});
