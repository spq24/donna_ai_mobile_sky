import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import Avatar from './shared/Avatar';

interface ChatHeaderProps {
  onMenuPress?: () => void;
  userName?: string;
  userAvatar?: string;
}

export default function ChatHeader({
  onMenuPress,
  userName = 'User',
  userAvatar,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 py-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* Menu Button */}
      <Pressable
        onPress={onMenuPress}
        className="w-10 h-10 rounded-full border border-light-secondary dark:border-dark-secondary items-center justify-center bg-light-primary dark:bg-dark-primary"
      >
        <Icon name="Menu" size={20} />
      </Pressable>

      {/* Profile Avatar */}
      <Avatar
        size="sm"
        src="https://i.pravatar.cc/150?u=jason"
        name={userName}
        className="rounded-full"
      />
    </View>
  );
}

