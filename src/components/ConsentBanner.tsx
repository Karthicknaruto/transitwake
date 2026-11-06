import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { consentStore, UserConsentPreferences } from '../services/consentStore';
import { SWIGGY_THEME } from '../theme/swiggyTheme';

interface ConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [allowAds, setAllowAds] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(false);

  useEffect(() => {
    const unsub = consentStore.subscribe((prefs) => {
      setVisible(!prefs.hasAnsweredConsent);
      setAllowAds(prefs.allowNonPersonalizedAds);
      setAllowAnalytics(prefs.allowAnalyticsTelemetry);
    });
    return unsub;
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    consentStore.acceptAll();
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    consentStore.acceptEssentialOnly();
    setVisible(false);
  };

  const handleSaveCustom = () => {
    consentStore.updatePreferences({
      essentialOnly: !allowAnalytics,
      allowNonPersonalizedAds: allowAds,
      allowAnalyticsTelemetry: allowAnalytics,
      hasAnsweredConsent: true,
    });
    setVisible(false);
    setShowCustomize(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={styles.container}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLabel="Privacy and Cookie Consent Banner"
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <Text style={styles.subTitle}>Data privacy</Text>
              <Text style={styles.title}>Privacy choices</Text>
            </View>
          </View>

          <Text style={styles.bodyText}>
            TransitWake computes GPS distance strictly inside local device memory (RAM) to sound your wake-up alarm. We do not track, record, or sell transit routes.
          </Text>

          {showCustomize ? (
            <View style={styles.customizeBox}>
              <View style={styles.prefRow}>
                <View style={styles.prefCol}>
                  <Text style={styles.prefTitle}>Essential local memory</Text>
                  <Text style={styles.prefDesc}>Required for destination alarms and geofence tracking.</Text>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.alwaysActive}>Required</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.prefRow}>
                <View style={styles.prefCol}>
                  <Text style={styles.prefTitle}>Non-personalized ads</Text>
                  <Text style={styles.prefDesc}>Keeps this app free with zero user profiling.</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, allowAds ? styles.toggleOn : styles.toggleOff]}
                  onPress={() => setAllowAds(!allowAds)}
                  accessibilityRole="switch"
                  accessibilityLabel="Allow non-personalized ads"
                  accessibilityState={{ checked: allowAds }}
                >
                  <Text style={[styles.toggleBtnText, allowAds ? styles.toggleTextOn : styles.toggleTextOff]}>
                    {allowAds ? 'On' : 'Off'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.prefRow}>
                <View style={styles.prefCol}>
                  <Text style={styles.prefTitle}>Anonymous diagnostics</Text>
                  <Text style={styles.prefDesc}>Helps diagnose GPS crashes without identifying you.</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, allowAnalytics ? styles.toggleOn : styles.toggleOff]}
                  onPress={() => setAllowAnalytics(!allowAnalytics)}
                  accessibilityRole="switch"
                  accessibilityLabel="Allow anonymous crash telemetry"
                  accessibilityState={{ checked: allowAnalytics }}
                >
                  <Text style={[styles.toggleBtnText, allowAnalytics ? styles.toggleTextOn : styles.toggleTextOff]}>
                    {allowAnalytics ? 'On' : 'Off'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={onOpenPrivacyPolicy}
            style={styles.policyLink}
            accessibilityRole="link"
            accessibilityLabel="Read our complete Privacy Policy and Terms"
          >
            <Text style={styles.policyLinkText}>Read complete Privacy Policy & SDK Audit</Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            {showCustomize ? (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleSaveCustom}
                accessibilityRole="button"
                accessibilityLabel="Save customized consent choices"
              >
                <Text style={styles.btnPrimaryText}>Save Preferences</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={handleEssentialOnly}
                  accessibilityRole="button"
                  accessibilityLabel="Accept essential cookies only"
                >
                  <Text style={styles.btnSecondaryText}>Essential Only</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => setShowCustomize(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Customize cookie and data preferences"
                >
                  <Text style={styles.btnSecondaryText}>Customize</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={handleAcceptAll}
                  accessibilityRole="button"
                  accessibilityLabel="Accept all cookies and default choices"
                >
                  <Text style={styles.btnPrimaryText}>Accept All</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 36, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    marginBottom: 8,
  },
  headerTextCol: {
    flex: 1,
  },
  subTitle: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  bodyText: {
    color: SWIGGY_THEME.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
    color: SWIGGY_THEME.colors.textPrimary,
  },
  policyLink: {
    marginBottom: 14,
  },
  policyLinkText: {
    color: SWIGGY_THEME.colors.textSecondary,
    fontSize: 11.5,
    fontWeight: '500',
  },
  customizeBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prefCol: {
    flex: 1,
    marginRight: 10,
  },
  prefTitle: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  prefDesc: {
    color: SWIGGY_THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  activePill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  alwaysActive: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: SWIGGY_THEME.colors.border,
    marginVertical: 6,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: SWIGGY_THEME.colors.primary,
    borderColor: SWIGGY_THEME.colors.primary,
  },
  toggleOff: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toggleTextOn: {
    color: '#FFFFFF',
  },
  toggleTextOff: {
    color: SWIGGY_THEME.colors.textMuted,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: SWIGGY_THEME.colors.primary,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  btnSecondary: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: SWIGGY_THEME.colors.border,
  },
  btnSecondaryText: {
    color: SWIGGY_THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
});
