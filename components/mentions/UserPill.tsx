import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import type { MentionUser } from '@/types/mention';

interface UserPillProps {
  user: MentionUser;
  onRemove?: () => void;
  editable?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Get initials from user name or email
 */
export function getInitials(user: MentionUser): string {
  if (user.full_name) {
    const parts = user.full_name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.full_name.substring(0, 2).toUpperCase();
  }
  return user.email.substring(0, 2).toUpperCase();
}

/**
 * Get display name from user
 */
export function getDisplayName(user: MentionUser): string {
  return user.full_name || user.email.split('@')[0];
}

/**
 * User pill component displaying a mentioned user as an inline chip
 * Styled to match the reference design with light green background
 */
export function UserPill({ user, onRemove, editable = false, size = 'md' }: UserPillProps) {
  const avatarSize = size === 'sm' ? 20 : 26;
  const fontSize = size === 'sm' ? 12 : 14;
  const paddingVertical = size === 'sm' ? 2 : 4;
  const paddingRight = size === 'sm' ? 8 : 12;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: '#E8F5E9', // Light green background
          paddingVertical,
          paddingRight: editable ? 6 : paddingRight,
        }
      ]}
    >
      {/* Avatar */}
      {user.avatar_url ? (
        <Image
          source={{ uri: user.avatar_url }}
          style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.avatarFallback,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: '#4CAF50', // Green for initials
            }
          ]}
        >
          <Text style={[styles.avatarText, { fontSize: avatarSize * 0.4 }]}>
            {getInitials(user)}
          </Text>
        </View>
      )}

      {/* Name */}
      <Text style={[styles.name, { fontSize, color: '#2E7D32' }]} numberOfLines={1}>
        {getDisplayName(user)}
      </Text>

      {/* Remove button */}
      {editable && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={14} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingLeft: 3,
    marginRight: 4,
    marginVertical: 2,
  },
  avatar: {
    marginRight: 6,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    fontWeight: '600',
    color: 'white',
  },
  name: {
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 4,
    padding: 4,
  },
});
