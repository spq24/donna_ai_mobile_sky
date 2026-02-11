import React from 'react';
import { View, Pressable, Image, ScrollView } from 'react-native';
import { shadowPresets } from '../utils/useShadow';

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

interface MediaGridProps {
  items: MediaItem[];
  onItemPress?: (item: MediaItem) => void;
  onItemLongPress?: (item: MediaItem) => void;
}

export default function MediaGrid({
  items,
  onItemPress,
  onItemLongPress,
}: MediaGridProps) {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
      }}
    >
      <View className="flex-row flex-wrap gap-2">
        {items.map((item, index) => {
          const isEven = index % 2 === 0;
          return (
            <Pressable
              key={item.id}
              onPress={() => onItemPress?.(item)}
              onLongPress={() => onItemLongPress?.(item)}
              className="w-[165.5] h-40 rounded-2xl overflow-hidden"
              style={shadowPresets.medium}
            >
              {item.type === 'image' ? (
                <Image
                  source={{ uri: item.uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-muted dark:bg-darkMuted items-center justify-center">
                  <View className="w-12 h-12 rounded-full bg-background dark:bg-darkBackground items-center justify-center">
                    {/* Video play icon would go here */}
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

