import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { shadowPresets } from '../utils/useShadow';

interface ExploreCardProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}

export default function ExploreCard({
  icon,
  title,
  description,
  onPress,
}: ExploreCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-muted dark:bg-darkMuted border border-border dark:border-darkBorder rounded-2xl p-3 flex-1 min-w-[165.5] max-w-[165.5]"
      style={shadowPresets.medium}
    >
      <Icon name={icon as any} size={20} />
      <View className="mt-4">
        <ThemedText className="text-base font-semibold mb-1">
          {title}
        </ThemedText>
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
          {description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

