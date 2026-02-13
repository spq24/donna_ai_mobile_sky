import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import MediaGrid from './MediaGrid';
import ChatHeader from './ChatHeader';
import { shadowPresets } from '../utils/useShadow';
import { useAuth } from '@/contexts/AuthContext';

type MediaTab = 'images' | 'videos';

interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

interface MediaScreenProps {
  onItemPress?: (item: MediaItem) => void;
  onRemoveAll?: () => void;
  onMenuPress?: () => void;
}

export default function MediaScreen({
  onItemPress,
  onRemoveAll,
  onMenuPress,
}: MediaScreenProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MediaTab>('images');

  // Mock data - in real app, this would come from storage/API
  const mockImages: MediaItem[] = [
    { id: '1', uri: 'https://picsum.photos/200/300?random=1', type: 'image' },
    { id: '2', uri: 'https://picsum.photos/200/300?random=2', type: 'image' },
    { id: '3', uri: 'https://picsum.photos/200/300?random=3', type: 'image' },
    { id: '4', uri: 'https://picsum.photos/200/300?random=4', type: 'image' },
    { id: '5', uri: 'https://picsum.photos/200/300?random=5', type: 'image' },
    { id: '6', uri: 'https://picsum.photos/200/300?random=6', type: 'image' },
    { id: '7', uri: 'https://picsum.photos/200/300?random=7', type: 'image' },
    { id: '8', uri: 'https://picsum.photos/200/300?random=8', type: 'image' },
  ];

  const mockVideos: MediaItem[] = [
    { id: 'v1', uri: '', type: 'video' },
    { id: 'v2', uri: '', type: 'video' },
    { id: 'v3', uri: '', type: 'video' },
    { id: 'v4', uri: '', type: 'video' },
  ];

  const currentItems = activeTab === 'images' ? mockImages : mockVideos;

  return (
    <View className="flex-1 bg-background dark:bg-darkBackground">
      {/* Chat Header */}
      <ChatHeader
        onMenuPress={onMenuPress}
      />

      {/* Header with Tabs */}
      <View className="px-4 pt-5 pb-4 flex-row items-center justify-between">
        {/* Tabs */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'images'
                ? 'bg-foreground dark:bg-darkForeground'
                : 'bg-muted dark:bg-darkMuted'
            }`}
            style={activeTab === 'images' ? shadowPresets.small : undefined}
          >
            <ThemedText
              className={`text-sm ${
                activeTab === 'images'
                  ? 'text-foreground dark:text-darkForeground font-medium'
                  : 'text-muted-foreground dark:text-darkMutedForeground'
              }`}
            >
              Images
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'videos'
                ? 'bg-foreground dark:bg-darkForeground'
                : 'bg-muted dark:bg-darkMuted'
            }`}
            style={activeTab === 'videos' ? shadowPresets.small : undefined}
          >
            <ThemedText
              className={`text-sm ${
                activeTab === 'videos'
                  ? 'text-foreground dark:text-darkForeground font-medium'
                  : 'text-muted-foreground dark:text-darkMutedForeground'
              }`}
            >
              Videos
            </ThemedText>
          </Pressable>
        </View>

        {/* Remove All Button */}
        <Pressable
          onPress={onRemoveAll}
          className="px-3 py-2 rounded-lg bg-muted dark:bg-darkMuted"
        >
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
            Remove All
          </ThemedText>
        </Pressable>
      </View>

      {/* Media Grid */}
      <MediaGrid
        items={currentItems}
        onItemPress={onItemPress}
        onItemLongPress={(item) => {
          // Handle long press for selection/delete
          console.log('Long press:', item.id);
        }}
      />
    </View>
  );
}

