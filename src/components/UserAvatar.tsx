import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { UserProfile } from '../types/auth';

interface UserAvatarProps {
  user: UserProfile;
  onPress: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, onPress }) => {
  const isGoogle = !user.isGuest && user.provider === 'google';

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name[0] || 'U').toUpperCase();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={
        isGoogle ? `Account: ${user.displayName}. Tap for settings.` : 'Guest mode. Tap to sign in.'
      }
    >
      {isGoogle && user.photoUrl ? (
        <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
      ) : isGoogle ? (
        <View style={[styles.avatarCircle, styles.avatarGoogle]}>
          <Text style={styles.initialsText}>{getInitials(user.displayName)}</Text>
        </View>
      ) : (
        <View style={[styles.avatarCircle, styles.avatarGuest]}>
          <View style={styles.guestDot} />
        </View>
      )}

      <View style={styles.textColumn}>
        <Text style={styles.userName} numberOfLines={1}>
          {isGoogle ? user.displayName : 'Guest commuter'}
        </Text>
        <Text style={styles.userStatus}>
          {isGoogle ? 'Cloud synced' : 'Local only'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    marginRight: 6,
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarGoogle: {
    backgroundColor: '#0F172A',
  },
  avatarGuest: {
    backgroundColor: '#E2E8F0',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  guestDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
  },
  textColumn: {
    flexShrink: 1,
  },
  userName: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '600',
  },
  userStatus: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '500',
  },
});
