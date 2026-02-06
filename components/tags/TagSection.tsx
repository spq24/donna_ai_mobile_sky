import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useTag } from '@/contexts/TagContext';
import { Tag } from '@/types/tag';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';

interface TagSectionProps {
  entityType: 'task' | 'listitem';
  entityId: number;
  canEdit?: boolean;
}

// Generate a consistent color for a tag based on its name
function getTagColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400' },
    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-400' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-800 dark:text-cyan-400' },
    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400' },
    { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function TagSection({ entityType, entityId, canEdit = true }: TagSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const {
    tags: allTags,
    fetchTags,
    fetchEntityTags,
    getEntityTags,
    isEntityTagsLoading,
    addTagToEntity,
    removeTagFromEntity,
  } = useTag();

  const entityTags = getEntityTags(entityType, entityId);
  const isLoading = isEntityTagsLoading(entityType, entityId);

  useEffect(() => {
    fetchEntityTags(entityType, entityId);
  }, [entityType, entityId]);

  useEffect(() => {
    if (isModalOpen) {
      fetchTags();
    }
  }, [isModalOpen]);

  const handleAddTag = async (tagName: string) => {
    if (!tagName.trim()) return;

    // Check if tag is already added
    if (entityTags.some((t) => t.name.toLowerCase() === tagName.toLowerCase().trim())) {
      setInputValue('');
      return;
    }

    setIsAdding(true);
    try {
      await addTagToEntity(entityType, entityId, tagName.trim());
      setInputValue('');
    } catch (error) {
      // Error handled in context
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await removeTagFromEntity(entityType, entityId, tagId);
    } catch (error) {
      // Error handled in context
    }
  };

  // Filter suggestions
  const suggestions = allTags
    .filter((tag) => !entityTags.some((et) => et.id === tag.id))
    .filter((tag) =>
      inputValue ? tag.name.toLowerCase().includes(inputValue.toLowerCase()) : true
    )
    .slice(0, 5);

  return (
    <View className="mb-4">
      <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
        Tags
      </ThemedText>

      <View className="flex-row flex-wrap gap-2 items-center">
        {isLoading && <ActivityIndicator size="small" />}

        {/* Display tags */}
        {entityTags.map((tag) => {
          const colors = getTagColor(tag.name);
          return (
            <View
              key={tag.id}
              className={`flex-row items-center rounded-full px-3 py-1 ${colors.bg}`}
            >
              <ThemedText className={`text-sm ${colors.text}`}>{tag.name}</ThemedText>
              {canEdit && (
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag.id)}
                  className="ml-1"
                >
                  <Icon name="X" size={14} className={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Add tag button */}
        {canEdit && (
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            className="flex-row items-center rounded-full px-3 py-1 bg-light-secondary dark:bg-dark-secondary"
          >
            <Icon name="Plus" size={14} className="text-light-subtext dark:text-dark-subtext" />
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext ml-1">
              Add
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Empty state */}
        {!canEdit && entityTags.length === 0 && !isLoading && (
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
            No tags
          </ThemedText>
        )}
      </View>

      {/* Add Tag Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-light-primary dark:bg-dark-primary">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-light-secondary dark:border-dark-secondary">
            <ThemedText className="text-xl font-bold">Add Tag</ThemedText>
            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
              <Icon name="X" size={24} />
            </TouchableOpacity>
          </View>

          <View className="px-4 py-4">
            {/* Input */}
            <View className="flex-row gap-2 mb-4">
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Type to search or create..."
                placeholderTextColor="#999"
                className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 text-base text-black dark:text-white"
                autoFocus
              />
              <TouchableOpacity
                onPress={() => handleAddTag(inputValue)}
                disabled={isAdding || !inputValue.trim()}
                className={`w-12 h-12 rounded-xl items-center justify-center ${
                  inputValue.trim() ? 'bg-blue-500' : 'bg-light-secondary dark:bg-dark-secondary'
                }`}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="Plus" size={20} color={inputValue.trim() ? '#fff' : '#999'} />
                )}
              </TouchableOpacity>
            </View>

            {/* Create new tag option */}
            {inputValue.trim() &&
              !allTags.some(
                (t) => t.name.toLowerCase() === inputValue.toLowerCase().trim()
              ) && (
                <TouchableOpacity
                  onPress={() => handleAddTag(inputValue)}
                  disabled={isAdding}
                  className="bg-light-secondary dark:bg-dark-secondary rounded-xl px-4 py-3 mb-4"
                >
                  <ThemedText className="text-base">
                    <ThemedText className="text-light-subtext dark:text-dark-subtext">Create: </ThemedText>
                    <ThemedText className="font-medium">{inputValue.trim()}</ThemedText>
                  </ThemedText>
                </TouchableOpacity>
              )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <View>
                <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-2">
                  {inputValue ? 'Matching tags' : 'Your tags'}
                </ThemedText>
                <ScrollView className="max-h-80">
                  {suggestions.map((tag) => {
                    const colors = getTagColor(tag.name);
                    return (
                      <TouchableOpacity
                        key={tag.id}
                        onPress={() => handleAddTag(tag.name)}
                        className="flex-row items-center py-3 border-b border-light-secondary dark:border-dark-secondary"
                      >
                        <View className={`rounded-full px-3 py-1 ${colors.bg}`}>
                          <ThemedText className={`text-sm ${colors.text}`}>{tag.name}</ThemedText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {!suggestions.length && !inputValue && (
              <ThemedText className="text-center text-light-subtext dark:text-dark-subtext py-4">
                Type to create a new tag
              </ThemedText>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
