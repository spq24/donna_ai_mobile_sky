import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import ExploreCard from './ExploreCard';
import FeaturedSection from './FeaturedSection';
import ThemedScroller from './shared/ThemeScroller';
import { shadowPresets } from '../utils/useShadow';

interface ExploreScreenProps {
  onCardPress?: (cardId: string) => void;
  onLearnMorePress?: () => void;
}

export default function ExploreScreen({
  onCardPress,
  onLearnMorePress,
}: ExploreScreenProps) {
  const exploreCards = [
    {
      id: 'image-library',
      icon: 'Image',
      title: 'Explore Image Library',
      description: 'Discover images created by others.',
    },
    {
      id: 'writing-tools',
      icon: 'PenTool',
      title: 'Explore Writing Tools',
      description: 'Create stories or new content ideas.',
    },
    {
      id: 'ai-assistant',
      icon: 'Zap',
      title: 'Explore AI Assistant',
      description: 'Ask anything for facts or advice.',
    },
    {
      id: 'ai-prompts',
      icon: 'Zap',
      title: 'Browse AI Prompts',
      description: 'Seek guidance to find the best solution.',
    },
  ];

  const featuredVideos = [
    { id: '1', title: 'Video 1' },
    { id: '2', title: 'Video 2' },
    { id: '3', title: 'Video 3' },
    { id: '4', title: 'Video 4' },
  ];

  const narrationVoices = [
    { id: '1', title: 'Voice 1' },
    { id: '2', title: 'Voice 2' },
    { id: '3', title: 'Voice 3' },
    { id: '4', title: 'Voice 4' },
  ];

  return (
    <ThemedScroller
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 16, paddingHorizontal: 16 }}
    >
      {/* Hero Section */}
      <View className="mb-8 relative overflow-hidden rounded-3xl bg-light-secondary/50 dark:bg-dark-secondary/50" style={{ minHeight: 220 }}>
        <View className="p-6 items-center">
          <View className="w-11 h-11 rounded-full bg-foreground dark:bg-darkForeground items-center justify-center mb-4">
            <View className="w-5.5 h-5.5 rounded-full bg-background dark:bg-darkBackground" />
          </View>
          <ThemedText className="text-2xl font-bold mb-2 text-center">
            Introducing SkyAI
          </ThemedText>
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground text-center mb-6">
            Discover worlds beyond imagination with SkyAI
          </ThemedText>
          <Pressable
            onPress={onLearnMorePress}
            className="bg-foreground dark:bg-darkForeground px-4 py-2 rounded-full"
          >
            <ThemedText className="text-sm font-medium text-foreground dark:text-darkForeground">
              Learn more
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Explore Cards Grid */}
      <View className="mb-8">
        <View className="flex-row flex-wrap gap-4 mb-4">
          {exploreCards.slice(0, 2).map((card) => (
            <ExploreCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              description={card.description}
              onPress={() => onCardPress?.(card.id)}
            />
          ))}
        </View>
        <View className="flex-row flex-wrap gap-4">
          {exploreCards.slice(2, 4).map((card) => (
            <ExploreCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              description={card.description}
              onPress={() => onCardPress?.(card.id)}
            />
          ))}
        </View>
      </View>

      {/* Featured Videos */}
      <FeaturedSection
        title="Featured Videos"
        items={featuredVideos}
        onItemPress={(item) => console.log('Video pressed:', item.id)}
      />

      {/* Narration Voices */}
      <FeaturedSection
        title="Narration Voices"
        items={narrationVoices}
        onItemPress={(item) => console.log('Voice pressed:', item.id)}
      />
    </ThemedScroller>
  );
}

