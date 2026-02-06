import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useComment } from '@/contexts/CommentContext';
import { useAuth } from '@/contexts/AuthContext';
import { CommentableType, CommentWithReplies, Comment } from '@/types/comment';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { MentionInput, MentionDisplay, MentionPlainText } from '@/components/mentions';
import { parseMentions } from '@/types/mention';

interface CommentSectionProps {
  commentableType: CommentableType;
  commentableId: number;
}

function getInitials(name?: string | null, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.charAt(0).toUpperCase() || '?';
}

interface CommentItemProps {
  comment: Comment;
  commentableType: CommentableType;
  commentableId: number;
  isReply?: boolean;
  onReply?: (commentId: string) => void;
}

function CommentItem({ comment, commentableType, commentableId, isReply = false, onReply }: CommentItemProps) {
  const { user } = useAuth();
  const { deleteComment, updateComment, editingComment, setEditingComment } = useComment();
  const [editContent, setEditContent] = useState(comment.content);
  const [editMentionedUserIds, setEditMentionedUserIds] = useState<number[]>(comment.mentioned_user_ids || []);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const isEditing = editingComment === comment.id;
  const displayName = comment.user?.full_name || comment.user?.email || 'Unknown';
  const timestamp = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });

  const handleEdit = () => {
    setEditContent(comment.content);
    setEditMentionedUserIds(comment.mentioned_user_ids || []);
    setEditingComment(comment.id);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent(comment.content);
    setEditMentionedUserIds(comment.mentioned_user_ids || []);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    try {
      await updateComment(comment.id, editContent.trim(), commentableType, commentableId, editMentionedUserIds);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?' +
        (!isReply && comment.reply_count > 0 ? `\n\nThis will also delete ${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}.` : ''),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteComment(comment.id, commentableType, commentableId),
        },
      ]
    );
  };

  return (
    <View className={`py-3 ${isReply ? 'ml-8 pl-3 border-l-2 border-light-secondary dark:border-dark-secondary' : ''}`}>
      <View className="flex-row gap-3">
        <Avatar size="xs" name={getInitials(comment.user?.full_name, comment.user?.email)} />
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <ThemedText className="text-sm font-medium">{displayName}</ThemedText>
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">{timestamp}</ThemedText>
            {comment.is_edited && (
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext italic">(edited)</ThemedText>
            )}
          </View>

          {isEditing ? (
            <View className="mt-2">
              <View className="bg-light-secondary dark:bg-dark-secondary rounded-xl min-h-[60px]">
                <MentionInput
                  value={editContent}
                  onChange={(text, mentionedIds) => {
                    setEditContent(text);
                    setEditMentionedUserIds(mentionedIds);
                  }}
                  placeholder="Edit your comment..."
                  multiline
                />
              </View>
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-3 py-1 rounded-lg bg-light-secondary dark:bg-dark-secondary"
                >
                  <ThemedText className="text-sm">Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  disabled={isUpdating || !editContent.trim()}
                  className="px-3 py-1 rounded-lg bg-blue-500"
                >
                  <ThemedText className="text-sm text-white">
                    {isUpdating ? 'Saving...' : 'Save'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="mt-1">
              <MentionDisplay content={comment.content} />
            </View>
          )}

          {/* Actions */}
          {!isEditing && (
            <View className="flex-row gap-4 mt-2">
              {!isReply && onReply && (
                <TouchableOpacity onPress={() => onReply(comment.id)}>
                  <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">Reply</ThemedText>
                </TouchableOpacity>
              )}
              {isOwner && (
                <>
                  <TouchableOpacity onPress={handleEdit}>
                    <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">Edit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete}>
                    <ThemedText className="text-xs text-red-500">Delete</ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function CommentSection({ commentableType, commentableId }: CommentSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newCommentMentionedUserIds, setNewCommentMentionedUserIds] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyMentionedUserIds, setReplyMentionedUserIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    fetchComments,
    createComment,
    getCommentsForEntity,
    isLoadingForEntity,
  } = useComment();

  const comments = getCommentsForEntity(commentableType, commentableId);
  const isLoading = isLoadingForEntity(commentableType, commentableId);

  useEffect(() => {
    fetchComments(commentableType, commentableId);
  }, [commentableType, commentableId]);

  const totalCount = comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  );

  const firstComment = comments[0];
  const hasMoreComments = comments.length > 1 || (firstComment?.replies?.length || 0) > 0;

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await createComment({
        content: newComment.trim(),
        commentable_type: commentableType,
        commentable_id: commentableId,
        mentioned_user_ids: newCommentMentionedUserIds,
      });
      setNewComment('');
      setNewCommentMentionedUserIds([]);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await createComment({
        content: replyContent.trim(),
        commentable_type: commentableType,
        commentable_id: commentableId,
        parent_comment_id: parentId,
        mentioned_user_ids: replyMentionedUserIds,
      });
      setReplyContent('');
      setReplyMentionedUserIds([]);
      setReplyingTo(null);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
    setReplyMentionedUserIds([]);
  };

  if (isLoading && comments.length === 0) {
    return (
      <View className="py-4 border-t border-light-secondary dark:border-dark-secondary mt-4">
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" />
          <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
            Loading comments...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View className="py-4 border-t border-light-secondary dark:border-dark-secondary mt-4">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-3">
        <Icon name="MessageSquare" size={16} className="text-light-subtext dark:text-dark-subtext" />
        <ThemedText className="text-sm font-medium">
          {totalCount === 0 ? 'Comments' : `${totalCount} ${totalCount === 1 ? 'comment' : 'comments'}`}
        </ThemedText>
      </View>

      {/* Comment Input */}
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl min-h-[40px]">
          <MentionInput
            value={newComment}
            onChange={(text, mentionedIds) => {
              setNewComment(text);
              setNewCommentMentionedUserIds(mentionedIds);
            }}
            placeholder="Add a comment..."
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={handleSubmitComment}
          disabled={isSubmitting || !newComment.trim()}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            newComment.trim() ? 'bg-blue-500' : 'bg-light-secondary dark:bg-dark-secondary'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="Send" size={16} color={newComment.trim() ? '#fff' : '#999'} />
          )}
        </TouchableOpacity>
      </View>

      {/* Comments */}
      {comments.length === 0 ? (
        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext">
          No comments yet. Be the first to comment!
        </ThemedText>
      ) : showAll ? (
        <View>
          {comments.map((comment: CommentWithReplies) => (
            <View key={comment.id}>
              <CommentItem
                comment={comment}
                commentableType={commentableType}
                commentableId={commentableId}
                onReply={handleReply}
              />

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <View className="ml-8 pl-3 border-l-2 border-light-secondary dark:border-dark-secondary py-2">
                  <View className="flex-row gap-2">
                    <View className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl min-h-[40px]">
                      <MentionInput
                        value={replyContent}
                        onChange={(text, mentionedIds) => {
                          setReplyContent(text);
                          setReplyMentionedUserIds(mentionedIds);
                        }}
                        placeholder="Write a reply..."
                        multiline
                        autoFocus
                      />
                    </View>
                  </View>
                  <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity
                      onPress={() => setReplyingTo(null)}
                      className="px-3 py-1 rounded-lg bg-light-secondary dark:bg-dark-secondary"
                    >
                      <ThemedText className="text-sm">Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleSubmitReply(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                      className="px-3 py-1 rounded-lg bg-blue-500"
                    >
                      <ThemedText className="text-sm text-white">
                        {isSubmitting ? 'Sending...' : 'Reply'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  commentableType={commentableType}
                  commentableId={commentableId}
                  isReply
                />
              ))}
            </View>
          ))}

          {hasMoreComments && (
            <TouchableOpacity onPress={() => setShowAll(false)} className="mt-2">
              <ThemedText className="text-xs text-blue-500">Show less</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View>
          {firstComment && (
            <CommentItem
              comment={firstComment}
              commentableType={commentableType}
              commentableId={commentableId}
              onReply={handleReply}
            />
          )}

          {/* Reply Input for first comment */}
          {replyingTo === firstComment?.id && (
            <View className="ml-8 pl-3 border-l-2 border-light-secondary dark:border-dark-secondary py-2">
              <View className="flex-row gap-2">
                <View className="flex-1 bg-light-secondary dark:bg-dark-secondary rounded-xl min-h-[40px]">
                  <MentionInput
                    value={replyContent}
                    onChange={(text, mentionedIds) => {
                      setReplyContent(text);
                      setReplyMentionedUserIds(mentionedIds);
                    }}
                    placeholder="Write a reply..."
                    multiline
                    autoFocus
                  />
                </View>
              </View>
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => setReplyingTo(null)}
                  className="px-3 py-1 rounded-lg bg-light-secondary dark:bg-dark-secondary"
                >
                  <ThemedText className="text-sm">Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSubmitReply(firstComment.id)}
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-3 py-1 rounded-lg bg-blue-500"
                >
                  <ThemedText className="text-sm text-white">
                    {isSubmitting ? 'Sending...' : 'Reply'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {hasMoreComments && (
            <TouchableOpacity onPress={() => setShowAll(true)} className="mt-2">
              <ThemedText className="text-xs text-blue-500">
                Show {totalCount - 1} more {totalCount - 1 === 1 ? 'comment' : 'comments'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
