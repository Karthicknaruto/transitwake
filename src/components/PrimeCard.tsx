import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { subscriptionService } from '../services/subscriptionService';
import { PrimeSubscriptionState } from '../types/subscription';

interface PrimeCardProps {
  onOpenPrimeModal: () => void;
}

export const PrimeCard: React.FC<PrimeCardProps> = ({ onOpenPrimeModal }) => {
  const [state, setState] = useState<PrimeSubscriptionState>(() => subscriptionService.getState());
  const isAdFree = subscriptionService.isAdFree();

  useEffect(() => {
    return subscriptionService.subscribe((updated) => {
      setState(updated);
    });
  }, []);

  const formatDate = (epochMs: number | null) => {
    if (!epochMs) return '';
    const date = new Date(epochMs);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isGracePeriod = state.status === 'cancelled_grace_period';

  return (
    <View
      style={styles.card}
      accessible={true}
      accessibilityRole="region"
      accessibilityLabel={`TransitWake Prime status: ${isAdFree ? 'active' : 'free tier'}`}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>TransitWake Prime</Text>
          <Text style={styles.pricing}>₹26 per month</Text>
        </View>

        <View
          style={[
            styles.badge,
            isAdFree ? styles.badgeActive : styles.badgeFree,
          ]}
        >
          {isAdFree && <View style={styles.activeDot} />}
          <Text
            style={[
              styles.badgeText,
              isAdFree ? styles.badgeTextActive : styles.badgeTextFree,
            ]}
          >
            {isAdFree
              ? isGracePeriod
                ? 'Cancels soon'
                : 'Active'
              : 'Free tier'}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {isAdFree
          ? isGracePeriod
            ? `Your ad-free benefits remain active until ${formatDate(state.expiresAt)}.`
            : `Ad-free transit active. Auto-renews on ${formatDate(state.expiresAt)}.`
          : 'Completely removes banner and interstitial advertisements across all screens.'}
      </Text>

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isAdFree ? styles.manageButton : styles.upgradeButton,
          ]}
          onPress={onOpenPrimeModal}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isAdFree ? 'Manage Prime subscription' : 'Upgrade to Prime for 26 rupees per month'}
        >
          <Text
            style={[
              styles.actionButtonText,
              isAdFree ? styles.manageButtonText : styles.upgradeButtonText,
            ]}
          >
            {isAdFree ? 'Manage subscription' : 'Upgrade for ₹26/month'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  pricing: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  badgeFree: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FC8019',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextActive: {
    color: '#9A3412',
  },
  badgeTextFree: {
    color: '#64748B',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#0F172A',
  },
  manageButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
  },
  manageButtonText: {
    color: '#0F172A',
  },
});
