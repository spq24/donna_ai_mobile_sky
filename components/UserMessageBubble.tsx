import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import ThemedText from './shared/ThemedText';
import Icon from './shared/Icon';
import { MentionDisplay } from './mentions';
import { shadowPresets } from '../utils/useShadow';

interface UserMessageBubbleProps {
  content: string;
  onCopy?: () => void;
  onEdit?: () => void;
  collapsible?: boolean;
  maxCollapsedLines?: number;
}

export default function UserMessageBubble({
  content,
  onCopy,
  onEdit,
  collapsible = false,
  maxCollapsedLines = 3,
}: UserMessageBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowCollapse = collapsible && content.length > 150;

  return (
    <View className="flex-col gap-3 items-end mb-4">
      {/* Message Bubble */}
      <View
        className="bg-light-secondary dark:bg-dark-secondary border border-light-secondary dark:border-dark-secondary rounded-2xl rounded-tr-sm px-4 py-4 max-w-[85%] flex-row items-start gap-3"
        style={shadowPresets.medium}
      >
        <View className="flex-1">
          <MentionDisplay
            content={content}
            numberOfLines={shouldShowCollapse && !isExpanded ? maxCollapsedLines : undefined}
            textStyle={{ fontSize: 14, lineHeight: 20 }}
          />
        </View>
        {shouldShowCollapse && (
          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            className="w-5 h-5 items-center justify-center flex-shrink-0 mt-0.5"
          >
            <Icon
              name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
              size={20}
            />
          </Pressable>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 items-center">
        <Pressable onPress={onCopy} className="w-4 h-4 items-center justify-center">
          <Icon name="Copy" size={16} />
        </Pressable>
        <Pressable onPress={onEdit} className="w-4 h-4 items-center justify-center">
          <Icon name="Pencil" size={16} />
        </Pressable>
      </View>
    </View>
  );
}

