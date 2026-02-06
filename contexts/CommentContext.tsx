import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  Comment,
  CommentWithReplies,
  CommentableType,
  CommentCreateRequest,
  CommentListResponse,
} from '@/types/comment';
import { Alert } from 'react-native';

interface CommentContextType {
  // State - comments are stored by entity key
  comments: Record<string, CommentWithReplies[]>;
  isLoading: Record<string, boolean>;

  // UI State
  replyingTo: string | null;
  editingComment: string | null;

  // Actions
  fetchComments: (type: CommentableType, id: number) => Promise<void>;
  createComment: (data: CommentCreateRequest) => Promise<Comment | null>;
  updateComment: (commentId: string, data: { content: string; mentioned_user_ids?: number[] }, type: CommentableType, id: number) => Promise<void>;
  deleteComment: (commentId: string, type: CommentableType, id: number) => Promise<void>;
  setReplyingTo: (commentId: string | null) => void;
  setEditingComment: (commentId: string | null) => void;

  // Helpers
  getCommentsForEntity: (type: CommentableType, id: number) => CommentWithReplies[];
  getCommentCount: (type: CommentableType, id: number) => number;
  isLoadingForEntity: (type: CommentableType, id: number) => boolean;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export function CommentProvider({ children }: { children: React.ReactNode }) {
  const [comments, setComments] = useState<Record<string, CommentWithReplies[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);

  const getEntityKey = useCallback((type: CommentableType, id: number) => {
    return `${type}-${id}`;
  }, []);

  const fetchComments = useCallback(async (type: CommentableType, id: number) => {
    const key = getEntityKey(type, id);
    setIsLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const response: CommentListResponse = await apiClient.getComments({
        commentable_type: type,
        commentable_id: id,
        include_replies: true,
      });

      setComments((prev) => ({ ...prev, [key]: response.comments }));
    } catch (error: any) {
      console.error('Failed to fetch comments:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to fetch comments');
    } finally {
      setIsLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, [getEntityKey]);

  const createComment = useCallback(async (data: CommentCreateRequest): Promise<Comment | null> => {
    try {
      const response: Comment = await apiClient.createComment(data);
      const key = getEntityKey(data.commentable_type, data.commentable_id);

      // If this is a reply, add it to the parent comment's replies
      if (data.parent_comment_id) {
        setComments((prev) => ({
          ...prev,
          [key]: prev[key]?.map((comment) => {
            if (comment.id === data.parent_comment_id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response],
                reply_count: (comment.reply_count || 0) + 1,
              };
            }
            return comment;
          }) || [],
        }));
        setReplyingTo(null);
      } else {
        // Top-level comment - add to beginning of list
        const newComment: CommentWithReplies = {
          ...response,
          replies: [],
        };
        setComments((prev) => ({
          ...prev,
          [key]: [newComment, ...(prev[key] || [])],
        }));
      }

      return response;
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add comment');
      return null;
    }
  }, [getEntityKey]);

  const updateComment = useCallback(async (
    commentId: string,
    data: { content: string; mentioned_user_ids?: number[] },
    type: CommentableType,
    id: number
  ) => {
    try {
      const response: Comment = await apiClient.updateComment(commentId, data);
      const key = getEntityKey(type, id);

      setComments((prev) => ({
        ...prev,
        [key]: prev[key]?.map((comment) => {
          // Check if this is the comment to update
          if (comment.id === commentId) {
            return { ...comment, ...response };
          }
          // Check if the comment to update is in replies
          return {
            ...comment,
            replies: comment.replies?.map((reply) =>
              reply.id === commentId ? { ...reply, ...response } : reply
            ) || [],
          };
        }) || [],
      }));

      setEditingComment(null);
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update comment');
      throw error;
    }
  }, [getEntityKey]);

  const deleteComment = useCallback(async (
    commentId: string,
    type: CommentableType,
    id: number
  ) => {
    try {
      await apiClient.deleteComment(commentId);
      const key = getEntityKey(type, id);

      setComments((prev) => ({
        ...prev,
        [key]: prev[key]?.filter((comment) => {
          if (comment.id === commentId) {
            return false;
          }
          return true;
        }).map((comment) => ({
          ...comment,
          replies: comment.replies?.filter((reply) => reply.id !== commentId) || [],
          reply_count: comment.replies?.filter((reply) => reply.id !== commentId).length || 0,
        })) || [],
      }));
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to delete comment');
      throw error;
    }
  }, [getEntityKey]);

  const getCommentsForEntity = useCallback((type: CommentableType, id: number) => {
    const key = getEntityKey(type, id);
    return comments[key] || [];
  }, [comments, getEntityKey]);

  const getCommentCount = useCallback((type: CommentableType, id: number) => {
    const entityComments = getCommentsForEntity(type, id);
    return entityComments.reduce(
      (total, comment) => total + 1 + (comment.replies?.length || 0),
      0
    );
  }, [getCommentsForEntity]);

  const isLoadingForEntity = useCallback((type: CommentableType, id: number) => {
    const key = getEntityKey(type, id);
    return isLoading[key] || false;
  }, [isLoading, getEntityKey]);

  const value = {
    comments,
    isLoading,
    replyingTo,
    editingComment,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    setReplyingTo,
    setEditingComment,
    getCommentsForEntity,
    getCommentCount,
    isLoadingForEntity,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}

export function useComment() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
}
