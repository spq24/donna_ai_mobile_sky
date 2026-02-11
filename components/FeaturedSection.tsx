import React from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import { shadowPresets } from '../utils/useShadow';

interface FeaturedItem {
  id: string;
  imageUrl?: string;
  title?: string;
}

interface FeaturedSectionProps {
  title: string;
  items: FeaturedItem[];
  onItemPress?: (item: FeaturedItem) => void;
}

export default function FeaturedSection({
  title,
  items,
  onItemPress,
}: FeaturedSectionProps) {
  return (
    <View className="mb-8">
      <ThemedText className="text-xl font-bold mb-4">
        {title}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onItemPress?.(item)}
            className="w-[200] h-[200] rounded-2xl overflow-hidden"
            style={shadowPresets.medium}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-muted dark:bg-darkMuted items-center justify-center">
                <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
                  {item.title || 'Item'}
                </ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

