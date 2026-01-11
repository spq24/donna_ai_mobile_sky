import React from 'react';
import { View } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { Chip } from './shared/Chip';

interface GreetingSectionProps {
  userName?: string;
  onChipPress?: (label: string) => void;
}

export default function GreetingSection({
  userName = 'Jason',
  onChipPress,
}: GreetingSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View className="flex-col items-center justify-center gap-8 pt-8">
      {/* Avatar with animated background */}
      <View className="w-16 h-16 rounded-full bg-white dark:bg-dark-secondary items-center justify-center shadow-md overflow-hidden" style={{ elevation: 4 }}>
        <View className="absolute inset-0 bg-light-secondary dark:bg-dark-secondary opacity-50" />
        <Icon name="Sparkle" size={38} className="text-dark-primary dark:text-light-primary" />
      </View>

      {/* Greeting Text */}
      <View className="items-center gap-1">
        <ThemedText className="text-2xl font-semibold text-center leading-8 tracking-tight">
          {getGreeting()}, {userName}
        </ThemedText>
        <ThemedText className="text-2xl font-semibold text-center leading-8 tracking-tight">
          What's on your mind?
        </ThemedText>
      </View>

      {/* Quick Action Chips */}
      <View className="flex-row flex-wrap justify-center gap-3">
        <Chip
          label="Summarize Text"
          icon="FileText"
          iconSize={20}
          onPress={() => onChipPress?.('Summarize Text')}
          className="bg-light-secondary dark:bg-dark-secondary border border-light-secondary dark:border-dark-secondary rounded-full px-3 py-2"
        />
        <Chip
          label="Creative Writing"
          icon="PenTool"
          iconSize={20}
          onPress={() => onChipPress?.('Creative Writing')}
          className="bg-light-secondary dark:bg-dark-secondary border border-light-secondary dark:border-dark-secondary rounded-full px-3 py-2"
        />
        <Chip
          label="Answer Questions"
          icon="Zap"
          iconSize={20}
          onPress={() => onChipPress?.('Answer Questions')}
          className="bg-light-secondary dark:bg-dark-secondary border border-light-secondary dark:border-dark-secondary rounded-full px-3 py-2"
        />
      </View>
    </View>
  );
}

