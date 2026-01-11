import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import Avatar from './shared/Avatar';

interface ChatHeaderProps {
  onMenuPress?: () => void;
  onTitlePress?: () => void;
  userName?: string;
  userAvatar?: string;
}

export default function ChatHeader({
  onMenuPress,
  onTitlePress,
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

      {/* SkyAI 5o Title with Dropdown */}
      <Pressable
        onPress={onTitlePress}
        className="flex-row items-center gap-2 px-3 py-1.5 rounded-full border border-light-secondary dark:border-dark-secondary bg-light-primary dark:bg-dark-primary"
      >
        <Icon name="Hexagon" size={14} className="text-dark-primary dark:text-light-primary" />
        <ThemedText className="text-sm font-medium">SkyAI 5o</ThemedText>
        <Icon name="ChevronDown" size={16} />
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

