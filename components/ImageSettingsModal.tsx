import React, { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { Chip } from './shared/Chip';
import { shadowPresets } from '../utils/useShadow';

interface ImageSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedStyle?: string;
  selectedRatio?: string;
  onStyleSelect?: (style: string) => void;
  onRatioSelect?: (ratio: string) => void;
}

const styles = [
  'Photorealistic',
  'Digital Art',
  '3D Render',
  'Anime',
  'Cinematic',
  'Watercolor',
  'Oil Painting',
  'Pencil Sketch',
  'Charcoal',
  'Comic Book',
  'Pixel Art',
  'Low Poly',
  'Isometric',
  'Vector',
  'Cyberpunk',
  'Fantasy',
  'Minimalist',
  'Vintage',
  'Vaporwave',
  'Abstract',
];

const ratios = [
  { label: '1:1 Square', value: '1:1' },
  { label: '16:9 Wide', value: '16:9' },
  { label: '9:16 Social Story', value: '9:16' },
  { label: '2:3 Portrait', value: '2:3' },
  { label: '3:4 Traditional', value: '3:4' },
  { label: '1:2 Vertical', value: '1:2' },
  { label: '2:1 Horizontal', value: '2:1' },
  { label: '4:5 Social Post', value: '4:5' },
  { label: '3:2 Standard', value: '3:2' },
  { label: '4:3 Classic', value: '4:3' },
];

export default function ImageSettingsModal({
  visible,
  onClose,
  selectedStyle,
  selectedRatio,
  onStyleSelect,
  onRatioSelect,
}: ImageSettingsModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-black/40"
        style={{ paddingTop: insets.top }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />
        <View
          className="bg-light-primary dark:bg-dark-primary rounded-t-3xl"
          style={{
            paddingBottom: insets.bottom + 16,
            paddingTop: 16,
            paddingHorizontal: 16,
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <ThemedText className="text-base font-semibold">Style</ThemedText>
            <Pressable onPress={onClose} className="w-7 h-7 items-center justify-center">
              <Icon name="X" size={14} />
            </Pressable>
          </View>

          {/* Style Selection */}
          <View className="mb-8">
            <View className="flex-row flex-wrap gap-2">
              {styles.map((style) => (
                <Chip
                  key={style}
                  label={style}
                  isSelected={selectedStyle === style}
                  onPress={() => onStyleSelect?.(style)}
                />
              ))}
            </View>
          </View>

          {/* Ratio Selection */}
          <View>
            <ThemedText className="text-base font-semibold mb-4">Ratio</ThemedText>
            <View className="flex-row flex-wrap gap-2">
              {ratios.map((ratio) => (
                <Chip
                  key={ratio.value}
                  label={ratio.label}
                  isSelected={selectedRatio === ratio.value}
                  onPress={() => onRatioSelect?.(ratio.value)}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

