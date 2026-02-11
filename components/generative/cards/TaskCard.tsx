import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import { Chip } from '@/components/shared/Chip';
import { TaskCardProps, CardMode } from '@/types/generative-ui';

// Priority color mapping
const priorityColors: Record<string, { bg: string; text: string }> = {
  urgent: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-300' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-600 dark:text-orange-300' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-300' },
  low: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' },
};

// Status color mapping
const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  queued: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300' },
  in_progress: { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-600 dark:text-cyan-300' },
  waiting_input: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-300' },
  completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' },
  failed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-300' },
  cancelled: { bg: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400' },
};

function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatStatus(status?: string): string {
  if (!status) return 'Pending';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * TaskCard Component - Displays task information in view, detail, or form mode
 */
export function TaskCard({
  id,
  title,
  description,
  status = 'pending',
  priority = 'medium',
  due_date,
  assignee_type,
  assigned_to,
  tags = [],
  attachments_count = 0,
  comments_count = 0,
  mode = 'view',
  onModeChange,
  onPress,
}: TaskCardProps) {
  const priorityStyle = priorityColors[priority.toLowerCase()] || priorityColors.medium;
  const statusStyle = statusColors[status.toLowerCase()] || statusColors.pending;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  // View Mode - Compact card
  if (mode === 'view') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-muted dark:bg-darkMuted rounded-2xl p-4"
      >
        {/* Tags row */}
        {tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} className="bg-background dark:bg-darkBackground rounded-md px-2 py-0.5">
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {tag}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Title */}
        <ThemedText className="text-base font-semibold mb-1" numberOfLines={1}>
          {title}
        </ThemedText>

        {/* Description snippet */}
        {description && (
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-3" numberOfLines={2}>
            {description}
          </ThemedText>
        )}

        {/* Bottom row: Avatar + attachments + comments */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            {assignee_type === 'ai_agent' ? (
              <View className="w-6 h-6 rounded-full bg-purple-500 items-center justify-center">
                <Icon name="Bot" size={14} color="#fff" />
              </View>
            ) : (
              <Avatar size="xxs" name={assigned_to || 'U'} />
            )}
            <View className={`rounded-full px-2 py-0.5 ${statusStyle.bg}`}>
              <ThemedText className={`text-xs ${statusStyle.text}`}>
                {formatStatus(status)}
              </ThemedText>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            {due_date && (
              <View className="flex-row items-center gap-1">
                <Icon name="Calendar" size={14} />
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {formatDate(due_date)}
                </ThemedText>
              </View>
            )}
            {attachments_count > 0 && (
              <View className="flex-row items-center gap-1">
                <Icon name="Paperclip" size={14} />
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {attachments_count}
                </ThemedText>
              </View>
            )}
            {comments_count > 0 && (
              <View className="flex-row items-center gap-1">
                <Icon name="MessageCircle" size={14} />
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {comments_count}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Detail Mode - Expanded card
  if (mode === 'detail') {
    return (
      <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
        {/* Header with close button */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Icon name="CheckSquare" size={20} />
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
              Task #{id}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => onModeChange?.('view')}>
            <Icon name="X" size={20} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <ThemedText className="text-lg font-bold mb-3">{title}</ThemedText>

        {/* Status row */}
        <View className="flex-row items-center gap-2 mb-3">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-20">
            Status
          </ThemedText>
          <View className={`rounded-full px-3 py-1 ${statusStyle.bg}`}>
            <ThemedText className={`text-sm ${statusStyle.text}`}>
              {formatStatus(status)}
            </ThemedText>
          </View>
        </View>

        {/* Priority row */}
        <View className="flex-row items-center gap-2 mb-3">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-20">
            Priority
          </ThemedText>
          <View className={`rounded-full px-3 py-1 ${priorityStyle.bg}`}>
            <ThemedText className={`text-sm ${priorityStyle.text}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </ThemedText>
          </View>
        </View>

        {/* Due date row */}
        {due_date && (
          <View className="flex-row items-center gap-2 mb-3">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-20">
              Due Date
            </ThemedText>
            <View className="flex-row items-center gap-2">
              <Icon name="Calendar" size={16} />
              <ThemedText className="text-sm">{formatDate(due_date)}</ThemedText>
            </View>
          </View>
        )}

        {/* Assignee row */}
        <View className="flex-row items-center gap-2 mb-3">
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground w-20">
            Assignee
          </ThemedText>
          <View className="flex-row items-center gap-2">
            {assignee_type === 'ai_agent' ? (
              <>
                <View className="w-6 h-6 rounded-full bg-purple-500 items-center justify-center">
                  <Icon name="Bot" size={14} color="#fff" />
                </View>
                <ThemedText className="text-sm">AI Agent</ThemedText>
              </>
            ) : (
              <>
                <Avatar size="xxs" name={assigned_to || 'U'} />
                <ThemedText className="text-sm">{assigned_to || 'Unassigned'}</ThemedText>
              </>
            )}
          </View>
        </View>

        {/* Tags row */}
        {tags.length > 0 && (
          <View className="mb-3">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
              Tags
            </ThemedText>
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <Chip key={idx} label={tag} size="sm" />
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {description && (
          <View className="mb-3">
            <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
              Description
            </ThemedText>
            <ThemedText className="text-sm">{description}</ThemedText>
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={() => onModeChange?.('form')}
            className="flex-1 bg-background dark:bg-darkBackground rounded-xl py-2 items-center"
          >
            <ThemedText className="text-sm font-medium">Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-green-500 rounded-xl py-2 items-center"
          >
            <ThemedText className="text-sm font-medium text-white">Complete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Form Mode - Editable card
  return (
    <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <ThemedText className="text-lg font-bold">Edit Task</ThemedText>
        <TouchableOpacity onPress={() => onModeChange?.('detail')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* Title input */}
      <View className="mb-3">
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
          Title
        </ThemedText>
        <TextInput
          className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2 text-foreground dark:text-darkForeground"
          defaultValue={title}
          placeholder="Task title"
          placeholderTextColor="#999"
        />
      </View>

      {/* Description input */}
      <View className="mb-3">
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
          Description
        </ThemedText>
        <TextInput
          className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2 text-foreground dark:text-darkForeground"
          defaultValue={description || ''}
          placeholder="Description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Priority selector */}
      <View className="mb-3">
        <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-2">
          Priority
        </ThemedText>
        <View className="flex-row gap-2">
          {['low', 'medium', 'high', 'urgent'].map((p) => (
            <TouchableOpacity
              key={p}
              className={`flex-1 rounded-xl py-2 items-center ${
                priority.toLowerCase() === p
                  ? priorityColors[p].bg
                  : 'bg-background dark:bg-darkBackground'
              }`}
            >
              <ThemedText
                className={`text-sm ${
                  priority.toLowerCase() === p
                    ? priorityColors[p].text
                    : 'text-muted-foreground dark:text-darkMutedForeground'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity
          onPress={() => onModeChange?.('detail')}
          className="flex-1 bg-background dark:bg-darkBackground rounded-xl py-3 items-center"
        >
          <ThemedText className="text-sm font-medium">Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl py-3 items-center">
          <ThemedText className="text-sm font-medium text-white">Save</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default TaskCard;
