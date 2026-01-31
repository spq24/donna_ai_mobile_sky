import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import { UserCardProps, CardMode } from '@/types/generative-ui';

/**
 * UserCard - Displays user/family member information
 */
export function UserCard({
  id,
  name,
  email,
  is_current_user = false,
  avatar_url,
  timezone,
  account_id,
  mode = 'view',
  onModeChange,
  onPress,
}: UserCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  // View Mode - Compact user card
  if (mode === 'view') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4"
      >
        <View className="flex-row items-center gap-3">
          <Avatar size="md" src={avatar_url || undefined} name={name || 'U'} />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <ThemedText className="text-base font-semibold" numberOfLines={1}>
                {name || 'Unknown User'}
              </ThemedText>
              {is_current_user && (
                <View className="bg-blue-100 dark:bg-blue-900 rounded-full px-2 py-0.5">
                  <ThemedText className="text-xs text-blue-600 dark:text-blue-300">
                    You
                  </ThemedText>
                </View>
              )}
            </View>
            {email && (
              <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext" numberOfLines={1}>
                {email}
              </ThemedText>
            )}
          </View>
          <Icon name="ChevronRight" size={20} />
        </View>
      </TouchableOpacity>
    );
  }

  // Detail Mode - Full user information
  return (
    <View className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <Avatar size="xl" src={avatar_url || undefined} name={name || 'U'} />
          <View>
            <View className="flex-row items-center gap-2">
              <ThemedText className="text-lg font-bold">{name || 'Unknown User'}</ThemedText>
              {is_current_user && (
                <View className="bg-blue-100 dark:bg-blue-900 rounded-full px-2 py-0.5">
                  <ThemedText className="text-xs text-blue-600 dark:text-blue-300">
                    You
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
              Family Member
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => onModeChange?.('view')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* User info rows */}
      <View className="gap-3">
        {/* Email */}
        {email && (
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-light-primary dark:bg-dark-primary items-center justify-center">
              <Icon name="Mail" size={18} />
            </View>
            <View className="flex-1">
              <ThemedText className="text-sm">{email}</ThemedText>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                Email
              </ThemedText>
            </View>
          </View>
        )}

        {/* Timezone */}
        {timezone && (
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-light-primary dark:bg-dark-primary items-center justify-center">
              <Icon name="Globe" size={18} />
            </View>
            <View className="flex-1">
              <ThemedText className="text-sm">{timezone}</ThemedText>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                Timezone
              </ThemedText>
            </View>
          </View>
        )}

        {/* Account ID */}
        {account_id && (
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl bg-light-primary dark:bg-dark-primary items-center justify-center">
              <Icon name="Users" size={18} />
            </View>
            <View className="flex-1">
              <ThemedText className="text-sm">Family Account</ThemedText>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                Account #{account_id}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      {!is_current_user && (
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="AtSign" size={16} color="#fff" />
            <ThemedText className="text-sm font-medium text-white">Assign Task</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-light-primary dark:bg-dark-primary rounded-xl py-3 flex-row items-center justify-center gap-2">
            <Icon name="Bell" size={16} />
            <ThemedText className="text-sm font-medium">Remind</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {is_current_user && (
        <TouchableOpacity className="mt-4 bg-light-primary dark:bg-dark-primary rounded-xl py-3 flex-row items-center justify-center gap-2">
          <Icon name="Settings" size={16} />
          <ThemedText className="text-sm font-medium">Edit Profile</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default UserCard;
