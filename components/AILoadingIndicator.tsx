import React from 'react';
import { View } from 'react-native';
import ThemedText from './shared/ThemedText';
import { shadowPresets } from '../utils/useShadow';

interface AILoadingIndicatorProps {
  status: 'analyzing' | 'generating' | 'searching';
}

const statusMessages = {
  analyzing: "Analyzing your message...",
  generating: "Generating your answer...",
  searching: "Searching the web for the latest info...",
};

export default function AILoadingIndicator({ status }: AILoadingIndicatorProps) {
  return (
    <View className="flex-row gap-3 items-center mb-4">
      {/* AI Avatar */}
      <View className="w-9 h-9 rounded-full bg-foreground dark:bg-darkForeground items-center justify-center flex-shrink-0">
        <View className="w-4.5 h-4.5 rounded-full bg-background dark:bg-darkBackground" />
      </View>

      {/* Loading Message */}
      <View
        className="bg-muted dark:bg-darkMuted rounded-2xl rounded-tl-sm px-4 py-2 flex-1"
        style={shadowPresets.medium}
      >
        <ThemedText className="text-sm leading-5 text-left">
          {statusMessages[status]}
        </ThemedText>
      </View>
    </View>
  );
}

