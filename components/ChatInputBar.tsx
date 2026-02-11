import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';

interface ChatInputBarProps {
  placeholder?: string;
  onPlusPress?: () => void;
  onMicPress?: () => void;
  onSendPress?: () => void;
}

export default function ChatInputBar({
  placeholder = 'Ask AI anything',
  onPlusPress,
  onMicPress,
  onSendPress,
}: ChatInputBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="px-4 pb-2">
      <View className="bg-background dark:bg-darkBackground border border-border dark:border-darkBorder rounded-2xl shadow-sm overflow-hidden">
        {/* Placeholder Text */}
        <View className="px-2 pt-4">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
            {placeholder}
          </ThemedText>
        </View>

        {/* Input Row */}
        <View className="flex-row items-center gap-3 px-2 pb-2">
          {/* Plus Button */}
          <Pressable
            onPress={onPlusPress}
            className="w-9 h-9 rounded-full border border-border dark:border-darkBorder items-center justify-center bg-background dark:bg-darkBackground"
          >
            <Icon name="Plus" size={20} />
          </Pressable>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Microphone Button */}
          <Pressable
            onPress={onMicPress}
            className="w-9 h-9 rounded-full border border-border dark:border-darkBorder items-center justify-center bg-background dark:bg-darkBackground"
          >
            <Icon name="Mic" size={20} />
          </Pressable>

          {/* Send Button */}
          <Pressable
            onPress={onSendPress}
            className="w-9 h-9 rounded-full items-center justify-center bg-foreground dark:bg-darkForeground"
          >
            <Icon name="ArrowUp" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Home Indicator */}
      <View
        className="h-8.5 items-center justify-end"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <View className="w-33.5 h-1.25 rounded-full bg-foreground dark:bg-darkForeground" />
      </View>
    </View>
  );
}

