import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCounts } from '@novu/react-native';
import { useAuth } from '@/contexts/AuthContext';
import { NovuSafeProvider, novuConfigured } from './NovuWrapper';
import Icon from './shared/Icon';
import Avatar from './shared/Avatar';

/**
 * Inner bell that calls useCounts with the required filters arg.
 * Must be rendered inside NovuSafeProvider.
 */
function NovuBellInner({ onPress }: { onPress?: () => void }) {
  const { counts } = useCounts({ filters: [{ read: false }] });
  const unreadCount = counts?.[0]?.count ?? 0;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      className="w-10 h-10 rounded-full border border-border dark:border-darkBorder items-center justify-center bg-background dark:bg-darkBackground"
    >
      <Icon name="Bell" size={20} />
      {unreadCount > 0 && (
        <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** Bell icon that self-wraps with NovuSafeProvider when Novu is configured. */
function NotificationBell({ onPress }: { onPress?: () => void }) {
  if (!novuConfigured) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="w-10 h-10 rounded-full border border-border dark:border-darkBorder items-center justify-center bg-background dark:bg-darkBackground"
      >
        <Icon name="Bell" size={20} />
      </Pressable>
    );
  }

  return (
    <NovuSafeProvider>
      <NovuBellInner onPress={onPress} />
    </NovuSafeProvider>
  );
}

interface ChatHeaderProps {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

export default function ChatHeader({
  onMenuPress,
  onNotificationPress,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* Menu Button */}
      <Pressable
        onPress={onMenuPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="w-10 h-10 rounded-full border border-border dark:border-darkBorder items-center justify-center bg-background dark:bg-darkBackground"
      >
        <Icon name="Menu" size={20} />
      </Pressable>

      <View className="flex-row items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell onPress={onNotificationPress} />

        {/* Profile Avatar — uses OAuth image when available, initials fallback */}
        <Avatar
          size="sm"
          src={user?.avatar_url || undefined}
          name={user?.full_name}
          email={user?.email}
          className="rounded-full"
        />
      </View>
    </View>
  );
}
