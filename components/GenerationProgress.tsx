import React from 'react';
import { View } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { shadowPresets } from '../utils/useShadow';

interface GenerationProgressProps {
  type: 'image' | 'video';
  message?: string;
  subMessage?: string;
}

export default function GenerationProgress({
  type,
  message = `Generating your ${type} ....`,
  subMessage = 'This process can take 1-2 mins',
}: GenerationProgressProps) {
  return (
    <View
      className="bg-muted dark:bg-darkMuted border border-border dark:border-darkBorder rounded-2xl px-4 py-3 flex-row items-center gap-3"
      style={shadowPresets.medium}
    >
      {/* Progress Icon */}
      <View className="w-10 h-10 rounded-full bg-background dark:bg-darkBackground items-center justify-center relative">
        <View className="w-10 h-10 rounded-full bg-light-secondary/50 dark:bg-dark-secondary/50 absolute" />
        <Icon
          name={type === 'image' ? 'Image' : 'Play'}
          size={20}
        />
      </View>

      {/* Progress Text */}
      <View className="flex-1 flex-col gap-1">
        <ThemedText className="text-sm font-normal">
          {message}
        </ThemedText>
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
          {subMessage}
        </ThemedText>
      </View>
    </View>
  );
}

