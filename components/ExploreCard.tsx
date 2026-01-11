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
      className="bg-light-secondary dark:bg-dark-secondary border border-light-secondary dark:border-dark-secondary rounded-2xl p-3 flex-1 min-w-[165.5] max-w-[165.5]"
      style={shadowPresets.medium}
    >
      <Icon name={icon as any} size={20} />
      <View className="mt-4">
        <ThemedText className="text-base font-semibold mb-1">
          {title}
        </ThemedText>
        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
          {description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

