import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { parseMentionsWithData, mentionToPlainText } from '@/types/mention';
import { useThemeColors } from '@/contexts/ThemeColors';

interface MentionDisplayProps {
  content: string;
  style?: any;
  textStyle?: any;
  numberOfLines?: number;
}

/**
 * Get initials from a display name
 */
function getInitialsFromName(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Component to display text with mentions rendered as styled inline pills
 * Parses @[Name](id) format and renders mentions as styled elements
 *
 * When numberOfLines is provided, uses nested Text for proper truncation
 */
export function MentionDisplay({ content, style, textStyle, numberOfLines }: MentionDisplayProps) {
  const colors = useThemeColors();

  const parts = useMemo(() => {
    if (!content) return [];

    const mentions = parseMentionsWithData(content);
    if (mentions.length === 0) {
      return [{ type: 'text' as const, value: content }];
    }

    const result: Array<{ type: 'text' | 'mention'; value: string; userId?: number }> = [];
    let lastIndex = 0;

    // Sort mentions by start_index
    const sortedMentions = [...mentions].sort((a, b) => a.start_index - b.start_index);

    for (const mention of sortedMentions) {
      // Add text before this mention
      if (mention.start_index > lastIndex) {
        result.push({
          type: 'text',
          value: content.substring(lastIndex, mention.start_index)
        });
      }

      // Add the mention
      result.push({
        type: 'mention',
        value: mention.display_name,
        userId: mention.user_id
      });

      lastIndex = mention.end_index;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        value: content.substring(lastIndex)
      });
    }

    return result;
  }, [content]);

  if (!content) return null;

  // When numberOfLines is specified, use nested Text for proper truncation
  if (numberOfLines !== undefined) {
    return (
      <Text
        numberOfLines={numberOfLines}
        style={[styles.text, { color: colors.mutedForeground }, textStyle]}
      >
        {parts.map((part, index) => {
          if (part.type === 'mention') {
            return (
              <Text
                key={index}
                style={[styles.inlineMention, { backgroundColor: '#E8F5E9', color: '#2E7D32' }]}
              >
                @{part.value}
              </Text>
            );
          }
          return <Text key={index}>{part.value}</Text>;
        })}
      </Text>
    );
  }

  // Full pill display (for detail views, comment sections, etc.)
  return (
    <View style={[styles.container, style]}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <View
              key={index}
              style={[
                styles.mentionPill,
                { backgroundColor: '#E8F5E9' } // Light green like the reference
              ]}
            >
              {/* Initials avatar */}
              <View style={[styles.avatar, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.avatarText}>
                  {getInitialsFromName(part.value)}
                </Text>
              </View>
              <Text style={[styles.mentionName, { color: '#2E7D32' }]}>
                {part.value}
              </Text>
            </View>
          );
        }
        // Regular text
        return (
          <Text
            key={index}
            style={[styles.text, { color: colors.foreground }, textStyle]}
          >
            {part.value}
          </Text>
        );
      })}
    </View>
  );
}

/**
 * Simple version that just converts mentions to @Name format without styling
 * Useful for plain text contexts - handles both library and original formats
 */
export function MentionPlainText({ content, style }: MentionDisplayProps) {
  const colors = useThemeColors();

  const plainText = useMemo(() => mentionToPlainText(content), [content]);

  return <Text style={[{ color: colors.foreground }, style]}>{plainText}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  inlineMention: {
    fontWeight: '600',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  mentionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingRight: 10,
    paddingLeft: 2,
    paddingVertical: 2,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  mentionName: {
    fontSize: 14,
    fontWeight: '500',
  },
});
