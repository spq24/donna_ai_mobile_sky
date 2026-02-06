import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Tag } from '@/types/tag';
import { Alert } from 'react-native';

interface TagContextType {
  // All user tags
  tags: Tag[];
  isLoading: boolean;

  // Tags by entity
  entityTags: Record<string, Tag[]>;
  entityTagsLoading: Record<string, boolean>;

  // Actions
  fetchTags: (search?: string) => Promise<void>;
  fetchEntityTags: (entityType: 'task' | 'listitem', entityId: number) => Promise<void>;
  addTagToEntity: (entityType: 'task' | 'listitem', entityId: number, tagName: string) => Promise<void>;
  removeTagFromEntity: (entityType: 'task' | 'listitem', entityId: number, tagId: number) => Promise<void>;

  // Helpers
  getEntityTags: (entityType: 'task' | 'listitem', entityId: number) => Tag[];
  isEntityTagsLoading: (entityType: 'task' | 'listitem', entityId: number) => boolean;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

const getEntityKey = (entityType: string, entityId: number) => `${entityType}-${entityId}`;

export function TagProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entityTags, setEntityTags] = useState<Record<string, Tag[]>>({});
  const [entityTagsLoading, setEntityTagsLoading] = useState<Record<string, boolean>>({});

  const fetchTags = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.getTags({ search });
      setTags(response);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEntityTags = useCallback(async (entityType: 'task' | 'listitem', entityId: number) => {
    const key = getEntityKey(entityType, entityId);
    setEntityTagsLoading((prev) => ({ ...prev, [key]: true }));

    try {
      let result: Tag[];
      if (entityType === 'task') {
        result = await apiClient.getTaskTags(entityId);
      } else {
        result = [];
      }
      setEntityTags((prev) => ({ ...prev, [key]: result }));
    } catch (error) {
      console.error('Failed to fetch entity tags:', error);
    } finally {
      setEntityTagsLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const addTagToEntity = useCallback(async (
    entityType: 'task' | 'listitem',
    entityId: number,
    tagName: string
  ) => {
    const key = getEntityKey(entityType, entityId);
    try {
      let result: Tag[];
      if (entityType === 'task') {
        result = await apiClient.addTagToTaskByName(entityId, tagName);
      } else {
        result = [];
      }
      setEntityTags((prev) => ({ ...prev, [key]: result }));
      // Refresh user's tags list
      fetchTags();
    } catch (error: any) {
      console.error('Failed to add tag:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add tag');
      throw error;
    }
  }, [fetchTags]);

  const removeTagFromEntity = useCallback(async (
    entityType: 'task' | 'listitem',
    entityId: number,
    tagId: number
  ) => {
    const key = getEntityKey(entityType, entityId);
    try {
      let result: Tag[];
      if (entityType === 'task') {
        result = await apiClient.removeTagFromTask(entityId, tagId);
      } else {
        result = [];
      }
      setEntityTags((prev) => ({ ...prev, [key]: result }));
    } catch (error: any) {
      console.error('Failed to remove tag:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to remove tag');
      throw error;
    }
  }, []);

  const getEntityTags = useCallback((entityType: 'task' | 'listitem', entityId: number) => {
    const key = getEntityKey(entityType, entityId);
    return entityTags[key] || [];
  }, [entityTags]);

  const isEntityTagsLoading = useCallback((entityType: 'task' | 'listitem', entityId: number) => {
    const key = getEntityKey(entityType, entityId);
    return entityTagsLoading[key] || false;
  }, [entityTagsLoading]);

  const value = {
    tags,
    isLoading,
    entityTags,
    entityTagsLoading,
    fetchTags,
    fetchEntityTags,
    addTagToEntity,
    removeTagFromEntity,
    getEntityTags,
    isEntityTagsLoading,
  };

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
}

export function useTag() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTag must be used within a TagProvider');
  }
  return context;
}
