import React from 'react';
import { View, Pressable, Image as RNImage } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { shadowPresets } from '../utils/useShadow';

interface ImageAttachmentProps {
  uri: string;
  onRemove: () => void;
  size?: 'small' | 'medium' | 'large';
  showFileName?: boolean;
  fileName?: string;
}

export default function ImageAttachment({
  uri,
  onRemove,
  size = 'small',
  showFileName = false,
  fileName,
}: ImageAttachmentProps) {
  const sizeMap = {
    small: { container: 56, image: 56 },
    medium: { container: 64, image: 64 },
    large: { container: 100, image: 100 },
  };

  const { container, image } = sizeMap[size];

  if (showFileName && fileName) {
    return (
      <View
        className="bg-muted dark:bg-darkMuted border border-border dark:border-darkBorder rounded-xl px-3 py-2 flex-row items-center gap-3"
        style={shadowPresets.medium}
      >
        <View className="w-11 h-11 rounded-lg bg-background dark:bg-darkBackground items-center justify-center">
          <Icon name="Image" size={20} />
        </View>
        <View className="flex-1">
          <ThemedText className="text-sm font-medium" numberOfLines={1}>
            {fileName}
          </ThemedText>
          <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
            File
          </ThemedText>
        </View>
        <Pressable onPress={onRemove} className="w-5 h-5 items-center justify-center">
          <Icon name="X" size={12} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ width: container, height: container, position: 'relative' }}>
      <RNImage
        source={{ uri }}
        style={{
          width: image,
          height: image,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />
      <Pressable
        onPress={onRemove}
        className="absolute -top-1 -right-1 w-5 h-5 bg-background dark:bg-darkBackground rounded-full items-center justify-center border border-border dark:border-darkBorder"
        style={shadowPresets.small}
      >
        <Icon name="X" size={12} />
      </Pressable>
    </View>
  );
}

