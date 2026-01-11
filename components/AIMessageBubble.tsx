import React from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { shadowPresets } from '../utils/useShadow';

interface AIMessageBubbleProps {
  content: string;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onRegenerate?: () => void;
  onMore?: () => void;
  variantCount?: number;
  currentVariantIndex?: number;
  onVariantPrev?: () => void;
  onVariantNext?: () => void;
  isGeneratingVariant?: boolean;
  isRetrying?: boolean;
}

export default function AIMessageBubble({
  content,
  onThumbsUp,
  onThumbsDown,
  onRegenerate,
  onMore,
  variantCount,
  currentVariantIndex,
  onVariantPrev,
  onVariantNext,
  isGeneratingVariant,
  isRetrying,
  ...props
}: AIMessageBubbleProps) {
  return (
    <View className="flex-row gap-3 items-start mb-4">
      {/* AI Avatar */}
      <View className="w-9 h-9 rounded-full bg-dark-primary dark:bg-light-primary items-center justify-center flex-shrink-0">
        <View className="w-4.5 h-4.5 rounded-full bg-light-primary dark:bg-dark-primary" />
      </View>

      {/* Message Content */}
      <View className="flex-1 flex-col gap-3">
        {/* Message Bubble */}
        <View
          className="bg-light-secondary dark:bg-dark-secondary rounded-2xl rounded-tl-sm px-4 py-4"
          style={shadowPresets.medium}
        >
          <ThemedText className={`text-sm leading-5 text-left whitespace-pre-wrap ${isRetrying ? 'text-light-subtext dark:text-dark-subtext' : ''}`}>
            {content}
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 items-center">
          {/* Variant Navigation */}
          {variantCount && variantCount > 1 && (
            <View className="flex-row items-center gap-1 mr-2">
              <Pressable
                onPress={onVariantPrev}
                disabled={currentVariantIndex === 0}
                className="w-4 h-4 items-center justify-center"
              >
                <Icon
                  name="ChevronLeft"
                  size={16}
                  color={currentVariantIndex === 0 ? undefined : undefined}
                />
              </Pressable>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                {((currentVariantIndex || 0) + 1)}/{variantCount}
              </ThemedText>
              <Pressable
                onPress={onVariantNext}
                disabled={currentVariantIndex === (variantCount - 1)}
                className="w-4 h-4 items-center justify-center"
              >
                <Icon
                  name="ChevronRight"
                  size={16}
                  color={currentVariantIndex === (variantCount - 1) ? undefined : undefined}
                />
              </Pressable>
            </View>
          )}
          <Pressable onPress={onThumbsUp} className="w-4 h-4 items-center justify-center">
            <Icon name="ThumbsUp" size={16} />
          </Pressable>
          <Pressable onPress={onThumbsDown} className="w-4 h-4 items-center justify-center">
            <Icon name="ThumbsDown" size={16} />
          </Pressable>
          <Pressable onPress={onRegenerate} className="w-4 h-4 items-center justify-center">
            <Icon name="RotateCcw" size={16} />
          </Pressable>
          <Pressable onPress={onMore} className="w-4 h-4 items-center justify-center">
            <Icon name="MoreVertical" size={16} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

