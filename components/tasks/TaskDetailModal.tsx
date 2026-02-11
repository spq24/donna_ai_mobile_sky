import React, { useState } from 'react';
import { View, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Task, useTask } from '@/contexts/TaskContext';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import { Chip } from '@/components/shared/Chip';
import CommentSection from '@/components/comments/CommentSection';
import TagSection from '@/components/tags/TagSection';
import { MentionDisplay } from '@/components/mentions';
import { format } from 'date-fns';

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  high: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
  },
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  queued: 'Queued',
  in_progress: 'In Progress',
  waiting_input: 'Waiting Input',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  active: 'Active',
  success: 'Success',
  failed_no_contact: 'No Contact',
  failed_no_slot: 'No Slot',
  failed_other: 'Failed',
};

interface TaskDetailModalProps {
  task: Task | null;
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function TaskDetailModal({ task, isVisible, onClose, onEdit }: TaskDetailModalProps) {
  const { completeTask, cancelTask, deleteTask } = useTask();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!task) return null;

  const priorityStyle = priorityColors[task.priority.toLowerCase()] || priorityColors.medium;

  const handleComplete = async () => {
    setIsProcessing(true);
    const success = await completeTask(task.id);
    setIsProcessing(false);
    if (success) onClose();
  };

  const handleCancel = async () => {
    Alert.alert('Cancel Task', 'Are you sure you want to cancel this task?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setIsProcessing(true);
          const success = await cancelTask(task.id);
          setIsProcessing(false);
          if (success) onClose();
        },
      },
    ]);
  };

  const handleDelete = async () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsProcessing(true);
          const success = await deleteTask(task.id);
          setIsProcessing(false);
          if (success) onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-background dark:bg-darkBackground">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-border dark:border-darkBorder">
          <View className="flex-row items-center gap-2">
            <Icon name="CheckSquare" size={24} />
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
              Task #{task.id}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={onClose} disabled={isProcessing}>
            <Icon name="X" size={24} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4">
          {/* Title */}
          <ThemedText className="text-2xl font-bold mb-4">{task.title}</ThemedText>

          {/* Status */}
          <View className="mb-4">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
              Status
            </ThemedText>
            <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
              <ThemedText className="text-base">
                {statusLabels[task.status] || task.status}
              </ThemedText>
            </View>
          </View>

          {/* Priority */}
          <View className="mb-4">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
              Priority
            </ThemedText>
            <View className={`rounded-xl px-3 py-2 self-start ${priorityStyle.bg}`}>
              <ThemedText className={`text-base font-medium ${priorityStyle.text}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </ThemedText>
            </View>
          </View>

          {/* Due Date */}
          {task.due_date && (
            <View className="mb-4">
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Due Date
              </ThemedText>
              <View className="flex-row items-center gap-2 bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
                <Icon name="Calendar" size={18} />
                <ThemedText className="text-base">
                  {format(new Date(task.due_date), 'MMMM d, yyyy')}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Assignee */}
          <View className="mb-4">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
              Assignee
            </ThemedText>
            <View className="flex-row items-center gap-3 bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
              {task.assignee_type === 'ai_agent' ? (
                <>
                  <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center">
                    <Icon name="Bot" size={16} color="#fff" />
                  </View>
                  <ThemedText className="text-base">AI Agent</ThemedText>
                </>
              ) : task.assignee_type === 'user' ? (
                <>
                  <Avatar size="xs" name="U" />
                  <ThemedText className="text-base">User</ThemedText>
                </>
              ) : (
                <ThemedText className="text-base text-muted-foreground dark:text-darkMutedForeground">
                  Unassigned
                </ThemedText>
              )}
            </View>
          </View>

          {/* Intent */}
          {task.intent && (
            <View className="mb-4">
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Intent
              </ThemedText>
              <Chip label={task.intent} />
            </View>
          )}

          {/* Tags */}
          <TagSection
            entityType="task"
            entityId={task.id}
            canEdit={true}
          />

          {/* Description */}
          {task.description && (
            <View className="mb-4">
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Description
              </ThemedText>
              <View className="bg-muted dark:bg-darkMuted rounded-xl p-3">
                <MentionDisplay content={task.description} />
              </View>
            </View>
          )}

          {/* Created At */}
          <View className="mb-4">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
              Created
            </ThemedText>
            <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
              <ThemedText className="text-base">
                {format(new Date(task.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
              </ThemedText>
            </View>
          </View>

          {/* Completed At */}
          {task.completed_at && (
            <View className="mb-4">
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
                Completed
              </ThemedText>
              <View className="bg-muted dark:bg-darkMuted rounded-xl px-3 py-2">
                <ThemedText className="text-base">
                  {format(new Date(task.completed_at), 'MMMM d, yyyy \'at\' h:mm a')}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Comments Section */}
          <CommentSection
            commentableType="task"
            commentableId={task.id}
          />
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-border dark:border-darkBorder gap-3">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onEdit}
              disabled={isProcessing}
              className="flex-1 bg-muted dark:bg-darkMuted rounded-xl py-3 items-center"
            >
              <ThemedText className="text-base font-medium">Edit</ThemedText>
            </TouchableOpacity>
            {task.status !== 'completed' && task.status !== 'success' && (
              <TouchableOpacity
                onPress={handleComplete}
                disabled={isProcessing}
                className="flex-1 bg-green-500 rounded-xl py-3 items-center"
              >
                <ThemedText className="text-base font-medium text-white">
                  {isProcessing ? 'Processing...' : 'Complete'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row gap-3">
            {task.status !== 'cancelled' && (
              <TouchableOpacity
                onPress={handleCancel}
                disabled={isProcessing}
                className="flex-1 bg-orange-500 rounded-xl py-3 items-center"
              >
                <ThemedText className="text-base font-medium text-white">Cancel</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isProcessing}
              className="flex-1 bg-red-500 rounded-xl py-3 items-center"
            >
              <ThemedText className="text-base font-medium text-white">Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
