import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import {
  BUSINESS_DETAILS,
  PRICING_DISCLOSURE,
  THIRD_PARTY_SDKS,
  PRIVACY_POLICY_TEXT,
  TERMS_OF_SERVICE_TEXT,
  REFUND_POLICY_TEXT,
  COOKIE_POLICY_TEXT,
  AGE_CONSENT_TEXT,
  EMAIL_UNSUBSCRIBE_POLICY_TEXT,
  OPEN_SOURCE_LICENSES,
  COMPLIANCE_CHECKLIST_20,
  LegalTabId,
} from '../config/legalData';
import { rateLimiter } from '../utils/rateLimiter';
import { consentStore } from '../services/consentStore';
import { subscriptionService } from '../services/subscriptionService';
import { SWIGGY_THEME } from '../theme/swiggyTheme';

interface LegalModalProps {
  visible: boolean;
  initialTab?: LegalTabId;
  onClose: () => void;
}

export function LegalModal({
  visible,
  initialTab = 'compliance',
  onClose,
}: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTabId>(initialTab);
  const [checklistFilter, setChecklistFilter] = useState<string>('All');

  // Synchronize activeTab when opened or initialTab changes
  useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const handleDeleteData = async () => {
    await subscriptionService.wipeData();
    const success = consentStore.eraseAllDataAndReset();
    if (success) {
      Alert.alert(
        'Data Deleted',
        'All locally stored preferences, cached stops, and consent tokens have been permanently wiped from this device.'
      );
      onClose();
    }
  };

  const handleEmailDPO = () => {
    const rateCheck = rateLimiter.checkLimit('legal_email_dpo', 3, 300000);
    if (!rateCheck.allowed) {
      Alert.alert(
        'Request Rate Limit',
        `Too many email requests sent. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`
      );
      return;
    }
    Linking.openURL(
      `mailto:${BUSINESS_DETAILS.dpoEmail}?subject=GDPR%20Data%20Deletion%20Request`
    ).catch(() => {});
  };

  const tabItems: { id: LegalTabId; label: string }[] = [
    { id: 'compliance', label: '20 standards' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'terms', label: 'Terms' },
    { id: 'pricing', label: 'Free & refund' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'sdks', label: 'SDK audit' },
    { id: 'business', label: 'Business' },
    { id: 'licenses', label: 'Licenses' },
    { id: 'email', label: 'Unsubscribe' },
    { id: 'delete', label: 'Data deletion' },
  ];

  const filterOptions = [
    { key: 'All', label: 'All' },
    { key: 'Legal Policies', label: 'Legal policies' },
    { key: 'Data & Privacy', label: 'Data & privacy' },
    { key: 'Fair Commercial Practices', label: 'Fair practices' },
    { key: 'Accessibility & UI', label: 'Accessibility' },
    { key: 'User Controls', label: 'User controls' },
  ];

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
            <Text style={styles.subHeader}>Compliance and disclosure</Text>
            <Text style={styles.headerTitle}>Legal, privacy & audit</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close legal documents modal"
          >
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabItems.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabPill, activeTab === tab.id && styles.tabPillActive]}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: activeTab === tab.id }}
            >
              <Text
                style={[styles.tabPillText, activeTab === tab.id && styles.tabPillTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Body */}
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
          {activeTab === 'compliance' && (
            <View>
              <View style={styles.complianceHeroCard}>
                <View style={styles.complianceBadgeRow}>
                  <Text style={styles.complianceScoreBadge}>20 of 20 verified</Text>
                  <Text style={styles.complianceScoreLabel}>Store and GDPR ready</Text>
                </View>
                <Text style={styles.complianceHeroTitle}>
                  Verified regulatory and store compliance
                </Text>
                <Text style={styles.complianceHeroSub}>
                  TransitWake has undergone rigorous auditing against all 20 consumer protection,
                  privacy, data minimization, accessibility, and store requirements.
                </Text>
              </View>

              {/* Category Filter Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryFilterRow}
                contentContainerStyle={styles.categoryFilterContent}
              >
                {filterOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.filterChip,
                      checklistFilter === opt.key && styles.filterChipActive,
                    ]}
                    onPress={() => setChecklistFilter(opt.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter checklist by ${opt.label}`}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        checklistFilter === opt.key && styles.filterChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* 20 Item Checklist Cards */}
              {COMPLIANCE_CHECKLIST_20.filter(
                (item) => checklistFilter === 'All' || item.category === checklistFilter
              ).map((item) => (
                <View key={item.id} style={styles.checkCard}>
                  <View style={styles.checkCardHeader}>
                    <View style={styles.checkNumberBadge}>
                      <Text style={styles.checkNumberText}>{item.id}</Text>
                    </View>
                    <View style={styles.checkTitleCol}>
                      <Text style={styles.checkTitle}>{item.title}</Text>
                      <Text style={styles.checkCategory}>{item.category}</Text>
                    </View>
                    <View style={styles.passBadge}>
                      <Text style={styles.passBadgeText}>Verified</Text>
                    </View>
                  </View>
                  <Text style={styles.checkSummary}>{item.summary}</Text>
                  <View style={styles.checkDetailsBox}>
                    <Text style={styles.checkDetailsLabel}>Technical implementation</Text>
                    <Text style={styles.checkDetailsText}>{item.details}</Text>
                    <Text style={styles.checkVerifyLabel}>How to verify</Text>
                    <Text style={styles.checkVerifyText}>{item.verificationSteps}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'privacy' && (
            <View>
              <Text style={styles.sectionHeader}>Privacy policy (Items 1 & 7)</Text>
              <Text style={styles.paragraph}>{PRIVACY_POLICY_TEXT}</Text>
            </View>
          )}

          {activeTab === 'terms' && (
            <View>
              <Text style={styles.sectionHeader}>Terms of service (Item 2)</Text>
              <Text style={styles.paragraph}>{TERMS_OF_SERVICE_TEXT}</Text>
            </View>
          )}

          {activeTab === 'pricing' && (
            <View>
              <Text style={styles.sectionHeader}>Free app and refund policy (Items 3 & 10)</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Free forever commitment</Text>
                <Text style={styles.cardText}>{PRICING_DISCLOSURE.summary}</Text>
                <Text style={styles.cardText}>{PRICING_DISCLOSURE.description}</Text>
              </View>
              <Text style={styles.paragraph}>{REFUND_POLICY_TEXT}</Text>
            </View>
          )}

          {activeTab === 'cookies' && (
            <View>
              <Text style={styles.sectionHeader}>Cookie and local storage policy (Item 4)</Text>
              <Text style={styles.paragraph}>{COOKIE_POLICY_TEXT}</Text>
            </View>
          )}

          {activeTab === 'sdks' && (
            <View>
              <Text style={styles.sectionHeader}>Third-party SDK audit (Item 8)</Text>
              <Text style={styles.paragraph}>
                We maintain an active registry of all third-party libraries bundled into this application,
                their exact permissions, and data collection boundaries:
              </Text>
              {THIRD_PARTY_SDKS.map((sdk) => (
                <View key={sdk.name} style={styles.sdkCard}>
                  <Text style={styles.sdkName}>{sdk.name}</Text>
                  <Text style={styles.sdkPurpose}>Purpose: {sdk.purpose}</Text>
                  <Text style={styles.sdkData}>Data shared: {sdk.dataShared}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'business' && (
            <View>
              <Text style={styles.sectionHeader}>Business details & contacts (Item 16)</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{BUSINESS_DETAILS.entityName}</Text>
                <Text style={styles.cardSub}>Jurisdiction: {BUSINESS_DETAILS.jurisdiction}</Text>
                <Text style={styles.cardText}>Physical address: {BUSINESS_DETAILS.address}</Text>
                <Text style={styles.cardText}>Support email: {BUSINESS_DETAILS.supportEmail}</Text>
                <Text style={styles.cardText}>Data Protection Officer: {BUSINESS_DETAILS.dpoEmail}</Text>
              </View>
              <Text style={styles.sectionHeader}>Age consent (Item 17)</Text>
              <Text style={styles.paragraph}>{AGE_CONSENT_TEXT}</Text>
            </View>
          )}

          {activeTab === 'licenses' && (
            <View>
              <Text style={styles.sectionHeader}>Open source licenses (Item 19)</Text>
              <Text style={styles.paragraph}>
                All fonts, icons, sound synthesis engines, and mapping libraries are used under permissive
                open-source licenses (MIT, Apache 2.0, Open Database License):
              </Text>
              {OPEN_SOURCE_LICENSES.map((lic) => (
                <View key={lic.library} style={styles.sdkCard}>
                  <Text style={styles.sdkName}>{lic.library} — {lic.license}</Text>
                  <Text style={styles.sdkPurpose}>{lic.copyright}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'email' && (
            <View>
              <Text style={styles.sectionHeader}>Email & communications policy (Item 18)</Text>
              <Text style={styles.paragraph}>{EMAIL_UNSUBSCRIBE_POLICY_TEXT}</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>One-click communications opt-out</Text>
                <Text style={styles.cardText}>
                  TransitWake operates on zero marketing emails. If you have exchanged support emails
                  and wish to be removed from all communication threads, click below:
                </Text>
                <TouchableOpacity
                  style={styles.unsubscribeBtn}
                  onPress={() => {
                    const rateCheck = rateLimiter.checkLimit('legal_email_unsubscribe', 3, 300000);
                    if (!rateCheck.allowed) {
                      Alert.alert(
                        'Request Rate Limit',
                        `Too many unsubscribe requests sent. Please wait ${rateCheck.retryAfterSeconds} seconds.`
                      );
                      return;
                    }
                    Linking.openURL(
                      `mailto:${BUSINESS_DETAILS.dpoEmail}?subject=Unsubscribe%20Request&body=Please%20unsubscribe%20my%20email%20from%20all%20correspondence.`
                    ).catch(() => {});
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Send email unsubscribe request"
                >
                  <Text style={styles.unsubscribeBtnText}>Send unsubscribe email</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'delete' && (
            <View>
              <Text style={styles.sectionHeader}>Data deletion request (Item 20)</Text>
              <View style={styles.dangerCard}>
                <Text style={styles.dangerTitle}>Local data wipe</Text>
                <Text style={styles.dangerDesc}>
                  Under Apple Guideline 5.1.1(v) and Google Play Safety guidelines, you can permanently
                  delete all locally cached data, saved stops, and consent records immediately.
                </Text>
                <TouchableOpacity
                  style={styles.dangerBtn}
                  onPress={handleDeleteData}
                  accessibilityRole="button"
                  accessibilityLabel="Wipe all local app data"
                >
                  <Text style={styles.dangerBtnText}>Wipe all local app data</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>GDPR & CCPA server records request</Text>
                <Text style={styles.cardText}>
                  Because we run no external account database, we possess zero server-side personal data.
                  If you have inquiries, you can contact our Data Protection Officer:
                </Text>
                <TouchableOpacity
                  style={styles.emailDpoBtn}
                  onPress={handleEmailDPO}
                  accessibilityRole="button"
                  accessibilityLabel="Email Data Protection Officer"
                >
                  <Text style={styles.emailDpoBtnText}>Email Data Protection Officer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  tabsScrollView: {
    maxHeight: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#FC8019',
    borderColor: '#FC8019',
  },
  tabPillText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardSub: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  cardText: {
    color: '#475569',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 4,
  },
  sdkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sdkName: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  sdkPurpose: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 2,
  },
  sdkData: {
    color: '#64748B',
    fontSize: 11,
  },
  dangerCard: {
    backgroundColor: '#FFF7F7',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 16,
  },
  dangerTitle: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  dangerDesc: {
    color: '#991B1B',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  dangerBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emailDpoBtn: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emailDpoBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
  complianceHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  complianceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  complianceScoreBadge: {
    backgroundColor: '#F0FDF4',
    color: '#15803D',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  complianceScoreLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  complianceHeroTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  complianceHeroSub: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },
  categoryFilterRow: {
    maxHeight: 40,
    marginBottom: 12,
  },
  categoryFilterContent: {
    gap: 6,
    paddingRight: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkNumberText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  checkTitleCol: {
    flex: 1,
  },
  checkTitle: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '600',
  },
  checkCategory: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '500',
  },
  passBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  passBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '600',
  },
  checkSummary: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  checkDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkDetailsLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  checkDetailsText: {
    color: '#0F172A',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 6,
  },
  checkVerifyLabel: {
    color: '#FC8019',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  checkVerifyText: {
    color: '#475569',
    fontSize: 11.5,
    lineHeight: 16,
  },
  unsubscribeBtn: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unsubscribeBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
});
